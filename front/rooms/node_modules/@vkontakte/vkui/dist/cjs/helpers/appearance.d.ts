import { AppearanceSchemeType, AppearanceType } from '@vkontakte/vk-bridge';
export declare enum Scheme {
    BRIGHT_LIGHT = "bright_light",
    SPACE_GRAY = "space_gray",
    VKCOM_LIGHT = "vkcom_light",
    VKCOM_DARK = "vkcom_dark"
}
export declare type AppearanceScheme = AppearanceSchemeType | Scheme.VKCOM_DARK | Scheme.VKCOM_LIGHT;
export declare enum Appearance {
    DARK = "dark",
    LIGHT = "light"
}
export declare const deriveAppearance: (scheme: AppearanceScheme | undefined) => AppearanceType;
export interface VKBridgeConfigData {
    appearance?: AppearanceType;
    scheme: AppearanceScheme;
}
export declare function resolveAppearance(data: VKBridgeConfigData): AppearanceType | null;
