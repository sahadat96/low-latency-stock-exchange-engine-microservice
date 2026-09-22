#include "price_cache.hpp"

#include <stdexcept>

namespace risk {

PriceCache::PriceCache(
    RedisClient& redisClient
)
    : redisClient_(redisClient) {
}

// Get Last Traded Price
std::optional<std::string>
PriceCache::getLastPrice(
    const std::string& symbol
) {
    if (symbol.empty()) {
        throw std::invalid_argument(
            "symbol cannot be empty"
        );
    }

    const std::string key =
        buildKey(symbol);

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
            "Unexpected Redis reply while reading last price"
        );
    }

    return std::string(
        reply->str,
        reply->len
    );
}

// Redis Key
std::string PriceCache::buildKey(
    const std::string& symbol
) {
    return
        "prices:" +
        symbol;
}

} 