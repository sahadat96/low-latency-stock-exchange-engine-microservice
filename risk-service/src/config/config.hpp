#pragma once

#include <cstdint>
#include <string>

namespace risk {

class Config {
public:
    Config();

    // Server
    [[nodiscard]]
    std::uint16_t grpcPort() const noexcept;

    // Infrastructure
    [[nodiscard]]
    const std::string& redisUrl() const noexcept;

    [[nodiscard]]
    const std::string& walletServiceGrpcUrl() const noexcept;

    // Position Risk
    [[nodiscard]]
    std::int64_t maxPositionSize() const noexcept;

    // Order Size Risk
    [[nodiscard]]
    std::int64_t maxOrderSize() const noexcept;

    [[nodiscard]]
    std::int64_t minOrderSize() const noexcept;

    // Price Band Risk
    [[nodiscard]]
    double priceBandPercent() const noexcept;

    // Order Rate Limiting
    [[nodiscard]]
    std::int32_t orderRateLimitCount() const noexcept;

    [[nodiscard]]
    std::int64_t orderRateLimitWindowMs() const noexcept;

    // Wallet Client
    [[nodiscard]]
    std::int64_t walletTimeoutMs() const noexcept;

private:
    std::uint16_t grpcPort_;

    std::string redisUrl_;
    std::string walletServiceGrpcUrl_;

    std::int64_t maxPositionSize_;

    std::int64_t maxOrderSize_;
    std::int64_t minOrderSize_;

    double priceBandPercent_;

    std::int32_t orderRateLimitCount_;
    std::int64_t orderRateLimitWindowMs_;

    std::int64_t walletTimeoutMs_;

private:
    static std::string getEnv(
        const char* name,
        const std::string& defaultValue
    );

    static std::int64_t getInt64Env(
        const char* name,
        std::int64_t defaultValue
    );

    static std::int32_t getInt32Env(
        const char* name,
        std::int32_t defaultValue
    );

    static std::uint16_t getPortEnv(
        const char* name,
        std::uint16_t defaultValue
    );

    static double getDoubleEnv(
        const char* name,
        double defaultValue
    );

    void validate() const;
};

} 