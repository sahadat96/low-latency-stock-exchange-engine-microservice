#include "position_cache.hpp"

#include <stdexcept>

namespace risk {

PositionCache::PositionCache(
    RedisClient& redisClient
)
    : redisClient_(redisClient) {
}


// Get Position
std::optional<std::string>
PositionCache::getPosition(
    const std::string& userId,
    const std::string& symbol
) {
    if (userId.empty()) {
        throw std::invalid_argument(
            "userId cannot be empty"
        );
    }

    if (symbol.empty()) {
        throw std::invalid_argument(
            "symbol cannot be empty"
        );
    }

    const std::string key =
        buildKey(
            userId,
            symbol
        );

    const auto reply =
        redisClient_.execute({
            "GET",
            key
        });

    if (reply->type == REDIS_REPLY_NIL) {
        return std::nullopt;
    }

    if (
        reply->type != REDIS_REPLY_STRING ||
        reply->str == nullptr
    ) {
        throw std::runtime_error(
            "Unexpected Redis reply while reading position"
        );
    }

    return std::string(
        reply->str,
        reply->len
    );
}


// Redis Key
std::string PositionCache::buildKey(
    const std::string& userId,
    const std::string& symbol
) {
    return
        "positions:" +
        userId +
        ":" +
        symbol;
}

} 