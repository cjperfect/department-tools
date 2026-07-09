import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { getRoleLevel } from '../common/constants';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

/** 用户查询时统一 include 的关联 */
const USER_INCLUDE = { department: true, role: true } as const;

/** 将 DB 查询结果中的 role 对象映射为 role 名字符串 */
function mapRole(user: any) {
  if (user && user.role && typeof user.role === 'object') {
    return { ...user, role: user.role.name };
  }
  return user;
}

async function buildMenu(prisma: PrismaService, role: string) {
  const menus = await prisma.menu.findMany({
    include: { group: true },
    orderBy: [{ group: { sort_order: 'asc' } }, { sort_order: 'asc' }],
  });

  // 按分组归类，并过滤角色
  const groups = new Map<string, { title: string; url: string; icon: string }[]>();
  for (const m of menus) {
    // 有角色限制的检查当前用户角色是否匹配
    let menuRoles: string[] = [];
    if (Array.isArray(m.roles)) {
      menuRoles = m.roles as string[];
    } else if (typeof m.roles === 'string') {
      try { menuRoles = JSON.parse(m.roles); } catch { /* ignore */ }
    }
    if (menuRoles.length > 0 && !menuRoles.includes(role)) continue;
    const groupName = m.group.name;
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName)!.push({
      title: m.title,
      url: m.url,
      icon: m.icon,
    });
  }

  return Array.from(groups.entries()).map(([title, items]) => ({ title, items }));
}

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.randomBytes(length))
    .map((b) => chars[b % chars.length])
    .join('');
}

