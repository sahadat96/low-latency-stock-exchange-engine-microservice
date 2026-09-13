#include "grpc_server.hpp"

#include <chrono>
#include <stdexcept>
#include <utility>

namespace risk {

GrpcServer::GrpcServer(
    const Config& config,
    RiskCheckPipeline& riskCheckPipeline
)
    : config_(config),
      riskService_(
          config,
          riskCheckPipeline
      ) {
}

GrpcServer::~GrpcServer() {
    shutdown();
}

// Start
void GrpcServer::start() {
    if (running_.load()) {
        throw std::runtime_error(
            "gRPC server is already running"
        );
    }

    const std::string serverAddress =
        "0.0.0.0:" +
        std::to_string(
            config_.grpcPort()
        );

    grpc::ServerBuilder builder;

    // Listen address.
    builder.AddListeningPort(
        serverAddress,
        grpc::InsecureServerCredentials()
    );

    // Register Risk Service.
    builder.RegisterService(
        &riskService_
    );

    // For the initial implementation, leave
    // gRPC defaults enabled rather than aggressively
    // tuning transport settings before benchmarking.

    server_ =
        builder.BuildAndStart();

    if (!server_) {
        throw std::runtime_error(
            "Failed to start gRPC server"
        );
    }

    running_.store(true);

    std::printf(
        "Risk gRPC server listening on %s\n",
        serverAddress.c_str()
    );
}

// Wait
void GrpcServer::wait() {
    if (!server_) {
        throw std::runtime_error(
            "Cannot wait: gRPC server is not started"
        );
    }

    server_->Wait();

    running_.store(false);
}

// Shutdown
void GrpcServer::shutdown() {
    if (!server_) {
        return;
    }

    bool expected = true;

    if (!running_.compare_exchange_strong(
            expected,
            false
        )) {
        return;
    }

    // Give currently executing RPCs a small grace period.
    server_->Shutdown(
        std::chrono::system_clock::now() +
        std::chrono::seconds(5)
    );
}

// Status
bool GrpcServer::isRunning() const noexcept {
    return running_.load();
}

} // namespace risk