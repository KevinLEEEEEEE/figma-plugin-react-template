import { Language, DisplayMode, AutoStylelintMode, TranslationModal, SettingKey } from '../types';
import { getAbsolutePosition } from '@create-figma-plugin/utilities';

async function getClientStorageValue(key: string, defaultValue: any) {
    const value = await figma.clientStorage.getAsync(key);
    return value !== undefined ? value : defaultValue;
}

export async function getSettingByKey(key: SettingKey) {
    switch (key) {
        case SettingKey.TargetLanguage:
            return getClientStorageValue("targetLanguage", Language.EN);
        case SettingKey.DisplayMode:
            return getClientStorageValue("displayMode", DisplayMode.Duplicate);
        case SettingKey.TranslationModal:
            return getClientStorageValue("translationModal", TranslationModal.GoogleBasic);
        case SettingKey.AutoStylelintMode:
            return getClientStorageValue("autoStylelintMode", AutoStylelintMode.On);
        case SettingKey.isFirstOpen:
            return getClientStorageValue("isFirstOpen", true);
        default:
            return '';
    }
}

export function setNodeOffset(node: SceneNode, offset: { x: number; y: number }) {
    const position = getAbsolutePosition(node);
    node.x = position.x + offset.x;
    node.y = position.y + offset.y;
}
