#pragma once

#include <hiredis/hiredis.h>

#include <condition_variable>
#include <cstddef>
#include <memory>
#include <mutex>
#include <string>
#include <vector>

namespace risk {

struct RedisReplyDeleter {
    void operator()(redisReply* reply) const noexcept {
        if (reply != nullptr) {
            freeReplyObject(reply);
        }
    }
};

using RedisReplyPtr =
    std::unique_ptr<redisReply, RedisReplyDeleter>;

class RedisClient {
public:
    explicit RedisClient(
        std::string redisUrl,
        std::size_t poolSize = 4,
        int connectionTimeoutMs = 50
    );

    ~RedisClient();

    RedisClient(const RedisClient&) = delete;
    RedisClient& operator=(const RedisClient&) = delete;

    RedisClient(RedisClient&&) = delete;
    RedisClient& operator=(RedisClient&&) = delete;

    [[nodiscard]]
    RedisReplyPtr execute(
        const std::vector<std::string>& arguments
    );

    [[nodiscard]]
    bool healthy();

private:
    class ConnectionLease {
    public:
        ConnectionLease(
            RedisClient& owner,
            redisContext* context
        );

        ~ConnectionLease();

        ConnectionLease(const ConnectionLease&) = delete;
        ConnectionLease& operator=(const ConnectionLease&) = delete;

        ConnectionLease(ConnectionLease&& other) noexcept;
        ConnectionLease& operator=(
            ConnectionLease&& other
        ) noexcept;

        [[nodiscard]]
        redisContext* get() const noexcept;

    private:
        RedisClient* owner_;
        redisContext* context_;
    };

private:
    struct RedisEndpoint {
        std::string host;
        int port;
    };

    std::string redisUrl_;
    RedisEndpoint endpoint_;

    std::size_t poolSize_;
    int connectionTimeoutMs_;

    std::vector<redisContext*> allConnections_;
    std::vector<redisContext*> availableConnections_;

    std::mutex poolMutex_;
    std::condition_variable poolCondition_;

    bool shuttingDown_{false};

private:
    [[nodiscard]]
    static RedisEndpoint parseRedisUrl(
        const std::string& url
    );

    [[nodiscard]]
    redisContext* createConnection() const;

    [[nodiscard]]
    ConnectionLease acquireConnection();

    void releaseConnection(
        redisContext* context
    ) noexcept;

    void initializePool();

    static void validateReply(
        const redisReply* reply
    );
};

} 