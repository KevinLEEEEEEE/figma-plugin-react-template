import { on, emit } from '@create-figma-plugin/utilities';
import {
    ResizeWindowHandler,
    TranslateHandler,
    StylelintHandler,
    ChangeSettingHandler,
    DisplayMode,
    ProcessUnit,
    AutoStylelintMode,
    AjaxResponseHandler,
    ReadSettingHandler,
    ReturnSettingHandler,
    SettingKey,
} from './types';
import {
    getSettingByKey,
    hasUntranslatedChars,
    setNodeOffset
} from './utility';
import {
    test
} from './translator';

// 初始化插件
function init() {
    figma.showUI(__html__, { width: 380, height: 308 });
    figma.skipInvisibleInstanceChildren = true;

    test();
}

// 处理翻译请求
async function handleTranslate() {
    if (!isSelectionEmpty()) {
        const autoStylelintMode = await getSettingByKey(SettingKey.AutoStylelintMode);
        runProcess([...figma.currentPage.selection], true, autoStylelintMode === AutoStylelintMode.On);
    } else {
        console.log('【没有选中节点】');
    }
}

// 处理样式检查请求
async function handleStylelint() {
    if (!isSelectionEmpty()) {
        runProcess([...figma.currentPage.selection], false, true);
    } else {
        console.log('【没有选中节点】');
    }
}

// 处理设置变更
async function handleChangeSetting({ key, value }: { key: string, value: any }) {
    await figma.clientStorage.setAsync(key, value);
}

// 处理请求完成
function handleRequestComplete({ isSuccessful, data, errMessage, unit }: { isSuccessful: boolean; data?: any; errMessage?: JQueryXHR; unit: ProcessUnit }) {
    if (isSuccessful && data) {
        translationComplete(data, unit);
    } else if (errMessage) {
        console.log(errMessage);
    }
}

// 读取设置
async function handleReadSetting({ key }: { key: SettingKey }) {
    const value = key === SettingKey.TargetLanguage ? await getSettingByKey(SettingKey.TargetLanguage) :
        key === SettingKey.DisplayMode ? await getSettingByKey(SettingKey.DisplayMode) : '';

    emit<ReturnSettingHandler>('RETURN_SETTING', { key, value });
}

// 核心处理逻辑
async function runProcess(nodes: SceneNode[], needTranslation: boolean, needStylelint: boolean) {
    const targetLanguage = await getSettingByKey(SettingKey.TargetLanguage);
    const displayMode = await getSettingByKey(SettingKey.DisplayMode);
    const processUnits: ProcessUnit[] = [];

    console.log(`【开始处理】目标语言: ${targetLanguage}, 显示模式: ${displayMode}`);

    // 处理复制模式
    if (displayMode === DisplayMode.Duplicate) {
        nodes = nodes.map(node => {
            const clonedNode = node.clone();
            clonedNode.name = `${clonedNode.name}/${targetLanguage}`;
            setNodeOffset(clonedNode, { x: clonedNode.width + 60, y: 0 });
            return clonedNode;
        });
    }

    // 收集需要处理的文本节点
    const collectTextNodes = (node: SceneNode) => {
        if (node.type === 'TEXT') {
            processUnits.push({
                node: node,
                nodeID: node.id,
                targetLanguage,
                needTranslation: needTranslation && hasUntranslatedChars(targetLanguage, node.characters),
                needStylelint: needStylelint,
            });
        } else if ('children' in node) {
            node.children.forEach(collectTextNodes);
        }
    };

    nodes.forEach(collectTextNodes);

    console.log('【单元准备就绪】', processUnits);

    await doTranslation(processUnits);
    await doStylelint(processUnits);
}

// 翻译处理
async function doTranslation(units: ProcessUnit[]) {
    const translationModal = await getSettingByKey(SettingKey.TranslationModal);
    const transUnits = units.filter(unit => unit.needTranslation);


    // await translateContentByModal(transUnits, translationModal);
}

// 翻译完成处理
async function translationComplete(data: any, unit: ProcessUnit) {
    // const translationModal = await getSettingByKey(SettingKey.TranslationModal);
    // const result = handleTranslatedContentByModal(data, translationModal);

    // console.log('【获取翻译内容】', result);
    // console.log(unit);

    // // TODO: 应用国际化规则
    // await updateNodeContent(result, unit.node);
}

// 更新节点内容
async function updateNodeContent(content: string, node: TextNode) {
    const updatedNode = await figma.getNodeById(node.id) as TextNode;
    const fonts = updatedNode.getRangeAllFontNames(0, updatedNode.characters.length);
    const fontname = fonts[0];

    await figma.loadFontAsync(fontname);

    if (fonts.length > 1) {
        updatedNode.setRangeFontName(0, updatedNode.characters.length, fontname);
    }

    updatedNode.characters = content;
}

// 样式检查处理
async function doStylelint(processUnits: ProcessUnit[]) {
    // TODO: 实现样式检查逻辑
}

// 辅助函数：检查是否有选中节点
function isSelectionEmpty() {
    return figma.currentPage.selection.length === 0;
}

// 初始化并设置事件监听
init();

on<ResizeWindowHandler>('RESIZE_WINDOW', ({ width, height }) => figma.ui.resize(width, height));
on<TranslateHandler>('TRANSLATE', handleTranslate);
on<StylelintHandler>('STYLELINT', handleStylelint);
on<ChangeSettingHandler>('CHANGE_SETTING', handleChangeSetting);
on<AjaxResponseHandler>('AJAX_RESPONSE', handleRequestComplete);
on<ReadSettingHandler>('READ_SETTING', handleReadSetting);