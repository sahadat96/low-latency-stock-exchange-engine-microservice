#pragma once

#include <grpcpp/grpcpp.h>

#include <cstdint>
#include <memory>
#include <string>

#include "wallet.grpc.pb.h"

namespace risk {

// Wallet Client Result
enum class WalletClientStatus {
    OK,

    NOT_FOUND,

    INVALID_ARGUMENT,

    DEADLINE_EXCEEDED,

    UNAVAILABLE,

    INTERNAL_ERROR
};

struct WalletBalance {
    std::string walletId;

    std::string userId;

    std::string currency;

    // Keep financial values as decimal strings.
    std::string availableBalance;
    std::string lockedBalance;
    std::string totalBalance;
};

struct WalletBalanceResult {
    WalletClientStatus status{
        WalletClientStatus::INTERNAL_ERROR
    };

    WalletBalance balance{};

    std::string errorMessage{};

    [[nodiscard]]
    bool ok() const noexcept {
        return status == WalletClientStatus::OK;
    }
};

// Wallet Client Interface
//
// BalanceCheck depends on this interface rather than the
// concrete gRPC client.
class IWalletClient {
public:
    virtual ~IWalletClient() = default;

    [[nodiscard]]
    virtual WalletBalanceResult getBalance(
        const std::string& userId,
        const std::string& currency,
        const std::string& correlationId
    ) = 0;
};

// gRPC Wallet Client
class WalletClient final : public IWalletClient {
public:
    WalletClient(
        std::string serviceAddress,
        std::int64_t timeoutMs
    );

    // Useful for tests or when channel creation is managed
    // externally.
    WalletClient(
        std::shared_ptr<grpc::Channel> channel,
        std::int64_t timeoutMs
    );

    ~WalletClient() override = default;

    WalletClient(const WalletClient&) = delete;
    WalletClient& operator=(const WalletClient&) = delete;

    WalletClient(WalletClient&&) = delete;
    WalletClient& operator=(WalletClient&&) = delete;

    [[nodiscard]]
    WalletBalanceResult getBalance(
        const std::string& userId,
        const std::string& currency,
        const std::string& correlationId
    ) override;

private:
    std::shared_ptr<grpc::Channel> channel_;

    std::unique_ptr<
        ::wallet::WalletService::Stub
    > stub_;

    std::int64_t timeoutMs_;

private:
    static void validateRequest(
        const std::string& userId,
        const std::string& currency
    );

    [[nodiscard]]
    static WalletBalanceResult mapGrpcError(
        const grpc::Status& status
    );
};

} 