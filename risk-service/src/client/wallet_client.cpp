#include "wallet_client.hpp"

#include <chrono>
#include <stdexcept>
#include <utility>

namespace risk {

// Constructor
WalletClient::WalletClient(
    std::string serviceAddress,
    std::int64_t timeoutMs
)
    : WalletClient(
          grpc::CreateChannel(
              std::move(serviceAddress),
              grpc::InsecureChannelCredentials()
          ),
          timeoutMs
      ) {
}

// Constructor with externally supplied channel
WalletClient::WalletClient(
    std::shared_ptr<grpc::Channel> channel,
    std::int64_t timeoutMs
)
    : channel_(std::move(channel)),
      timeoutMs_(timeoutMs) {

    if (!channel_) {
        throw std::invalid_argument(
            "Wallet gRPC channel cannot be null"
        );
    }

    if (timeoutMs_ <= 0) {
        throw std::invalid_argument(
            "Wallet timeout must be greater than zero"
        );
    }

    stub_ =
        ::wallet::WalletService::NewStub(
            channel_
        );

    if (!stub_) {
        throw std::runtime_error(
            "Failed to create WalletService gRPC stub"
        );
    }
}

// Get Balance
WalletBalanceResult WalletClient::getBalance(
    const std::string& userId,
    const std::string& currency,
    const std::string& correlationId
) {
    validateRequest(
        userId,
        currency
    );

    ::wallet::GetBalanceRequest request;
    ::wallet::GetBalanceResponse response;

    request.set_user_id(
        userId
    );

    request.set_currency(
        currency
    );

    if (!correlationId.empty()) {
        request.set_correlation_id(
            correlationId
        );
    }

    grpc::ClientContext context;

    // Risk Service is on the synchronous trading hot path.
    // Never allow Wallet Service to block indefinitely.
    const auto deadline =
        std::chrono::system_clock::now() +
        std::chrono::milliseconds(
            timeoutMs_
        );

    context.set_deadline(
        deadline
    );

    // Correlation ID is also propagated as gRPC metadata.
    if (!correlationId.empty()) {
        context.AddMetadata(
            "x-correlation-id",
            correlationId
        );
    }

    const grpc::Status status =
        stub_->GetBalance(
            &context,
            request,
            &response
        );

    if (!status.ok()) {
        return mapGrpcError(
            status
        );
    }

    // Defensive response validation
    if (response.user_id().empty()) {
        return WalletBalanceResult{
            WalletClientStatus::INTERNAL_ERROR,
            {},
            "Wallet Service returned empty user_id"
        };
    }

    if (response.currency().empty()) {
        return WalletBalanceResult{
            WalletClientStatus::INTERNAL_ERROR,
            {},
            "Wallet Service returned empty currency"
        };
    }

    if (response.available_balance().empty()) {
        return WalletBalanceResult{
            WalletClientStatus::INTERNAL_ERROR,
            {},
            "Wallet Service returned empty available_balance"
        };
    }

    // Defensive check: ensure we did not receive another
    // user's wallet due to an upstream bug.
    if (response.user_id() != userId) {
        return WalletBalanceResult{
            WalletClientStatus::INTERNAL_ERROR,
            {},
            "Wallet Service returned mismatched user_id"
        };
    }

    if (response.currency() != currency) {
        return WalletBalanceResult{
            WalletClientStatus::INTERNAL_ERROR,
            {},
            "Wallet Service returned mismatched currency"
        };
    }

    WalletBalance balance{
        response.wallet_id(),
        response.user_id(),
        response.currency(),
        response.available_balance(),
        response.locked_balance(),
        response.total_balance()
    };

    return WalletBalanceResult{
        WalletClientStatus::OK,
        std::move(balance),
        {}
    };
}

// Validation
void WalletClient::validateRequest(
    const std::string& userId,
    const std::string& currency
) {
    if (userId.empty()) {
        throw std::invalid_argument(
            "userId cannot be empty"
        );
    }

    if (currency.empty()) {
        throw std::invalid_argument(
            "currency cannot be empty"
        );
    }
}

// gRPC Error Mapping
WalletBalanceResult WalletClient::mapGrpcError(
    const grpc::Status& status
) {
    WalletClientStatus clientStatus;

    switch (status.error_code()) {

        case grpc::StatusCode::NOT_FOUND:
            clientStatus =
                WalletClientStatus::NOT_FOUND;
            break;

        case grpc::StatusCode::INVALID_ARGUMENT:
            clientStatus =
                WalletClientStatus::INVALID_ARGUMENT;
            break;

        case grpc::StatusCode::DEADLINE_EXCEEDED:
            clientStatus =
                WalletClientStatus::DEADLINE_EXCEEDED;
            break;

        case grpc::StatusCode::UNAVAILABLE:
            clientStatus =
                WalletClientStatus::UNAVAILABLE;
            break;

        default:
            clientStatus =
                WalletClientStatus::INTERNAL_ERROR;
            break;
    }

    return WalletBalanceResult{
        clientStatus,
        {},
        status.error_message()
    };
}

}