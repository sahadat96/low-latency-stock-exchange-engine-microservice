#pragma once

#include <cstdint>
#include <string_view>

#include "checks/i_risk_check.hpp"

namespace risk {

class OrderSizeCheck final : public IRiskCheck {
public:
    OrderSizeCheck(
        std::int64_t minimumOrderSize,
        std::int64_t maximumOrderSize
    );

    [[nodiscard]]
    RiskResult evaluate(
        const PreTradeOrder& order
    ) override;

    [[nodiscard]]
    std::string_view name() const noexcept override;

private:
    detail::Fixed8 minimum_;
    detail::Fixed8 maximum_;
};

} 