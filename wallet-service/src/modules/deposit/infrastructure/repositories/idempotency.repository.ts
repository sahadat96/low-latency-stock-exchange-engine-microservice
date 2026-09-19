import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import type {
  IIdempotencyRepository,
} from '../../domain/interfaces/idempotency.repository.interface';

import type {
  IdempotencyRecord,
} from '../../domain/types/deposit.types';

@Injectable()
export class IdempotencyRepository
  implements IIdempotencyRepository
{
  private readonly logger = new Logger(
    IdempotencyRepository.name,
  );

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async find(
    userId: string,
    key: string,
    operation: string,
  ): Promise<IdempotencyRecord | null> {
    const record =
      await this.prisma.idempotencyKey.findUnique({
        where: {
          userId_key_operation: {
            userId,
            key,
            operation,
          },
        },
      });

    return record;
  }
}