import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { IWalletRepository } from '../domain/interfaces/wallet.repository.interface';

import { 
    FindWalletByUserFilter,
    WalletEntity,
 } from '../domain/types/wallet.types';

@Injectable()
export class WalletRepository implements IWalletRepository {
  private readonly logger =
    new Logger(WalletRepository.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByUser(
    filter: FindWalletByUserFilter,
  ): Promise<WalletEntity | null> {
    return this.prisma.wallet.findUnique({
      where: {
        userId: filter.userId,
      },
    });
  }
}