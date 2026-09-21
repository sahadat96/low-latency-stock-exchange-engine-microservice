#pragma once

#include <optional>
#include <string>

#include "redis_client.hpp"

namespace risk {

class PriceCache {
public:
    explicit PriceCache(
        RedisClient& redisClient
    );

    [[nodiscard]]
    std::optional<std::string> getLastPrice(
        const std::string& symbol
    );

private:
    RedisClient& redisClient_;

private:
    [[nodiscard]]
    static std::string buildKey(
        const std::string& symbol
    );
};

}