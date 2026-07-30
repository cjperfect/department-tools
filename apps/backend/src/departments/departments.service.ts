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
    return { items }
  }

  async create(name: string) {
    const existing = await this.prisma.department.findUnique({
      where: { name },
    })
    if (existing) {
      throw new BadRequestException(`部门「${name}」已存在`)
    }
    return this.prisma.department.create({ data: { name } })
  }

  async update(id: number, name: string) {
    const existing = await this.prisma.department.findUnique({
      where: { name },
    })
    if (existing && existing.id !== id) {
      throw new BadRequestException(`部门「${name}」已存在`)
    }
    return this.prisma.department.update({
      where: { id },
      data: { name },
    }).catch(() => {
      throw new NotFoundException('部门不存在')
    })
  }

  async delete(id: number) {
    await this.prisma.department.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('部门不存在')
    })
  }
}
