#include "rate_limit_cache.hpp"

#include <stdexcept>
#include <string>
#include <vector>

namespace risk {

namespace {

/*
 * Atomic sliding-window rate limiter.
 *
 * KEYS[1] = ratelimit:{userId}
 *
 * ARGV[1] = current timestamp ms
 * ARGV[2] = window start timestamp ms
 * ARGV[3] = request ID
 * ARGV[4] = limit
 * ARGV[5] = TTL
 *
 * Algorithm:
 *
 * 1. Remove requests outside the sliding window.
 * 3. Reject if limit already reached.
 * 4. Otherwise record this request.
 * 5. Refresh key TTL.
 *
 * requestId is used as the sorted-set member so retries
 * using the same request ID do not generate duplicate members.
 */
constexpr const char* RATE_LIMIT_SCRIPT = R"lua(
local key         = KEYS[1]
local now         = tonumber(ARGV[1])
local windowStart = tonumber(ARGV[2])
local requestId   = ARGV[3]
local limit       = tonumber(ARGV[4])
local ttl         = tonumber(ARGV[5])

redis.call(
    'ZREMRANGEBYSCORE',
    key,
    '-inf',
    windowStart
)

local existingScore =
    redis.call(
        'ZSCORE',
        key,
        requestId
    )

if existingScore then
    local count =
        redis.call(
            'ZCARD',
            key
        )

    redis.call(
        'PEXPIRE',
        key,
        ttl
    )

    return {1, count}
end

local count =
    redis.call(
        'ZCARD',
        key
    )

if count >= limit then
    return {0, count}
end

redis.call(
    'ZADD',
    key,
    now,
    requestId
)

redis.call(
    'PEXPIRE',
    key,
    ttl
)

return {1, count + 1}
)lua";

} // namespace

// Constructor
RateLimitCache::RateLimitCache(
    RedisClient& redisClient,
    std::int64_t limit,
    std::int64_t windowMs
)
    : redisClient_(redisClient),
      limit_(limit),
      windowMs_(windowMs) {

    if (limit_ <= 0) {
        throw std::invalid_argument(
            "Rate limit must be greater than zero"
        );
    }

    if (windowMs_ <= 0) {
        throw std::invalid_argument(
            "Rate limit window must be greater than zero"
        );
    }
}

// Check + Record
RateLimitDecision
RateLimitCache::checkAndRecord(
    const std::string& userId,
    const std::string& requestId,
    std::int64_t timestampMs
) {
    if (userId.empty()) {
        throw std::invalid_argument(
            "userId cannot be empty"
        );
    }

    if (requestId.empty()) {
        throw std::invalid_argument(
            "requestId cannot be empty"
        );
    }

    if (timestampMs <= 0) {
        throw std::invalid_argument(
            "timestampMs must be greater than zero"
        );
    }

    const std::string key =
        buildKey(userId);

    const std::int64_t windowStart =
        timestampMs - windowMs_;

    // Keep the key slightly longer than the actual
    // window so Redis can clean it automatically.
    const std::int64_t ttlMs =
        windowMs_ * 2;

    const auto reply =
        redisClient_.execute({
            "EVAL",
            RATE_LIMIT_SCRIPT,
            "1",

            key,

            std::to_string(timestampMs),
            std::to_string(windowStart),
            requestId,
            std::to_string(limit_),
            std::to_string(ttlMs)
        });

    if (
        reply->type != REDIS_REPLY_ARRAY ||
        reply->elements != 2
    ) {
        throw std::runtime_error(
            "Unexpected Redis rate-limit response"
        );
    }

    const redisReply* allowedReply =
        reply->element[0];

    const redisReply* countReply =
        reply->element[1];

    if (
        allowedReply == nullptr ||
        countReply == nullptr ||
        allowedReply->type != REDIS_REPLY_INTEGER ||
        countReply->type != REDIS_REPLY_INTEGER
    ) {
        throw std::runtime_error(
            "Invalid Redis rate-limit response"
        );
    }

    return RateLimitDecision{
        allowedReply->integer == 1,
        static_cast<std::int64_t>(
            countReply->integer
        ),
        limit_,
        windowMs_
    };
}

// Redis Key
std::string RateLimitCache::buildKey(
    const std::string& userId
) {
    return
        "ratelimit:orders:" +
        userId;
}

}