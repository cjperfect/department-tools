/** 单日价格点 */
export interface PricePoint {
    date: string;
    price: number;
}
/** datePrice 原始条目: [timestamp_ms, price, remark] */
export type DatePriceEntry = [number, number, string];
/** 历史价格查询响应 */
export interface HistoryPriceResponse {
    spPic: string;
    spUrl: string;
    spName: string;
    siteName: string;
    datePrice: DatePriceEntry[];
    lowerDate: string;
    lowerPrice: number | string;
    currentPrice: number | string;
    avgPrice60: number | string;
}
/** 已保存的历史价格查询记录（数据库字段名） */
export interface HistoryPriceQueryItem {
    id: number;
    product_url: string;
    product_name: string;
    image_url: string;
    platform: string;
    current_price: number;
    lowest_price: number;
    lowest_price_date: string | null;
    price_list: unknown[];
    created_at: string;
    updated_at: string;
}
