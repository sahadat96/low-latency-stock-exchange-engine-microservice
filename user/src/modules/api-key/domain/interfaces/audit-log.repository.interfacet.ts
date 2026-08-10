import { Injectable } from '@nestjs/common';
import { Prisma, AuditAction } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

export interface CreateAuditLogPayload {
  userId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  failureReason?: string;
}

export interface IAuditLogRepository {
  create(payload: CreateAuditLogPayload): Promise<void>;
}

export const AUDIT_LOG_REPOSITORY = Symbol('IAuditLogRepository');

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateAuditLogPayload): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId:        payload.userId,
        action:        payload.action,
        resource:      payload.resource,
        resourceId:    payload.resourceId,
        metadata:      payload.metadata ?? {},
        ipAddress:     payload.ipAddress,
        userAgent:     payload.userAgent,
        success:       payload.success ?? true,
        failureReason: payload.failureReason,
      },
    });
  }
  
}