/** 根据角色名查找 role_id */
async function resolveRoleId(prisma: PrismaService, roleName: string): Promise<number> {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new BadRequestException(`角色「${roleName}」不存在`);
  return role.id;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { username, is_delete: false },
      include: USER_INCLUDE,
    });
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return { code: 401, message: '用户名或密码错误' };
    }
    if (user.status !== 'active') {
      return { code: 401, message: '账号已被禁用，请联系管理员' };
    }
    const token = this.jwtService.sign({
      sub: String(user.id),
      username: user.username,
      role: user.role.name,
    });
    const { password_hash, role: _role, ...rest } = user;
    return {
      code: 0,
      message: 'ok',
      data: {
        token,
        user: { ...rest, role: user.role.name },
        mustChangePassword: user.must_change_password,
      },
    };
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !bcrypt.compareSync(oldPassword, user.password_hash)) {
      return { code: 400, message: '原密码错误' };
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: bcrypt.hashSync(newPassword, 10),
        must_change_password: false,
      },
    });
    return { code: 0, message: '密码已修改', data: null };
  }

  async getMenu(role: string) {
    const navGroups = await buildMenu(this.prisma, role);
    return { code: 0, message: 'ok', data: { navGroups } };
  }

  // ------------------------------------------------------------------
  // 管理员 — 用户管理
  // ------------------------------------------------------------------

  async getUsers(
    adminRole: string,
    page: number,
    pageSize: number,
    username?: string,
    roleFilter?: string,
  ) {
    const where: any = { is_delete: false };
    if (username) where.username = { contains: username };
    if (roleFilter) where.role = { name: roleFilter };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: USER_INCLUDE,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      code: 0,
      message: 'ok',
      data: {
        items: items.map(mapRole),
        total,
        page,
        pageSize,
      },
    };
  }

  async createUser(
    adminUser: { id: number; role: string },
    body: {
      username: string;
      employee_id?: string;
      department_id?: number;
      password: string;
      role: string;
      status: string;
    },
  ) {
    const currentLevel = getRoleLevel(adminUser.role);
    const targetLevel = getRoleLevel(body.role);
    if (targetLevel >= currentLevel) {
      throw new ForbiddenException('无权创建该角色的用户');
    }

    const existing = await this.prisma.user.findFirst({
      where: { username: body.username, is_delete: false },
    });
    if (existing) {
      throw new BadRequestException(`用户名「${body.username}」已存在`);
    }

    if (body.employee_id) {
      const existingEmp = await this.prisma.user.findFirst({
        where: { employee_id: body.employee_id, is_delete: false },
      });
      if (existingEmp) {
        throw new BadRequestException(`工号「${body.employee_id}」已存在`);
      }
    }

    const roleId = await resolveRoleId(this.prisma, body.role);
    const rawPassword = generatePassword();
    try {
      const user = await this.prisma.user.create({
        data: {
          username: body.username,
          employee_id: body.employee_id || null,
          department_id: body.department_id || null,
          role_id: roleId,
          password_hash: bcrypt.hashSync(rawPassword, 10),
          status: body.status,
        },
        include: USER_INCLUDE,
      });

      const { password_hash, role: _role, ...result } = user;
      return {
        code: 0,
        message: '用户已创建',
        data: { ...result, role: user.role.name, rawPassword },
      };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = (e.meta?.target as string[]) || [];
        if (target.includes('username')) {
          throw new ConflictException(`用户名「${body.username}」已存在`);
        }
        if (target.includes('employee_id')) {
          throw new ConflictException(`工号「${body.employee_id}」已存在`);
        }
      }
      throw e;
    }
  }

  async updateUser(
    adminUser: { id: number; role: string },
    userId: number,
    body: {
      employee_id?: string;
      department_id?: number;
      role?: string;
      status?: string;
    },
  ) {
    const currentLevel = getRoleLevel(adminUser.role);

    // 不能冻结自己
    if (body.status && adminUser.id === userId) {
      throw new ForbiddenException('不能冻结自己的账号');
    }

    const target = await this.prisma.user.findFirst({
      where: { id: userId, is_delete: false },
      include: USER_INCLUDE,
    });
    if (!target) {
      throw new NotFoundException('用户不存在');
    }

    const targetRoleName = target.role.name;
    const targetLevel = getRoleLevel(targetRoleName);
    if (currentLevel <= targetLevel && adminUser.role !== targetRoleName) {
      throw new ForbiddenException('无权修改该用户的信息');
    }

    // 不允许冻结同级或上级
    if (body.status === 'inactive' && targetLevel >= currentLevel && adminUser.role !== targetRoleName) {
      throw new ForbiddenException('不能冻结同级或上级账号');
    }

    // 将角色名转为 role_id
    const updateData: any = { ...body };
    if (body.role) {
      updateData.role_id = await resolveRoleId(this.prisma, body.role);
    }
    delete updateData.role;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: USER_INCLUDE,
    });

    const { password_hash, role: _role, ...result } = updated;
    return { code: 0, message: '用户已更新', data: { ...result, role: updated.role.name } };
  }

  async deleteUser(adminUser: { id: number; role: string }, userId: number) {
    if (adminUser.id === userId) {
      throw new ForbiddenException('不能删除自己的账号');
    }

    const currentLevel = getRoleLevel(adminUser.role);

    const target = await this.prisma.user.findFirst({
      where: { id: userId, is_delete: false },
      include: USER_INCLUDE,
    });
    if (!target) {
      throw new NotFoundException('用户不存在');
    }

    const targetRoleName = target.role.name;
    const targetLevel = getRoleLevel(targetRoleName);
    if (currentLevel <= targetLevel && adminUser.role !== targetRoleName) {
      throw new ForbiddenException('无权删除该用户');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { is_delete: true },
    });

    return { code: 0, message: '用户已删除', data: null };
  }

  async resetPassword(
    adminUser: { id: number; role: string },
    userId: number,
    newPassword?: string,
  ) {
    const currentLevel = getRoleLevel(adminUser.role);

    const target = await this.prisma.user.findFirst({
      where: { id: userId, is_delete: false },
      include: USER_INCLUDE,
    });
    if (!target) {
      throw new NotFoundException('用户不存在');
    }

    const targetRoleName = target.role.name;
    const targetLevel = getRoleLevel(targetRoleName);
    if (currentLevel <= targetLevel && adminUser.role !== targetRoleName) {
      throw new ForbiddenException('无权重置该用户的密码');
    }

    const rawPassword = newPassword || generatePassword();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: bcrypt.hashSync(rawPassword, 10),
        must_change_password: true,
      },
    });

    return { code: 0, message: '密码已重置', data: { rawPassword } };
  }

  async getUserById(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, is_delete: false },
      include: USER_INCLUDE,
    });
    if (!user) throw new NotFoundException('用户不存在');
    const { password_hash, role: _role, ...result } = user;
    return { code: 0, message: 'ok', data: { ...result, role: user.role.name } };
  }

  async getUser(userId: number) {
    return this.getUserById(userId);
  }
}
