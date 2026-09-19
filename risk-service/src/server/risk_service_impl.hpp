#pragma once

#include <grpcpp/grpcpp.h>

#include <memory>
#include <string>

#include "config/config.hpp"
#include "checks/risk_check_pipeline.hpp"
#include "types/risk.types.hpp"

#include "risk.grpc.pb.h"

namespace risk {

class RiskServiceImpl final : public RiskService::Service {
public:
    RiskServiceImpl(
        const Config& config,
        RiskCheckPipeline& riskCheckPipeline
    );

    ~RiskServiceImpl() override = default;

    grpc::Status CheckPreTrade(
        grpc::ServerContext* context,
        const PreTradeRequest* request,
        PreTradeResponse* response
    ) override;

    grpc::Status GetRiskProfile(
        grpc::ServerContext* context,
        const RiskProfileRequest* request,
        RiskProfileResponse* response
    ) override;

private:
    const Config& config_;
    RiskCheckPipeline& riskCheckPipeline;

private:
    [[nodiscard]]
    bool validatePreTradeRequest(
        const PreTradeRequest& request,
        std::string& error
    ) const;

    [[nodiscard]]
    bool validateRiskProfileRequest(
        const RiskProfileRequest& request,
        std::string& error
    ) const;

    [[nodiscard]]
    PreTradeOrder toDomainOrder(
        const PreTradeRequest& request
    ) const;

    [[nodiscard]]
    static OrderSide toDomainOrderSide(
        PreTradeRequest::OrderSide side
    );

    [[nodiscard]]
    static OrderType toDomainOrderType(
        PreTradeRequest::OrderType type
    );

    static void writeRiskResult(
        const RiskResult& result,
        const std::string& requestId,
        PreTradeResponse* response
    );
};

} 