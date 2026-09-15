#include "redis_client.hpp"

#include <chrono>
#include <stdexcept>
#include <utility>

namespace risk {

RedisClient::RedisClient(
    std::string redisUrl,
    std::size_t poolSize,
    int connectionTimeoutMs
)
    : redisUrl_(std::move(redisUrl)),
      endpoint_(parseRedisUrl(redisUrl_)),
      poolSize_(poolSize),
      connectionTimeoutMs_(connectionTimeoutMs) {

    if (poolSize_ == 0) {
        throw std::invalid_argument(
            "Redis connection pool size must be greater than zero"
        );
    }

    if (connectionTimeoutMs_ <= 0) {
        throw std::invalid_argument(
            "Redis connection timeout must be greater than zero"
        );
    }

    initializePool();
}

RedisClient::~RedisClient() {
    {
        std::lock_guard<std::mutex> lock(poolMutex_);
        shuttingDown_ = true;
    }

    poolCondition_.notify_all();

    for (redisContext* context : allConnections_) {
        if (context != nullptr) {
            redisFree(context);
        }
    }

    allConnections_.clear();
    availableConnections_.clear();
}


// Execute
RedisReplyPtr RedisClient::execute(
    const std::vector<std::string>& arguments
) {
    if (arguments.empty()) {
        throw std::invalid_argument(
            "Redis command cannot be empty"
        );
    }

    auto lease = acquireConnection();

    std::vector<const char*> argv;
    std::vector<std::size_t> argvLength;

    argv.reserve(arguments.size());
    argvLength.reserve(arguments.size());

    for (const auto& argument : arguments) {
        argv.push_back(argument.data());
        argvLength.push_back(argument.size());
    }

    void* rawReply = redisCommandArgv(
        lease.get(),
        static_cast<int>(arguments.size()),
        argv.data(),
        argvLength.data()
    );

    if (rawReply == nullptr) {
        const std::string error =
            lease.get() != nullptr
                ? lease.get()->errstr
                : "unknown Redis error";

        throw std::runtime_error(
            "Redis command failed: " + error
        );
    }

    RedisReplyPtr reply(
        static_cast<redisReply*>(rawReply)
    );

    validateReply(reply.get());

    return reply;
}

// Health Check
bool RedisClient::healthy() {
    try {
        const auto reply =
            execute({"PING"});

        return
            reply != nullptr &&
            reply->type == REDIS_REPLY_STATUS &&
            reply->str != nullptr &&
            std::string(reply->str, reply->len) == "PONG";
    }
    catch (...) {
        return false;
    }
}

// Pool Initialization
void RedisClient::initializePool() {
    allConnections_.reserve(poolSize_);
    availableConnections_.reserve(poolSize_);

    try {
        for (std::size_t index = 0;
             index < poolSize_;
             ++index) {

            redisContext* context =
                createConnection();

            allConnections_.push_back(context);
            availableConnections_.push_back(context);
        }
    }
    catch (...) {
        for (redisContext* context : allConnections_) {
            if (context != nullptr) {
                redisFree(context);
            }
        }

        allConnections_.clear();
        availableConnections_.clear();

        throw;
    }
}

// Create Connection
redisContext* RedisClient::createConnection() const {
    timeval timeout{};

    timeout.tv_sec =
        connectionTimeoutMs_ / 1000;

    timeout.tv_usec =
        (connectionTimeoutMs_ % 1000) * 1000;

    redisContext* context =
        redisConnectWithTimeout(
            endpoint_.host.c_str(),
            endpoint_.port,
            timeout
        );

    if (context == nullptr) {
        throw std::runtime_error(
            "Unable to allocate Redis connection"
        );
    }

    if (context->err != 0) {
        const std::string error =
            context->errstr;

        redisFree(context);

        throw std::runtime_error(
            "Unable to connect to Redis: " + error
        );
    }

    return context;
}

// Acquire Connection
RedisClient::ConnectionLease
RedisClient::acquireConnection() {
    std::unique_lock<std::mutex> lock(
        poolMutex_
    );

    poolCondition_.wait(
        lock,
        [this]() {
            return
                shuttingDown_ ||
                !availableConnections_.empty();
        }
    );

    if (shuttingDown_) {
        throw std::runtime_error(
            "Redis client is shutting down"
        );
    }

    redisContext* context =
        availableConnections_.back();

    availableConnections_.pop_back();

    return ConnectionLease(
        *this,
        context
    );
}

// Release Connection
void RedisClient::releaseConnection(
    redisContext* context
) noexcept {
    if (context == nullptr) {
        return;
    }

    {
        std::lock_guard<std::mutex> lock(
            poolMutex_
        );

        if (shuttingDown_) {
            return;
        }

        availableConnections_.push_back(
            context
        );
    }

    poolCondition_.notify_one();
}

// URL Parsing
RedisClient::RedisEndpoint
RedisClient::parseRedisUrl(
    const std::string& url
) {
    constexpr const char* prefix =
        "redis://";

    std::string value = url;

    if (value.rfind(prefix, 0) == 0) {
        value.erase(
            0,
            std::char_traits<char>::length(prefix)
        );
    }

    const auto colonPosition =
        value.rfind(':');

    if (colonPosition == std::string::npos) {
        return RedisEndpoint{
            value,
            6379
        };
    }

    const std::string host =
        value.substr(
            0,
            colonPosition
        );

    const std::string portString =
        value.substr(
            colonPosition + 1
        );

    if (host.empty()) {
        throw std::invalid_argument(
            "Redis host cannot be empty"
        );
    }

    int port;

    try {
        port = std::stoi(portString);
    }
    catch (...) {
        throw std::invalid_argument(
            "Invalid Redis port"
        );
    }

    if (port <= 0 || port > 65535) {
        throw std::invalid_argument(
            "Redis port must be between 1 and 65535"
        );
    }

    return RedisEndpoint{
        host,
        port
    };
}

// Reply Validation
void RedisClient::validateReply(
    const redisReply* reply
) {
    if (reply == nullptr) {
        throw std::runtime_error(
            "Redis returned an empty reply"
        );
    }

    if (reply->type == REDIS_REPLY_ERROR) {
        const std::string error =
            reply->str != nullptr
                ? std::string(
                    reply->str,
                    reply->len
                )
                : "unknown Redis error";

        throw std::runtime_error(
            "Redis error: " + error
        );
    }
}

// ConnectionLease
RedisClient::ConnectionLease::ConnectionLease(
    RedisClient& owner,
    redisContext* context
)
    : owner_(&owner),
      context_(context) {
}

RedisClient::ConnectionLease::~ConnectionLease() {
    if (owner_ != nullptr &&
        context_ != nullptr) {

        owner_->releaseConnection(
            context_
        );
    }
}

RedisClient::ConnectionLease::ConnectionLease(
    ConnectionLease&& other
) noexcept
    : owner_(other.owner_),
      context_(other.context_) {

    other.owner_ = nullptr;
    other.context_ = nullptr;
}

RedisClient::ConnectionLease&
RedisClient::ConnectionLease::operator=(
    ConnectionLease&& other
) noexcept {
    if (this == &other) {
        return *this;
    }

    if (owner_ != nullptr &&
        context_ != nullptr) {

        owner_->releaseConnection(
            context_
        );
    }

    owner_ = other.owner_;
    context_ = other.context_;

    other.owner_ = nullptr;
    other.context_ = nullptr;

    return *this;
}

redisContext*
RedisClient::ConnectionLease::get() const noexcept {
    return context_;
}

}