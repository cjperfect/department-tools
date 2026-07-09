import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.department.findMany({
      orderBy: { created_at: 'desc' },
    });
    return { code: 0, message: 'ok', data: { items } };
  }

  async create(name: string) {
    const existing = await this.prisma.department.findUnique({
      where: { name },
    });
    if (existing) {
      throw new BadRequestException(`部门「${name}」已存在`);
    }
    const department = await this.prisma.department.create({
      data: { name },
    });
    return { code: 0, message: '创建成功', data: department };
  }

  async update(id: number, name: string) {
    const existing = await this.prisma.department.findUnique({
      where: { name },
    });
    if (existing && existing.id !== id) {
      throw new BadRequestException(`部门「${name}」已存在`);
    }
    try {
      const department = await this.prisma.department.update({
        where: { id },
        data: { name },
      });
      return { code: 0, message: '更新成功', data: department };
    } catch {
      throw new NotFoundException('部门不存在');
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.department.delete({ where: { id } });
      return { code: 0, message: '删除成功', data: null };
    } catch {
      throw new NotFoundException('部门不存在');
    }
  }
}
