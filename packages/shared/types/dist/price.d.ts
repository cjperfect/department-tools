export interface MonitorItem {
    id: number;
    platform: string;
    url: string;
    image: string;
    name: string;
    shopName: string;
    currentPrice: number;
    targetPrice: number;
    diff: number;
}
/** 平台配置信息（包含目标价格） */
export interface PlatformConfig {
    platform: string;
    targetPrice: number;
}
export interface MonitorProduct {
    id: number;
    keyword: string;
    image: string;
    createdAt: string;
    /** 所有已配置的监控平台及其目标价格 */
    platforms: PlatformConfig[];
    /** 实际有搜索结果的条目（按平台分组） */
    items: MonitorItem[];
}
export interface MonitorStats {
    total: number;
    monitoring: number;
    triggered: number;
    priceDown: number;
    priceUp: number;
}
export interface SearchItem {
    name: string;
    price: number;
    shop: string;
    url: string;
    image: string;
    platform: string;
}
export interface SearchResult {
    groups: {
        platform: string;
        items: SearchItem[];
    }[];
    pageSize: number;
}
export interface MonitorItemIn {
    platform: string;
    targetPrice: number;
}
export interface AddMonitorRequest {
    keyword: string;
    items: MonitorItemIn[];
}
