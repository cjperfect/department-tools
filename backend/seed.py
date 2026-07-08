"""写入测试数据到数据库。"""

import asyncio
from datetime import datetime

from app.db.session import async_session
from app.models.analysis import Analysis
from app.models.dimension import AnalysisDimension
from app.models.enums import DimensionType
from app.models.monitor import PriceMonitor
from app.models.product import Product
from app.models.raw_data import RawData


async def seed():
    async with async_session() as db:
        # 清空旧数据
        for table in [RawData, AnalysisDimension, Analysis, Product, PriceMonitor]:
            await db.execute(table.__table__.delete())

        # ================================================================
        # 商品 1：金运 A5 蓝牙耳机（淘宝真实数据）
        # ================================================================
        p1 = Product(
            url="https://item.taobao.com/item.htm?id=694593508978",
            platform="淘宝",
            name="金运A5蓝牙耳机气骨传导运动不入耳无线耳夹式挂2026新款",
            image="🎧",
            shop_name="金运旗舰店",
            category="数码 > 耳机 > 蓝牙耳机",
        )
        db.add(p1)
        await db.flush()

        a1 = Analysis(
            product_id=p1.id,
            current_price=94.00,
            original_price=124.00,
            monthly_sales=23000,
            rating=4.8,
            reviews=100000,
            highlights=["不入耳设计舒适佩戴", "气骨传导技术漏音小", "政府补贴立减15%"],
            warnings=["音质不如入耳式", "高音量有震动感", "通话降噪一般"],
            gap_opportunities=["增加主动降噪版", "推出运动防水款", "APP 自定义 EQ"],
            analyzed_at=datetime.now(),
        )
        db.add(a1)
        await db.flush()

        dims_p1 = [
            (DimensionType.design, 7.5, {
                "packaging": "天地盖礼盒装，开箱体验好",
                "colorOptions": ["Ultra白", "Ultra黑"],
                "sizeOptions": ["标准版"],
                "userLikes": ["轻便不入耳", "颜值高", "续航持久", "价格实惠"],
                "userHates": ["黑色款沾指纹", "充电仓偏大", "没有彩色款"],
                "gapOpportunities": ["推出莫兰迪配色", "充电仓小型化", "联名限定款"],
            }),
            (DimensionType.pricing, 8.0, {
                "competitorPrice": 94.00,
                "ourPrice": 89.00,
                "hasFreeTrial": False,
                "hasInstallment": False,
                "plans": [
                    {"name": "官方标配", "price": 129.00},
                    {"name": "套餐三（耳机+保护套）", "price": 139.00},
                    {"name": "套餐四（耳机+保护套+充电头）", "price": 139.00},
                ],
                "pricingGaps": ["竞品山水骨传导仅¥79", "小米同类型¥69"],
            }),
            (DimensionType.functionality, 7.0, {
                "solves": ["运动时听歌", "通勤接电话", "长时间佩戴不痛"],
                "gaps": ["无主动降噪", "无防水等级认证", "不支持多设备同时连接"],
                "painPoints": ["蓝牙偶尔断连", "通话对方说有回音", "触控不灵敏"],
            }),
            (DimensionType.quality, 7.8, {
                "easeOfUse": "开盖即连，触控操作简单",
                "durability": "日常使用 1-2 年，电池续航约 6 小时/次",
                "qualityIssues": ["充电仓磁吸力度衰减", "耳夹硅胶老化变黄"],
                "userFeedback": {
                    "positive": ["性价比高", "不入耳真的很舒服", "续航满意"],
                    "negative": ["低音不够沉", "通话效果一般", "戴久了还是会有点痛"],
                },
            }),
            (DimensionType.service, 6.5, {
                "responseStyle": "自动回复+人工，回复速度尚可",
                "avgResponseTime": "工作日约 2 小时",
                "commonComplaints": ["退换货审核慢", "客服不够专业"],
                "serviceLikes": ["7天无理由", "运费险覆盖"],
            }),
        ]
        for dt, score, detail in dims_p1:
            db.add(AnalysisDimension(
                analysis_id=a1.id,
                dimension_type=dt,
                score=score,
                detail=detail,
            ))

        db.add(RawData(analysis_id=a1.id, data={
            "detail": {"itemId": 694593508978, "title": p1.name, "itemPrice": 12400, "DiscountPrice": 9400},
            "comments": {"total": 100000},
            "price": None,
        }))

        # ================================================================
        # 商品 2：iPhone 17 Pro Max（淘宝搜索真实数据）
        # ================================================================
        p2 = Product(
            url="https://item.taobao.com/item.htm?id=975382453065",
            platform="淘宝",
            name="Apple/苹果 iPhone 17 Pro Max 手机",
            image="📱",
            shop_name="Apple授权专营店-国家补贴",
            category="数码 > 手机 > 5G手机",
        )
        db.add(p2)
        await db.flush()

        a2 = Analysis(
            product_id=p2.id,
            current_price=9999.00,
            original_price=10999.00,
            monthly_sales=12000,
            rating=4.9,
            reviews=56000,
            highlights=["A19 Pro 性能强悍", "钛金属机身质感好", "影像系统全面升级"],
            warnings=["价格较高", "重量偏重", "充电速度慢于安卓"],
            gap_opportunities=["增加快充功率", "开放侧载", "降低起售价"],
            analyzed_at=datetime.now(),
        )
        db.add(a2)
        await db.flush()

        dims_p2 = [
            (DimensionType.design, 9.2, {
                "packaging": "苹果一贯极简白盒，环保材质",
                "colorOptions": ["原色钛金属", "蓝色钛金属", "白色钛金属", "黑色钛金属"],
                "sizeOptions": ["256GB", "512GB", "1TB"],
                "userLikes": ["钛金属边框手感极佳", "屏幕惊艳", "做工无敌"],
                "userHates": ["灵动岛占面积", "摄像头凸起严重", "重量 221g"],
                "gapOpportunities": ["屏下 Face ID", "折叠屏版本"],
            }),
            (DimensionType.pricing, 4.5, {
                "competitorPrice": 9999.00,
                "ourPrice": 8999.00,
                "hasFreeTrial": False,
                "hasInstallment": True,
                "plans": [
                    {"name": "256GB", "price": 9999.00},
                    {"name": "512GB", "price": 11999.00},
                    {"name": "1TB", "price": 13999.00},
                ],
                "pricingGaps": ["华为 Mate 80 Pro 同配置 ¥7999", "三星 S27 Ultra ¥8999"],
            }),
            (DimensionType.functionality, 8.8, {
                "solves": ["日常拍照", "视频创作", "重度游戏", "移动办公"],
                "gaps": ["无侧载应用", "文件管理不如安卓", "NFC 受限"],
                "painPoints": ["iOS 18 偶尔卡顿", "Airdrop 大文件会断", "灵动岛适配不完整"],
            }),
            (DimensionType.quality, 9.5, {
                "easeOfUse": "iOS 上手快，生态联动无感切换",
                "durability": "钛金属+超晶瓷面板，日常使用 3-5 年",
                "qualityIssues": ["钛金属边框易刮花", "摄像头蓝宝石玻璃碎裂风险"],
                "userFeedback": {
                    "positive": ["流畅度无敌", "拍照真实自然", "电池比上代耐用"],
                    "negative": ["贵", "充电太慢", "灵动岛没用"],
                },
            }),
            (DimensionType.service, 7.0, {
                "responseStyle": "Apple Store 天才吧专业高效",
                "avgResponseTime": "在线客服约 5 分钟",
                "commonComplaints": ["过保维修太贵", "AppleCare+ 性价比低", "换电池需预约"],
                "serviceLikes": ["天才吧服务专业", "14天无理由退换"],
            }),
        ]
        for dt, score, detail in dims_p2:
            db.add(AnalysisDimension(
                analysis_id=a2.id,
                dimension_type=dt,
                score=score,
                detail=detail,
            ))

        db.add(RawData(analysis_id=a2.id, data={
            "detail": {"itemId": 975382453065, "title": p2.name, "itemPrice": 1099900, "DiscountPrice": 999900},
            "comments": {"total": 56000},
            "price": None,
        }))

        # ================================================================
        # 商品 3：京东耳机（模拟）
        # ================================================================
        p3 = Product(
            url="https://item.jd.com/100012345678.html",
            platform="京东",
            name="索尼 WH-1000XM6 无线降噪头戴式耳机",
            image="🎧",
            shop_name="索尼官方旗舰店",
            category="数码 > 耳机 > 头戴式耳机",
        )
        db.add(p3)
        await db.flush()

        a3 = Analysis(
            product_id=p3.id,
            current_price=2099.00,
            original_price=2999.00,
            monthly_sales=8900,
            rating=4.9,
            reviews=42000,
            highlights=["降噪效果行业第一", "30小时续航", "佩戴舒适"],
            warnings=["价格偏高", "折叠体积大", "仅黑白两色"],
            gap_opportunities=["增加空间音频", "推出彩色款", "轻量化设计"],
            analyzed_at=datetime.now(),
        )
        db.add(a3)
        await db.flush()

        dims_p3 = [
            (DimensionType.design, 8.5, {
                "packaging": "环保纸质包装，简约高级",
                "colorOptions": ["黑色", "白色"],
                "sizeOptions": ["均码"],
                "userLikes": ["外观高级", "轻便不压头", "手感细腻"],
                "userHates": ["容易沾指纹", "白色款易脏"],
                "gapOpportunities": ["增加莫兰迪色系", "便携折叠款"],
            }),
            (DimensionType.pricing, 6.5, {
                "competitorPrice": 2099.00,
                "ourPrice": 1899.00,
                "hasFreeTrial": False,
                "hasInstallment": True,
                "plans": [{"name": "标准版", "price": 2099.00}],
                "pricingGaps": ["Bose QC Ultra ¥2299 支持12期免息", "AirPods Max ¥3999"],
            }),
            (DimensionType.functionality, 9.0, {
                "solves": ["通勤噪音隔绝", "办公室专注", "差旅长途"],
                "gaps": ["不支持有线模式充电", "通话降噪弱于竞品"],
                "painPoints": ["多设备切换偶有卡顿", "App 设置复杂"],
            }),
            (DimensionType.quality, 8.0, {
                "easeOfUse": "佩戴即连，NFC 一触配对",
                "durability": "主体耐用 5 年+，耳罩约 1 年更换",
                "qualityIssues": ["耳罩皮革老化", "充电口防尘盖易丢"],
                "userFeedback": {
                    "positive": ["降噪惊艳", "音质出色", "佩戴舒适"],
                    "negative": ["价格高", "App 不好用", "白色不耐脏"],
                },
            }),
            (DimensionType.service, 7.5, {
                "responseStyle": "标准化流程，维修需寄回",
                "avgResponseTime": "工作日约 4 小时",
                "commonComplaints": ["维修周期长(2周)", "换货流程繁琐"],
                "serviceLikes": ["2年官方保修", "线下门店体验好"],
            }),
        ]
        for dt, score, detail in dims_p3:
            db.add(AnalysisDimension(
                analysis_id=a3.id,
                dimension_type=dt,
                score=score,
                detail=detail,
            ))

        db.add(RawData(analysis_id=a3.id, data={
            "detail": {"item_id": "100012345678", "title": p3.name},
            "comments": {"total": 42000},
            "price": None,
        }))

        # ================================================================
        # 价格监控数据
        # ================================================================
        monitors = [
            PriceMonitor(url=p1.url, platform=p1.platform, product_name=p1.name,
                         sku="694593508978", current_price=94.00, target_price=80.00,
                         diff=-14.00, status="监控中"),
            PriceMonitor(url=p2.url, platform=p2.platform, product_name=p2.name,
                         sku="975382453065", current_price=9999.00, target_price=9500.00,
                         diff=-499.00, status="已触发"),
            PriceMonitor(url=p3.url, platform=p3.platform, product_name=p3.name,
                         sku="100012345678", current_price=2099.00, target_price=2200.00,
                         diff=101.00, status="监控中"),
            PriceMonitor(url="https://detail.tmall.com/item.htm?id=67890123456",
                         platform="天猫", product_name="苹果 MacBook Pro 14 M3 Pro",
                         sku="67890123456", current_price=14999.00, target_price=14000.00,
                         diff=-999.00, status="监控中"),
            PriceMonitor(url="https://item.jd.com/100055566677.html",
                         platform="京东", product_name="小米 14 Ultra 骁龙8Gen3",
                         sku="100055566677", current_price=4299.00, target_price=4000.00,
                         diff=-299.00, status="已触发"),
        ]
        for m in monitors:
            db.add(m)

        await db.commit()
        print(f"写入完成: {3} 条竞品分析, {len(monitors)} 条监控")


if __name__ == "__main__":
    asyncio.run(seed())
