cmake_minimum_required(VERSION 3.20)

project(risk_service
    VERSION 1.0.0
    DESCRIPTION "Low-latency Risk Service for Stock Exchange"
    LANGUAGES CXX
)

# ============================================================
# C++ Standard
# ============================================================

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Recommended compiler warnings
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    add_compile_options(
        -Wall
        -Wextra
        -Wpedantic
        -Wconversion
        -Wshadow
    )
endif()

# ============================================================
# Build Configuration
# ============================================================

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Keep generated protobuf/grpc files outside src/
set(GENERATED_PROTO_DIR
    ${CMAKE_BINARY_DIR}/generated
)

file(MAKE_DIRECTORY ${GENERATED_PROTO_DIR})

# ============================================================
# Dependencies
# ============================================================

find_package(Protobuf CONFIG REQUIRED)
find_package(gRPC CONFIG REQUIRED)
find_package(spdlog CONFIG REQUIRED)

find_package(PkgConfig REQUIRED)
pkg_check_modules(HIREDIS REQUIRED hiredis)

# ============================================================
# Protocol Buffer Definitions
# ============================================================

set(PROTO_DIR
    ${CMAKE_CURRENT_SOURCE_DIR}/proto
)

set(RISK_PROTO
    ${PROTO_DIR}/risk.proto
)

set(WALLET_PROTO
    ${PROTO_DIR}/wallet.proto
)

# ============================================================
# Generated Protobuf Files
# ============================================================

set(RISK_PROTO_SRCS
    ${GENERATED_PROTO_DIR}/risk.pb.cc
)

set(RISK_PROTO_HDRS
    ${GENERATED_PROTO_DIR}/risk.pb.h
)

set(RISK_GRPC_SRCS
    ${GENERATED_PROTO_DIR}/risk.grpc.pb.cc
)

set(RISK_GRPC_HDRS
    ${GENERATED_PROTO_DIR}/risk.grpc.pb.h
)

set(WALLET_PROTO_SRCS
    ${GENERATED_PROTO_DIR}/wallet.pb.cc
)

set(WALLET_PROTO_HDRS
    ${GENERATED_PROTO_DIR}/wallet.pb.h
)

set(WALLET_GRPC_SRCS
    ${GENERATED_PROTO_DIR}/wallet.grpc.pb.cc
)

set(WALLET_GRPC_HDRS
    ${GENERATED_PROTO_DIR}/wallet.grpc.pb.h
)

# ============================================================
# Generate Risk Protobuf
# ============================================================

add_custom_command(
    OUTPUT
        ${RISK_PROTO_SRCS}
        ${RISK_PROTO_HDRS}
        ${RISK_GRPC_SRCS}
        ${RISK_GRPC_HDRS}

    COMMAND
        ${Protobuf_PROTOC_EXECUTABLE}

    ARGS
        --proto_path=${PROTO_DIR}
        --cpp_out=${GENERATED_PROTO_DIR}
        --grpc_out=${GENERATED_PROTO_DIR}
        --plugin=protoc-gen-grpc=$<TARGET_FILE:gRPC::grpc_cpp_plugin>
        ${RISK_PROTO}

    DEPENDS
        ${RISK_PROTO}

    COMMENT "Generating C++ sources from risk.proto"
    VERBATIM
)

# ============================================================
# Generate Wallet Protobuf
# ============================================================

add_custom_command(
    OUTPUT
        ${WALLET_PROTO_SRCS}
        ${WALLET_PROTO_HDRS}
        ${WALLET_GRPC_SRCS}
        ${WALLET_GRPC_HDRS}

    COMMAND
        ${Protobuf_PROTOC_EXECUTABLE}

    ARGS
        --proto_path=${PROTO_DIR}
        --cpp_out=${GENERATED_PROTO_DIR}
        --grpc_out=${GENERATED_PROTO_DIR}
        --plugin=protoc-gen-grpc=$<TARGET_FILE:gRPC::grpc_cpp_plugin>
        ${WALLET_PROTO}

    DEPENDS
        ${WALLET_PROTO}

    COMMENT "Generating C++ sources from wallet.proto"
    VERBATIM
)

# ============================================================
# Generated Proto Library
# ============================================================

