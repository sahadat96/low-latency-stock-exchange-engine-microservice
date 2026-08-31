-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "type" "transaction_type" NOT NULL,
    "status" "transaction_status" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(30,8) NOT NULL,
    "currency" "currency" NOT NULL,
    "balance_before" DECIMAL(30,8) NOT NULL,
    "balance_after" DECIMAL(30,8) NOT NULL,
    "reference_id" VARCHAR(255),
    "description" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wallet_transactions_wallet_id_idx" ON "wallet_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_wallet_id_created_at_idx" ON "wallet_transactions"("wallet_id", "created_at");

-- CreateIndex
CREATE INDEX "wallet_transactions_type_idx" ON "wallet_transactions"("type");

-- CreateIndex
CREATE INDEX "wallet_transactions_status_idx" ON "wallet_transactions"("status");

-- CreateIndex
CREATE INDEX "wallet_transactions_reference_id_idx" ON "wallet_transactions"("reference_id");

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
