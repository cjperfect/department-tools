export declare const PLATFORM_JD = "\u4EAC\u4E1C";
export declare const PLATFORM_TMALL = "\u5929\u732B";
export declare const PLATFORM_TAOBAO = "\u6DD8\u5B9D";
export declare const PLATFORM_PINDUODUO = "\u62FC\u591A\u591A";
export declare const PLATFORMS: readonly ["京东", "天猫", "淘宝", "拼多多"];
export type Platform = (typeof PLATFORMS)[number];
export declare const ROLE_HIERARCHY: Record<string, number>;
export declare function getRoleLevel(role: string): number;
