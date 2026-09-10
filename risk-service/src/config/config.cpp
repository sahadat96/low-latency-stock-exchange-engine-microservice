#include "config.hpp"

#include <cstdlib>
#include <cerrno>
#include <limits>
#include <stdexcept>
#include <string>

namespace risk {

// Constructor
Config::Config()
    : grpcPort_(
          getPortEnv(
              "GRPC_PORT",
              50051
          )
      ),

      redisUrl_(
          getEnv(
              "REDIS_URL",
              "redis://localhost:6379"
          )
      ),

      walletServiceGrpcUrl_(
          getEnv(
              "WALLET_SERVICE_GRPC_URL",
              "localhost:50052"
          )
      ),

      maxPositionSize_(
          getInt64Env(
              "MAX_POSITION_SIZE",
              10000
          )
      ),

      maxOrderSize_(
          getInt64Env(
              "MAX_ORDER_SIZE",
              5000
          )
      ),

      minOrderSize_(
          getInt64Env(
              "MIN_ORDER_SIZE",
              1
          )
      ),

      priceBandPercent_(
          getDoubleEnv(
              "PRICE_BAND_PERCENT",
              10.0
          )
      ),

      orderRateLimitCount_(
          getInt32Env(
              "ORDER_RATE_LIMIT_COUNT",
              100
          )
      ),

      orderRateLimitWindowMs_(
          getInt64Env(
              "ORDER_RATE_LIMIT_WINDOW_MS",
              1000
          )
      ),

      walletTimeoutMs_(
          getInt64Env(
              "WALLET_TIMEOUT_MS",
              50
          )
      )
{
    validate();
}

// Getters
std::uint16_t Config::grpcPort() const noexcept {
    return grpcPort_;
}

const std::string& Config::redisUrl() const noexcept {
    return redisUrl_;
}

const std::string& Config::walletServiceGrpcUrl() const noexcept {
    return walletServiceGrpcUrl_;
}

std::int64_t Config::maxPositionSize() const noexcept {
    return maxPositionSize_;
}

std::int64_t Config::maxOrderSize() const noexcept {
    return maxOrderSize_;
}

std::int64_t Config::minOrderSize() const noexcept {
    return minOrderSize_;
}

double Config::priceBandPercent() const noexcept {
    return priceBandPercent_;
}

std::int32_t Config::orderRateLimitCount() const noexcept {
    return orderRateLimitCount_;
}

std::int64_t Config::orderRateLimitWindowMs() const noexcept {
    return orderRateLimitWindowMs_;
}

std::int64_t Config::walletTimeoutMs() const noexcept {
    return walletTimeoutMs_;
}

// Environment Helpers
std::string Config::getEnv(
    const char* name,
    const std::string& defaultValue
) {
    const char* value = std::getenv(name);

    if (value == nullptr || *value == '\0') {
        return defaultValue;
    }

    return std::string(value);
}

// ============================================================

std::int64_t Config::getInt64Env(
    const char* name,
    std::int64_t defaultValue
) {
    const char* value = std::getenv(name);

    if (value == nullptr || *value == '\0') {
        return defaultValue;
    }

    try {
        std::string input(value);
        std::size_t processed = 0;

        const long long parsed =
            std::stoll(input, &processed);

        if (processed != input.size()) {
            throw std::invalid_argument(
                "contains non-numeric characters"
            );
        }

        if (
            parsed < std::numeric_limits<std::int64_t>::min() ||
            parsed > std::numeric_limits<std::int64_t>::max()
        ) {
            throw std::out_of_range(
                "value outside int64 range"
            );
        }

        return static_cast<std::int64_t>(parsed);
    }
    catch (const std::exception& ex) {
        throw std::runtime_error(
            std::string("Invalid environment variable ") +
            name +
            ": " +
            ex.what()
        );
    }
}

// ============================================================

std::int32_t Config::getInt32Env(
    const char* name,
    std::int32_t defaultValue
) {
    const std::int64_t value =
        getInt64Env(
            name,
            static_cast<std::int64_t>(defaultValue)
        );

    if (
        value < std::numeric_limits<std::int32_t>::min() ||
        value > std::numeric_limits<std::int32_t>::max()
    ) {
        throw std::runtime_error(
            std::string("Environment variable ") +
            name +
            " is outside int32 range"
        );
    }

    return static_cast<std::int32_t>(value);
}

// ============================================================

std::uint16_t Config::getPortEnv(
    const char* name,
    std::uint16_t defaultValue
) {
    const std::int64_t value =
        getInt64Env(
            name,
            static_cast<std::int64_t>(defaultValue)
        );

    if (value < 1 || value > 65535) {
        throw std::runtime_error(
            std::string("Invalid port in environment variable ") +
            name
        );
    }

    return static_cast<std::uint16_t>(value);
}

// ============================================================

double Config::getDoubleEnv(
    const char* name,
    double defaultValue
) {
    const char* value = std::getenv(name);

    if (value == nullptr || *value == '\0') {
        return defaultValue;
    }

    try {
        std::string input(value);
        std::size_t processed = 0;

        const double parsed =
            std::stod(input, &processed);

        if (processed != input.size()) {
            throw std::invalid_argument(
                "contains non-numeric characters"
            );
        }

        if (!std::isfinite(parsed)) {
            throw std::invalid_argument(
                "value must be finite"
            );
        }

        return parsed;
    }
    catch (const std::exception& ex) {
        throw std::runtime_error(
            std::string("Invalid environment variable ") +
            name +
            ": " +
            ex.what()
        );
    }
}
// Validation

void Config::validate() const {
    if (redisUrl_.empty()) {
        throw std::runtime_error(
            "REDIS_URL cannot be empty"
        );
    }

    if (walletServiceGrpcUrl_.empty()) {
        throw std::runtime_error(
            "WALLET_SERVICE_GRPC_URL cannot be empty"
        );
    }

    if (maxPositionSize_ <= 0) {
        throw std::runtime_error(
            "MAX_POSITION_SIZE must be greater than zero"
        );
    }

    if (minOrderSize_ <= 0) {
        throw std::runtime_error(
            "MIN_ORDER_SIZE must be greater than zero"
        );
    }

    if (maxOrderSize_ <= 0) {
        throw std::runtime_error(
            "MAX_ORDER_SIZE must be greater than zero"
        );
    }

    if (minOrderSize_ > maxOrderSize_) {
        throw std::runtime_error(
            "MIN_ORDER_SIZE cannot be greater than MAX_ORDER_SIZE"
        );
    }

    if (priceBandPercent_ <= 0.0) {
        throw std::runtime_error(
            "PRICE_BAND_PERCENT must be greater than zero"
        );
    }

    if (orderRateLimitCount_ <= 0) {
        throw std::runtime_error(
            "ORDER_RATE_LIMIT_COUNT must be greater than zero"
        );
    }

    if (orderRateLimitWindowMs_ <= 0) {
        throw std::runtime_error(
            "ORDER_RATE_LIMIT_WINDOW_MS must be greater than zero"
        );
    }

    if (walletTimeoutMs_ <= 0) {
        throw std::runtime_error(
            "WALLET_TIMEOUT_MS must be greater than zero"
        );
    }
}

} 