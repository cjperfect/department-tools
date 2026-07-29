import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/** 东八区偏移量（毫秒）：8 小时 */
const TZ_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * 递归修正对象中所有 Date 字段的时区偏移。
 * Prisma 使用 dbgenerated 让数据库生成东八区时间，
 * 但 mysql2 驱动以 UTC 解析回读，导致 Date 多 8 小时，
 * 此处减去偏移量还原为正确的绝对时间。
 */
function fixDateTimezone<T>(value: T): T {
  if (value instanceof Date) {
    return new Date(value.getTime() - TZ_OFFSET_MS) as T;
  }
  if (Array.isArray(value)) {
    return value.map(fixDateTimezone) as T;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      result[key] = fixDateTimezone((value as Record<string, unknown>)[key]);
    }
    return result as T;
  }
  return value;
}

function createPrismaClientWithTzFix(): PrismaClient {
  return new PrismaClient().$extends({
    name: 'fix-timezone',
    query: {
      $allModels: {
        // 修正所有模型操作的返回结果中的 Date 时区偏移
        $allOperations({ args, query }) {
          return (query(args) as Promise<unknown>).then(fixDateTimezone);
        },
      },
    },
  }) as unknown as PrismaClient;
}

@Injectable()
export class PrismaService
  extends createPrismaClientWithTzFix()
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
