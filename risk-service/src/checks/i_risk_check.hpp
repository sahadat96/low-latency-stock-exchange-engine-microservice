#pragma once

#include <cstdint>
#include <limits>
#include <optional>
#include <string>
#include <string_view>

#include "types/risk.types.hpp"

namespace risk {

class IRiskCheck {
public:
    virtual ~IRiskCheck() = default;

    [[nodiscard]]
    virtual RiskResult evaluate(
        const PreTradeOrder& order
    ) = 0;

    [[nodiscard]]
    virtual std::string_view name() const noexcept = 0;
};

// Internal fixed-point helpers used by risk checks.
//
// Scale = 8 decimal places.
// Examples:
//   "10"         -> 1,000,000,000
//   "10.25"      -> 1,025,000,000
//   "0.00000001" -> 1
//
// Financial/order values never use binary floating-point.

namespace detail {

struct Fixed8 {
    static constexpr std::int64_t SCALE = 100'000'000LL;

    std::int64_t raw{0};

    [[nodiscard]]
    static std::optional<Fixed8> parse(
        std::string_view value
    ) noexcept {
        if (value.empty()) {
            return std::nullopt;
        }

        bool negative = false;
        std::size_t index = 0;

        if (value[index] == '-') {
            negative = true;
            ++index;
        } else if (value[index] == '+') {
            ++index;
        }

        if (index >= value.size()) {
            return std::nullopt;
        }

        __int128 whole = 0;
        std::int64_t fraction = 0;
        std::int64_t fractionScale = 10;

        bool hasWholeDigit = false;
        bool decimalSeen = false;
        int fractionDigits = 0;

        for (; index < value.size(); ++index) {
            const char c = value[index];

            if (c == '.') {
                if (decimalSeen) {
                    return std::nullopt;
                }

                decimalSeen = true;
                continue;
            }

            if (c < '0' || c > '9') {
                return std::nullopt;
            }

            const int digit = c - '0';

            if (!decimalSeen) {
                hasWholeDigit = true;

                whole =
                    (whole * 10) +
                    digit;

                const __int128 maximumWhole =
                    static_cast<__int128>(
                        std::numeric_limits<std::int64_t>::max()
                    ) / SCALE + 1;

                if (whole > maximumWhole) {
                    return std::nullopt;
                }
            } else {
                if (fractionDigits >= 8) {
                    return std::nullopt;
                }

                fraction +=
                    static_cast<std::int64_t>(digit) *
                    (SCALE / fractionScale);

                fractionScale *= 10;
                ++fractionDigits;
            }
        }

        if (!hasWholeDigit) {
            return std::nullopt;
        }

        __int128 scaled =
            whole * SCALE + fraction;

        if (negative) {
            scaled = -scaled;
        }

        if (
            scaled <
                static_cast<__int128>(
                    std::numeric_limits<std::int64_t>::min()
                ) ||
            scaled >
                static_cast<__int128>(
                    std::numeric_limits<std::int64_t>::max()
                )
        ) {
            return std::nullopt;
        }

        return Fixed8{
            static_cast<std::int64_t>(scaled)
        };
    }

    [[nodiscard]]
    static std::optional<Fixed8> fromWhole(
        std::int64_t value
    ) noexcept {
        const __int128 scaled =
            static_cast<__int128>(value) *
            SCALE;

        if (
            scaled <
                static_cast<__int128>(
                    std::numeric_limits<std::int64_t>::min()
                ) ||
            scaled >
                static_cast<__int128>(
                    std::numeric_limits<std::int64_t>::max()
                )
        ) {
            return std::nullopt;
        }

        return Fixed8{
            static_cast<std::int64_t>(scaled)
        };
    }
};

[[nodiscard]]
inline __int128 absWide(
    __int128 value
) noexcept {
    return value < 0 ? -value : value;
}

} 

} 