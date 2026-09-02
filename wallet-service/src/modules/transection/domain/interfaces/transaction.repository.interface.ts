import type { 
    ListTransactionsFilter,
    TransactionListResult,
 } from "../types/transaction.types";

export interface ITransactionRepository {
  findByUser(
    filter: ListTransactionsFilter,
  ): Promise<TransactionListResult>;
}

export const TRANSACTION_REPOSITORY = Symbol('ITransactionRepository');