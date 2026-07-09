/** 写入测试数据 — 移植自 seed.py。 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PLATFORMS = ['京东', '淘宝', '天猫', '拼多多', '抖音'];

const SHOP_NAMES: Record<string, string[]> = {
  '京东': ['京东自营旗舰店', 'XX数码专营店', 'YY电器旗舰店', 'ZZ官方旗舰店', 'AA品牌旗舰店'],
  '淘宝': ['官方旗舰店', 'XX数码城', 'YY优选店', 'ZZ正品店', 'AA数码港'],
  '天猫': ['官方旗舰店', 'XX旗舰店', 'YY数码旗舰店', 'ZZ电器旗舰店', 'AA专营店'],
  '拼多多': ['品牌旗舰店', 'XX数码专营', 'YY电器商行', 'ZZ品牌店', 'AA优选'],
  '抖音': ['官方直播间', 'XX数码直播间', 'YY旗舰直播间', 'ZZ好物直播间', 'AA精选直播间'],
};

const PRODUCTS: Array<[string, string, number[]]> = [
  ['金运A5蓝牙耳机', '🎧', [129, 109, 99, 94, 89]],
  ['iPhone 17 Pro Max 256GB', '📱', [10499, 10299, 10199, 9999, 9499]],
  ['索尼 WH-1000XM6', '🎧', [2199, 2099, 1999, 1899, 1799]],
  ['MacBook Pro 14 M4 Pro', '💻', [16999, 16499, 16299, 16699, 15699]],
  ['戴森 V16 Detect', '🧹', [4899, 4799, 4690, 4590, 4299]],
];

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

  let total = 0;
  for (const [name, image, basePrices] of PRODUCTS) {
    const mp = await prisma.monitorProduct.create({
      data: {
        user_id: admin.id,
        name,
        image,
      },
    });

    for (const platform of PLATFORMS) {
      const shops = SHOP_NAMES[platform];
      for (let i = 0; i < shops.length; i++) {
        const price = Math.round(basePrices[i] * (0.95 + Math.random() * 0.13) * 100) / 100;
        const target = Math.round(price * (0.88 + Math.random() * 0.10) * 100) / 100;
        const diff = Math.round((price - target) * 100) / 100;
        const status = price <= target ? 1 : 0;

        await prisma.monitorItem.create({
          data: {
            product_id: mp.id,
            platform,
            url: '',
            current_price: price,
            target_price: target,
            diff,
            status,
          },
        });
        total++;
      }
    }
  }

  console.log(`写入完成: ${PRODUCTS.length} 产品 × 5 平台 × 5 店铺 = ${total} 条监控`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
