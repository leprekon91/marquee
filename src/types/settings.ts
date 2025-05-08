export type Setting = {
    id?: string;
    key: SettingKey;
    value: string;
};

export enum SettingKey {
    // Add your setting keys here
    BG_COLOR = 'bg_color',
    TEXT_COLOR = 'text_color',
    FONT_SIZE = 'font_size',
    FONT_FAMILY = 'font_family',
    CURRENT_DISPLAY = 'current_display', //which to show, competition titles or performer name 
    TITLE= 'title', // title of the competition
    SUBTITLE = 'subtitle', // subtitle of the competition
    CURRENT_CATEGORY = 'current_category', // current category id
    CURRENT_PERFORMER = 'current_performer', // current performer id
}

const defaultValues = {
    [SettingKey.BG_COLOR]: '#000000',
    [SettingKey.TEXT_COLOR]: '#FFFFFF',
    [SettingKey.FONT_SIZE]: '16px',
    [SettingKey.FONT_FAMILY]: 'Arial, sans-serif',
    [SettingKey.CURRENT_DISPLAY]: 'title',
    [SettingKey.CURRENT_CATEGORY]: '0',
    [SettingKey.CURRENT_PERFORMER]: '0',
    [SettingKey.TITLE]: 'Competition Title',
    [SettingKey.SUBTITLE]: 'Competition Subtitle',
};

export const getDefaultSettingValue = (key: SettingKey): string => {
    return defaultValues[key] || '';
}

export const getDefaultSettings = (): Setting[] => {
    return Object.entries(defaultValues).map(([key, value]) => ({
        key: key as SettingKey,
        value,
    }));
}