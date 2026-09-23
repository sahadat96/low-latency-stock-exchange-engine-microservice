#pragma once

#include <cstdint>
#include <string>

#include "redis_client.hpp"

namespace risk {

struct RateLimitDecision {
    bool allowed;

    std::int64_t currentCount;

    std::int64_t limit;

    std::int64_t windowMs;
};

class RateLimitCache {
public:
    RateLimitCache(
        RedisClient& redisClient,
        std::int64_t limit,
        std::int64_t windowMs
    );

    [[nodiscard]]
    RateLimitDecision checkAndRecord(
        const std::string& userId,
        const std::string& requestId,
        std::int64_t timestampMs
    );

private:
    RedisClient& redisClient_;

    std::int64_t limit_;
    std::int64_t windowMs_;

private:
    [[nodiscard]]
    static std::string buildKey(
        const std::string& userId
    );
};

}