/** 写入 2 条竞品分析测试数据 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  // 找到 admin 用户
  const admin = await prisma.user.findFirst({ where: { username: 'admin' } });
  if (!admin) {
    console.error('未找到 admin 用户，请先运行 pnpm seed');
    process.exit(1);
  }

  const DIMENSION_TYPES = ['design', 'pricing', 'functionality', 'quality', 'service'];

  const records = [
    {
      url: 'https://item.jd.com/100012345678.html',
      platform: '京东',
      name: '索尼 WH-1000XM6 无线降噪头戴式耳机',
      image: '🎧',
      shop_name: '索尼官方旗舰店',
      category: '数码 > 耳机 > 头戴式耳机',
      current_price: 2099,
      original_price: 2999,
      monthly_sales: 8900,
      rating: 4.9,
      reviews: 42000,
      highlights: ['降噪效果行业第一', '30小时续航', '佩戴舒适'],
      warnings: ['价格偏高', '折叠体积大', '仅黑白两色'],
      gap_opportunities: ['增加莫兰迪色系', '便携折叠款'],
      dimensions: {
        design: {
          score: 8.5,
          detail: {
            packaging: '环保纸质包装，简约高级',
            colorOptions: ['黑色', '白色'],
            sizeOptions: ['均码'],
            userLikes: ['外观高级', '轻便不压头', '手感细腻'],
            userHates: ['容易沾指纹', '白色款易脏'],
            gapOpportunities: ['增加莫兰迪色系', '便携折叠款'],
          },
        },
        pricing: {
          score: 6.5,
          detail: {
            competitorPrice: 2099,
            ourPrice: 1899,
            hasFreeTrial: false,
            hasInstallment: true,
            plans: [{ name: '标准版', price: 2099 }],
            pricingGaps: ['Bose QC Ultra ¥2299 支持12期免息', 'AirPods Max ¥3999'],
          },
        },
        functionality: {
          score: 9.0,
          detail: {
            solves: ['通勤噪音隔绝', '办公室专注', '差旅长途'],
            gaps: ['不支持有线模式充电', '通话降噪弱于竞品'],
            painPoints: ['多设备切换偶有卡顿', 'App 设置复杂'],
          },
        },
        quality: {
          score: 8.0,
          detail: {
            easeOfUse: '佩戴即连，NFC 一触配对',
            durability: '主体耐用 5 年+，耳罩约 1 年更换',
            qualityIssues: ['耳罩皮革老化', '充电口防尘盖易丢'],
            userFeedback: {
              positive: ['降噪惊艳', '音质出色', '佩戴舒适'],
              negative: ['价格高', 'App 不好用', '白色不耐脏'],
            },
          },
        },
        service: {
          score: 7.5,
          detail: {
            responseStyle: '标准化流程，维修需寄回',
            avgResponseTime: '工作日约 4 小时',
            commonComplaints: ['维修周期长(2周)', '换货流程繁琐'],
            serviceLikes: ['2年官方保修', '线下门店体验好'],
          },
        },
      },
    },
    {
      url: 'https://item.taobao.com/item.htm?id=694593508978',
      platform: '淘宝',
      name: '金运A5蓝牙耳机气骨传导运动不入耳无线耳夹式挂2026新款',
      image: '🎧',
      shop_name: '金运旗舰店',
      category: '数码 > 耳机 > 蓝牙耳机',
      current_price: 94,
      original_price: 124,
      monthly_sales: 23000,
      rating: 4.8,
      reviews: 100000,
      highlights: ['不入耳设计舒适佩戴', '气骨传导技术漏音小', '政府补贴立减15%'],
      warnings: ['音质不如入耳式', '高音量有震动感', '通话降噪一般'],
      gap_opportunities: ['推出莫兰迪配色', '充电仓小型化', '联名限定款'],
      dimensions: {
        design: {
          score: 7.5,
          detail: {
            packaging: '天地盖礼盒装，开箱体验好',
            colorOptions: ['Ultra白', 'Ultra黑'],
            sizeOptions: ['标准版'],
            userLikes: ['轻便不入耳', '颜值高', '续航持久', '价格实惠'],
            userHates: ['黑色款沾指纹', '充电仓偏大', '没有彩色款'],
            gapOpportunities: ['推出莫兰迪配色', '充电仓小型化', '联名限定款'],
          },
        },
        pricing: {
          score: 8.0,
          detail: {
            competitorPrice: 94,
            ourPrice: 89,
            hasFreeTrial: false,
            hasInstallment: false,
            plans: [
              { name: '官方标配', price: 129 },
              { name: '套餐三', price: 139 },
              { name: '套餐四', price: 139 },
            ],
            pricingGaps: ['竞品山水骨传导仅¥79', '小米同类型¥69'],
          },
        },
        functionality: {
          score: 7.0,
          detail: {
            solves: ['运动时听歌', '通勤接电话', '长时间佩戴不痛'],
            gaps: ['无主动降噪', '无防水等级认证', '不支持多设备同时连接'],
            painPoints: ['蓝牙偶尔断连', '通话对方说有回音', '触控不灵敏'],
          },
        },
        quality: {
          score: 7.8,
          detail: {
            easeOfUse: '开盖即连，触控操作简单',
            durability: '日常使用 1-2 年，电池续航约 6 小时/次',
            qualityIssues: ['充电仓磁吸力度衰减', '耳夹硅胶老化变黄'],
            userFeedback: {
              positive: ['性价比高', '不入耳真的很舒服', '续航满意'],
              negative: ['低音不够沉', '通话效果一般'],
            },
          },
        },
        service: {
          score: 6.5,
          detail: {
            responseStyle: '自动回复+人工',
            avgResponseTime: '工作日约 2 小时',
            commonComplaints: ['退换货审核慢', '客服不够专业'],
            serviceLikes: ['7天无理由', '运费险覆盖'],
          },
        },
      },
    },
  ];

  for (const r of records) {
    const { dimensions, ...data } = r;
    const analysis = await prisma.analysis.create({
      data: {
        user_id: admin.id,
        ...data,
        analyzed_at: new Date(),
      },
    });

    for (const dimType of DIMENSION_TYPES) {
      const dimData = dimensions[dimType as keyof typeof dimensions];
      await prisma.analysisDimension.create({
        data: {
          analysis_id: analysis.id,
          dimension_type: dimType,
          score: dimData?.score ?? 0,
          detail: dimData?.detail ?? {},
        },
      });
    }

    // 写入空 raw_data（满足唯一约束）
    await prisma.rawData.create({
      data: {
        analysis_id: analysis.id,
        data: {},
      },
    });

    console.log(`已创建分析记录: ${r.name}`);
  }

  console.log('竞品分析测试数据写入完成');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
