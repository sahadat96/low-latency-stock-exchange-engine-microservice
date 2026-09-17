#pragma once

#include <optional>
#include <string>

#include "redis_client.hpp"

namespace risk {

class PositionCache {
public:
    explicit PositionCache(
        RedisClient& redisClient
    );

    [[nodiscard]]
    std::optional<std::string> getPosition(
        const std::string& userId,
        const std::string& symbol
    );

private:
    RedisClient& redisClient_;

private:
    [[nodiscard]]
    static std::string buildKey(
        const std::string& userId,
        const std::string& symbol
    );
};

} 