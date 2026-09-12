#include "risk_service_impl.hpp"

#include <chrono>
#include <exception>
#include <stdexcept>
#include <utility>

namespace risk {

RiskServiceImpl::RiskServiceImpl(
    const Config& config,
    RiskCheckPipeline& riskCheckPipeline
)
    : config_(config),
      riskCheckPipeline(riskCheckPipeline) {
}

// CheckPreTrade
grpc::Status RiskServiceImpl::CheckPreTrade(
    grpc::ServerContext* context,
    const PreTradeRequest* request,
    PreTradeResponse* response
) {
    if (request == nullptr || response == nullptr) {
        return grpc::Status(
            grpc::StatusCode::INVALID_ARGUMENT,
            "Request or response is null"
        );
    }

    if (context != nullptr &&
        context->IsCancelled()) {
        return grpc::Status(
            grpc::StatusCode::CANCELLED,
            "Request was cancelled"
        );
    }

    std::string validationError;

    if (!validatePreTradeRequest(
            *request,
            validationError)) {

        response->set_passed(false);
        response->set_reason_code(
            RiskRejectReason::RISK_REJECT_REASON_UNSPECIFIED
        );
        response->set_message(validationError);
        response->set_failed_check("request_validation");
        response->set_request_id(request->request_id());

        return grpc::Status(
            grpc::StatusCode::INVALID_ARGUMENT,
            validationError
        );
    }

    try {
        const PreTradeOrder order =
            toDomainOrder(*request);

        const auto startedAt =
            std::chrono::steady_clock::now();

        const RiskResult result =
            riskCheckPipeline.evaluate(order);

        const auto finishedAt =
            std::chrono::steady_clock::now();

        const auto serviceLatencyUs =
            std::chrono::duration_cast<
                std::chrono::microseconds
            >(finishedAt - startedAt).count();

        writeRiskResult(
            result,
            request->request_id(),
            response
        );

        response->set_latency_us(
            serviceLatencyUs
        );

        return grpc::Status::OK;
    }
    catch (const std::exception& ex) {
        response->set_passed(false);
        response->set_reason_code(
            RiskRejectReason::RISK_SERVICE_UNAVAILABLE
        );
        response->set_message(
            "Risk evaluation failed"
        );
        response->set_failed_check(
            "risk_service"
        );
        response->set_request_id(
            request->request_id()
        );

        return grpc::Status(
            grpc::StatusCode::INTERNAL,
            ex.what()
        );
    }
    catch (...) {
        response->set_passed(false);
        response->set_reason_code(
            RiskRejectReason::RISK_SERVICE_UNAVAILABLE
        );
        response->set_message(
            "Unknown risk evaluation failure"
        );
        response->set_failed_check(
            "risk_service"
        );
        response->set_request_id(
            request->request_id()
        );

        return grpc::Status(
            grpc::StatusCode::INTERNAL,
            "Unknown risk evaluation failure"
        );
    }
}

// GetRiskProfile
grpc::Status RiskServiceImpl::GetRiskProfile(
    grpc::ServerContext* context,
    const RiskProfileRequest* request,
    RiskProfileResponse* response
) {
    if (request == nullptr || response == nullptr) {
        return grpc::Status(
            grpc::StatusCode::INVALID_ARGUMENT,
            "Request or response is null"
        );
    }

    if (context != nullptr &&
        context->IsCancelled()) {
        return grpc::Status(
            grpc::StatusCode::CANCELLED,
            "Request was cancelled"
        );
    }

    std::string validationError;

    if (!validateRiskProfileRequest(
            *request,
            validationError)) {

        return grpc::Status(
            grpc::StatusCode::INVALID_ARGUMENT,
            validationError
        );
    }

    try {
        response->set_user_id(
            request->user_id()
        );

        response->set_max_position_size(
            std::to_string(
                config_.maxPositionSize()
            )
        );

        response->set_max_order_size(
            std::to_string(
                config_.maxOrderSize()
            )
        );

        response->set_min_order_size(
            std::to_string(
                config_.minOrderSize()
            )
        );

        response->set_price_band_percent(
            std::to_string(
                config_.priceBandPercent()
            )
        );

        response->set_order_rate_limit_count(
            config_.orderRateLimitCount()
        );

        response->set_order_rate_limit_window_ms(
            config_.orderRateLimitWindowMs()
        );

        return grpc::Status::OK;
    }
    catch (const std::exception& ex) {
        return grpc::Status(
            grpc::StatusCode::INTERNAL,
            ex.what()
        );
    }
}

// Validation
bool RiskServiceImpl::validatePreTradeRequest(
    const PreTradeRequest& request,
    std::string& error
) const {
    if (request.request_id().empty()) {
        error = "request_id is required";
        return false;
    }

    if (request.user_id().empty()) {
        error = "user_id is required";
        return false;
    }

    if (request.symbol().empty()) {
        error = "symbol is required";
        return false;
    }

    if (
        request.side() ==
        PreTradeRequest::ORDER_SIDE_UNSPECIFIED
    ) {
        error = "order side is required";
        return false;
    }

    if (
        request.type() ==
        PreTradeRequest::ORDER_TYPE_UNSPECIFIED
    ) {
        error = "order type is required";
        return false;
    }

    if (request.quantity().empty()) {
        error = "quantity is required";
        return false;
    }

    if (
        request.type() ==
            PreTradeRequest::LIMIT &&
        request.price().empty()
    ) {
        error =
            "price is required for limit orders";
        return false;
    }

    return true;
}

bool RiskServiceImpl::validateRiskProfileRequest(
    const RiskProfileRequest& request,
    std::string& error
) const {
    if (request.user_id().empty()) {
        error = "user_id is required";
        return false;
    }

    return true;
}

// Proto -> Domain
PreTradeOrder RiskServiceImpl::toDomainOrder(
    const PreTradeRequest& request
) const {
    PreTradeOrder order;

    order.requestId =
        request.request_id();

    order.userId =
        request.user_id();

    order.symbol =
        request.symbol();

    order.side =
        toDomainOrderSide(request.side());

    order.type =
        toDomainOrderType(request.type());

    order.price =
        request.price();

    order.quantity =
        request.quantity();

    order.correlationId =
        request.correlation_id();

    return order;
}

// Enum Conversion
OrderSide RiskServiceImpl::toDomainOrderSide(
    PreTradeRequest::OrderSide side
) {
    switch (side) {
        case PreTradeRequest::BUY:
            return OrderSide::BUY;

        case PreTradeRequest::SELL:
            return OrderSide::SELL;

        case PreTradeRequest::ORDER_SIDE_UNSPECIFIED:
            break;
    }

    throw std::invalid_argument(
        "Invalid order side"
    );
}

OrderType RiskServiceImpl::toDomainOrderType(
    PreTradeRequest::OrderType type
) {
    switch (type) {
        case PreTradeRequest::MARKET:
            return OrderType::MARKET;

        case PreTradeRequest::LIMIT:
            return OrderType::LIMIT;

        case PreTradeRequest::ORDER_TYPE_UNSPECIFIED:
            break;
    }

    throw std::invalid_argument(
        "Invalid order type"
    );
}

// Risk Result -> Proto
void RiskServiceImpl::writeRiskResult(
    const RiskResult& result,
    const std::string& requestId,
    PreTradeResponse* response
) {
    response->set_passed(
        result.passed
    );

    response->set_reason_code(
        static_cast<
            PreTradeResponse::RiskRejectReason
        >(
            static_cast<int>(
                result.reason
            )
        )
    );

    response->set_message(
        result.message
    );

    response->set_failed_check(
        result.checkName
    );

    response->set_latency_us(
        result.latencyUs
    );

    response->set_request_id(
        requestId
    );
}

} 