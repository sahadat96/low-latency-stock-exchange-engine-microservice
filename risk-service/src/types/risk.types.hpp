#pragma once

#include <cstdint>
#include <string>

namespace risk {

// ============================================================
// Order Domain Types
// ============================================================

enum class OrderSide {
    BUY,
    SELL
};

enum class OrderType {
    MARKET,
    LIMIT
};

// ============================================================
// Risk Rejection Reasons
// ============================================================

enum class RiskRejectReason {
    NONE,

    INSUFFICIENT_BALANCE,

    POSITION_LIMIT_EXCEEDED,

    ORDER_SIZE_TOO_SMALL,

    ORDER_SIZE_TOO_LARGE,

    PRICE_OUT_OF_BAND,

    RATE_LIMIT_EXCEEDED,

    WALLET_SERVICE_UNAVAILABLE,

    PRICE_UNAVAILABLE,

    POSITION_UNAVAILABLE,

    RISK_SERVICE_UNAVAILABLE
};

// ============================================================
// Pre-Trade Order
//
// This is the internal domain representation of an order.
// It is intentionally independent of gRPC/protobuf.
// ============================================================

struct PreTradeOrder {
    std::string requestId;

    std::string userId;

    std::string symbol;

    OrderSide side;

    OrderType type;

    // Financial values are represented as strings at the
    // transport boundary to avoid floating-point precision.
    //
    // The domain/service implementation can convert these
    // values to an appropriate decimal representation.
    std::string price;

    std::string quantity;

    std::string correlationId;
};

// ============================================================
// Risk Profile
// ============================================================

struct RiskProfile {
    std::string userId;

    // Maximum allowed position for one symbol.
    std::string maxPositionSize;

    // Maximum quantity allowed in one order.
    std::string maxOrderSize;

    // Minimum quantity allowed in one order.
    std::string minOrderSize;

    // Maximum allowed price deviation from last traded price.
    std::string priceBandPercent;

    // Maximum number of orders allowed within the window.
    std::int32_t orderRateLimitCount;

    // Sliding-window duration.
    std::int64_t orderRateLimitWindowMs;
};

// ============================================================
// Risk Check Result
// ============================================================

struct RiskResult {
    // true  -> risk check passed
    // false -> risk check rejected
    bool passed;

    // Meaningful only when passed == false.
    RiskRejectReason reason;

    // Human-readable explanation.
    std::string message;

    // Name of the check that produced the result.
    std::string checkName;

    // Execution latency of this individual check.
    std::int64_t latencyUs;

    // Factory helpers make check implementations cleaner.
    static RiskResult pass(
        std::string check,
        std::int64_t latency
    ) {
        return RiskResult{
            true,
            RiskRejectReason::NONE,
            {},
            std::move(check),
            latency
        };
    }

    static RiskResult reject(
        RiskRejectReason rejectReason,
        std::string check,
        std::string errorMessage,
        std::int64_t latency
    ) {
        return RiskResult{
            false,
            rejectReason,
            std::move(errorMessage),
            std::move(check),
            latency
        };
    }
};

// ============================================================
// Utility Functions
// ============================================================

inline const char* toString(OrderSide side) {
    switch (side) {
        case OrderSide::BUY:
            return "BUY";

        case OrderSide::SELL:
            return "SELL";
    }

    return "UNKNOWN";
}

inline const char* toString(OrderType type) {
    switch (type) {
        case OrderType::MARKET:
            return "MARKET";

        case OrderType::LIMIT:
            return "LIMIT";
    }

    return "UNKNOWN";
}

inline const char* toString(RiskRejectReason reason) {
    switch (reason) {
        case RiskRejectReason::NONE:
            return "NONE";

        case RiskRejectReason::INSUFFICIENT_BALANCE:
            return "INSUFFICIENT_BALANCE";

        case RiskRejectReason::POSITION_LIMIT_EXCEEDED:
            return "POSITION_LIMIT_EXCEEDED";

        case RiskRejectReason::ORDER_SIZE_TOO_SMALL:
            return "ORDER_SIZE_TOO_SMALL";

        case RiskRejectReason::ORDER_SIZE_TOO_LARGE:
            return "ORDER_SIZE_TOO_LARGE";

        case RiskRejectReason::PRICE_OUT_OF_BAND:
            return "PRICE_OUT_OF_BAND";

        case RiskRejectReason::RATE_LIMIT_EXCEEDED:
            return "RATE_LIMIT_EXCEEDED";

        case RiskRejectReason::WALLET_SERVICE_UNAVAILABLE:
            return "WALLET_SERVICE_UNAVAILABLE";

        case RiskRejectReason::PRICE_UNAVAILABLE:
            return "PRICE_UNAVAILABLE";

        case RiskRejectReason::POSITION_UNAVAILABLE:
            return "POSITION_UNAVAILABLE";

        case RiskRejectReason::RISK_SERVICE_UNAVAILABLE:
            return "RISK_SERVICE_UNAVAILABLE";
    }

    return "UNKNOWN";
}

} 