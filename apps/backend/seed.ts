/** 写入测试数据 — 移植自 seed.py。 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  // 清空现有数据
  await prisma.rawData.deleteMany();
  await prisma.analysisDimension.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.monitorItem.deleteMany();
  await prisma.monitorProduct.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.menuGroup.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.role.deleteMany();

  // 初始化角色
  const roleNames = ['super_admin', 'admin', 'user'];
  const roleMap: Record<string, number> = {};
  for (const name of roleNames) {
    const r = await prisma.role.create({ data: { name } });
    roleMap[name] = r.id;
  }
  console.log('角色初始化完成');

  // 初始化分组
  const mainGroup = await prisma.menuGroup.create({ data: { name: '主要导航', sort_order: 0 } });
  const adminGroup = await prisma.menuGroup.create({ data: { name: '管理', sort_order: 1 } });

  // 初始化菜单
  const menus = [
    { title: '首页', url: '/', icon: 'LayoutDashboard', group_id: mainGroup.id, sort_order: 0 },
    { title: '竞品分析', url: '/bidding', icon: 'BarChart3', group_id: mainGroup.id, sort_order: 1 },
    { title: '价格监控', url: '/monitor', icon: 'Eye', group_id: mainGroup.id, sort_order: 2 },
    { title: '用户管理', url: '/users', icon: 'Users', group_id: adminGroup.id, sort_order: 0, roles: ['super_admin', 'admin'] },
    { title: '部门管理', url: '/departments', icon: 'Building2', group_id: adminGroup.id, sort_order: 1, roles: ['super_admin', 'admin'] },
    { title: '菜单管理', url: '/menus', icon: 'Settings', group_id: adminGroup.id, sort_order: 2, roles: ['super_admin', 'admin'] },
  ];
  for (const { roles, ...m } of menus) {
    await prisma.menu.create({
      data: {
        ...m,
        roles: roles ?? [],
      },
    });
  }
  console.log('菜单初始化完成');

  // 初始化部门
  const departmentNames = ['AI与软件', 'GTM', 'ID', '项目部门', '产品中心', 'DQA', '结构部门', '电子部', '嵌入式部门', '研发支持'];
  for (const name of departmentNames) {
    await prisma.department.create({ data: { name } });
  }
  console.log('部门初始化完成');

  // 创建超级管理员
  const passwordHash = bcrypt.hashSync('admin123', 10);
  const aiDept = await prisma.department.findFirst({ where: { name: 'AI与软件' } });
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      employee_id: '0001',
      department_id: aiDept?.id ?? null,
      role_id: roleMap['super_admin'],
      password_hash: passwordHash,
      must_change_password: false,
    },
  });

}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
