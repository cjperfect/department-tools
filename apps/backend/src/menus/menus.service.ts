import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  // --------------- 菜单项 ---------------

  async list(params?: { page?: number; pageSize?: number; keyword?: string }) {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const where: any = {};
    if (params?.keyword) {
      where.OR = [
        { title: { contains: params.keyword } },
        { url: { contains: params.keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.menu.findMany({
        where,
        include: { group: true },
        orderBy: [{ group: { sort_order: 'asc' } }, { sort_order: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.menu.count({ where }),
    ]);

    return { code: 0, message: 'ok', data: { items, total, page, pageSize } };
  }

  async create(data: {
    title: string; url: string; icon: string; group_id: number;
    roles?: string[]; sort_order?: number;
  }) {
    const menu = await this.prisma.menu.create({
      data: {
        title: data.title,
        url: data.url,
        icon: data.icon,
        group_id: data.group_id,
        sort_order: data.sort_order ?? 0,
        roles: data.roles ?? [],
      },
      include: { group: true },
    });
    return { code: 0, message: '创建成功', data: menu };
  }

  async update(id: number, data: {
    title?: string; url?: string; icon?: string; group_id?: number;
    roles?: string[]; sort_order?: number;
  }) {
    try {
      const menu = await this.prisma.menu.update({
        where: { id },
        data: {
          ...data,
          roles: data.roles ?? undefined,
        },
        include: { group: true },
      });
      return { code: 0, message: '更新成功', data: menu };
    } catch {
      throw new NotFoundException('菜单项不存在');
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.menu.delete({ where: { id } });
      return { code: 0, message: '删除成功', data: null };
    } catch {
      throw new NotFoundException('菜单项不存在');
    }
  }

  // --------------- 分组 ---------------

  async listGroups() {
    const items = await this.prisma.menuGroup.findMany({
      orderBy: { sort_order: 'asc' },
    });
    return { code: 0, message: 'ok', data: { items } };
  }

  async createGroup(data: { name: string; sort_order?: number }) {
    const existing = await this.prisma.menuGroup.findUnique({ where: { name: data.name } });
    if (existing) throw new BadRequestException(`分组「${data.name}」已存在`);
    const group = await this.prisma.menuGroup.create({
      data: { name: data.name, sort_order: data.sort_order ?? 0 },
    });
    return { code: 0, message: '创建成功', data: group };
  }

  async updateGroup(id: number, data: { name?: string; sort_order?: number }) {
    if (data.name) {
      const existing = await this.prisma.menuGroup.findFirst({
        where: { name: data.name, id: { not: id } },
      });
      if (existing) throw new BadRequestException(`分组「${data.name}」已存在`);
    }
    try {
      const group = await this.prisma.menuGroup.update({ where: { id }, data });
      return { code: 0, message: '更新成功', data: group };
    } catch {
      throw new NotFoundException('分组不存在');
    }
  }

  async deleteGroup(id: number) {
    const count = await this.prisma.menu.count({ where: { group_id: id } });
    if (count > 0) throw new BadRequestException('该分组下还有菜单项，无法删除');
    try {
      await this.prisma.menuGroup.delete({ where: { id } });
      return { code: 0, message: '删除成功', data: null };
    } catch {
      throw new NotFoundException('分组不存在');
    }
  }
}
