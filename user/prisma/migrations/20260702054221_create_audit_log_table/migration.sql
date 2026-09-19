-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'TOKEN_REFRESHED', 'TOKEN_REVOKED', 'REGISTER', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_BANNED', 'ACCOUNT_REACTIVATED', 'ACCOUNT_DELETED', 'PROFILE_UPDATED', 'KYC_SUBMITTED', 'KYC_VERIFIED', 'KYC_REJECTED', 'TFA_ENABLED', 'TFA_DISABLED', 'TFA_VERIFIED', 'TFA_FAILED', 'BACKUP_CODE_USED', 'API_KEY_CREATED', 'API_KEY_REVOKED', 'SESSION_CREATED', 'SESSION_REVOKED', 'ALL_SESSIONS_REVOKED');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" "audit_action" NOT NULL,
    "resource" VARCHAR(100),
    "resource_id" UUID,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "success" BOOLEAN NOT NULL DEFAULT true,
    "failure_reason" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