add_library(proto_generated
    ${RISK_PROTO_SRCS}
    ${RISK_GRPC_SRCS}

    ${WALLET_PROTO_SRCS}
    ${WALLET_GRPC_SRCS}
)

target_include_directories(
    proto_generated
    PUBLIC
        ${GENERATED_PROTO_DIR}
)

target_link_libraries(
    proto_generated
    PUBLIC
        protobuf::libprotobuf
        gRPC::grpc++
)

# ============================================================
# Risk Service Source Files
# ============================================================

set(RISK_SERVICE_SOURCES

    # Entry point
    src/main.cpp

    # Server
    src/server/risk_service_impl.cpp
    src/server/grpc_server.cpp

    # Checks
    src/checks/balance_check.cpp
    src/checks/position_limit_check.cpp
    src/checks/order_size_check.cpp
    src/checks/price_band_check.cpp
    src/checks/order_rate_limit_check.cpp
    src/checks/risk_check_pipeline.cpp

    # Cache
    src/cache/redis_client.cpp
    src/cache/position_cache.cpp
    src/cache/price_cache.cpp
    src/cache/rate_limit_cache.cpp

    # Clients
    src/client/wallet_client.cpp

    # Configuration
    src/config/config.cpp
)

# ============================================================
# Risk Service Executable
# ============================================================

add_executable(
    risk_service
    ${RISK_SERVICE_SOURCES}
)

target_include_directories(
    risk_service
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
        ${GENERATED_PROTO_DIR}
        ${HIREDIS_INCLUDE_DIRS}
)

target_link_directories(
    risk_service
    PRIVATE
        ${HIREDIS_LIBRARY_DIRS}
)

target_link_libraries(
    risk_service
    PRIVATE
        proto_generated

        gRPC::grpc++
        protobuf::libprotobuf

        spdlog::spdlog

        ${HIREDIS_LIBRARIES}
)

# ============================================================
# Compiler Settings
# ============================================================

target_compile_features(
    risk_service
    PRIVATE
        cxx_std_17
)

# ============================================================
# Tests
# ============================================================

option(
    BUILD_TESTS
    "Build unit and integration tests"
    ON
)

if(BUILD_TESTS)

    enable_testing()

    find_package(GTest CONFIG REQUIRED)

    set(RISK_TEST_SOURCES

        tests/balance_check_test.cpp
        tests/position_limit_check_test.cpp
        tests/order_size_check_test.cpp
        tests/price_band_check_test.cpp
        tests/rate_limit_check_test.cpp
        tests/risk_check_pipeline_test.cpp

    )

    add_executable(
        risk_tests
        ${RISK_TEST_SOURCES}
    )

    target_include_directories(
        risk_tests
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/src
            ${GENERATED_PROTO_DIR}
            ${HIREDIS_INCLUDE_DIRS}
    )

    target_link_directories(
        risk_tests
        PRIVATE
            ${HIREDIS_LIBRARY_DIRS}
    )

    target_link_libraries(
        risk_tests
        PRIVATE
            proto_generated

            gRPC::grpc++

            protobuf::libprotobuf

            spdlog::spdlog

            ${HIREDIS_LIBRARIES}

            GTest::gtest
            GTest::gtest_main
    )

    target_compile_features(
        risk_tests
        PRIVATE
            cxx_std_17
    )

    include(GoogleTest)

    gtest_discover_tests(
        risk_tests
    )

endif()

# ============================================================
# Installation
# ============================================================

include(GNUInstallDirs)

install(
    TARGETS
        risk_service

    RUNTIME DESTINATION
        ${CMAKE_INSTALL_BINDIR}
)

# ============================================================
# Build Information
# ============================================================

message(STATUS "==============================================")
message(STATUS " Risk Service Configuration")
message(STATUS "==============================================")
message(STATUS " C++ Standard     : C++${CMAKE_CXX_STANDARD}")
message(STATUS " Build Type       : ${CMAKE_BUILD_TYPE}")
message(STATUS " Proto Directory  : ${PROTO_DIR}")
message(STATUS " Generated Proto  : ${GENERATED_PROTO_DIR}")
message(STATUS " Build Tests      : ${BUILD_TESTS}")
message(STATUS "==============================================")