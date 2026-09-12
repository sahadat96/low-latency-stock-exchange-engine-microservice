#pragma once

#include <grpcpp/grpcpp.h>

#include <atomic>
#include <memory>
#include <string>

#include "config/config.hpp"
#include "server/risk_service_impl.hpp"

namespace risk {

class GrpcServer {
public:
    GrpcServer(
        const Config& config,
        RiskCheckPipeline& riskCheckPipeline
    );

    ~GrpcServer();

    GrpcServer(const GrpcServer&) = delete;
    GrpcServer& operator=(const GrpcServer&) = delete;

    GrpcServer(GrpcServer&&) = delete;
    GrpcServer& operator=(GrpcServer&&) = delete;

    // Starts the gRPC server.
    void start();

    // Blocks until the server stops.
    void wait();

    // Gracefully shuts down the server.
    void shutdown();

    [[nodiscard]]
    bool isRunning() const noexcept;

private:
    const Config& config_;

    RiskServiceImpl riskService_;

    std::unique_ptr<grpc::Server> server_;

    std::atomic<bool> running_{false};
};

} 