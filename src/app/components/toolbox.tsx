import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { emit, on } from '@create-figma-plugin/utilities';
import $ from 'jquery';

import { Block } from "baseui/block";
import { Button, KIND, SIZE } from "baseui/button";
import { FormControl } from "baseui/form-control";
import { Select, Value } from "baseui/select";

import {
    ResizeWindowHandler,
    ReadSettingHandler,
    AjaxRequestHandler,
    AjaxResponseHandler,
    ChangeSettingHandler,
    StylelintHandler,
    TranslateHandler,
    Language,
    DisplayMode,
    SettingKey,
    ReturnSettingHandler
} from '../../types';

const Toolbox = () => {
    // 状态管理：选择的语言和显示模式
    const [selectedLang, setSelectedLang] = useState<Value>([{ id: Language.EN }]);
    const [selectedDisplayMode, setSelectedDisplayMode] = useState<Value>([{ id: DisplayMode.Duplicate }]);

    // 初始化时更新窗口大小并读取设置
    useEffect(() => {
        emit<ResizeWindowHandler>('RESIZE_WINDOW', { width: 380, height: 308 });
        emit<ReadSettingHandler>('READ_SETTING', { key: SettingKey.TargetLanguage });
        emit<ReadSettingHandler>('READ_SETTING', { key: SettingKey.DisplayMode });
    }, []);

    // 处理 AJAX 请求
    useEffect(() => {
        const handleRequest = ({ url, method, dataType, data, messageID }) => {
            $.ajax({
                url,
                method,
                dataType,
                data,
                timeout: 15000,
                success(data) {
                    emit<AjaxResponseHandler>('AJAX_RESPONSE', { isSuccessful: true, data, messageID });
                },
                error(error) {
                    emit<AjaxResponseHandler>('AJAX_RESPONSE', { isSuccessful: false, errMessage: error, messageID });
                }
            });
        };

        // 监听 DO_REQUEST 事件
        on<AjaxRequestHandler>('AJAX_REQUEST', handleRequest);
    }, []);

    // 处理返回的设置
    useEffect(() => {
        const handleReturnSetting = ({ key, value }) => {
            if (key === SettingKey.TargetLanguage) {
                setSelectedLang([{ id: value }]);
            } else if (key === SettingKey.DisplayMode) {
                setSelectedDisplayMode([{ id: value }]);
            }
        };

        // 监听 RETURN_SETTING 事件
        on<ReturnSettingHandler>('RETURN_SETTING', handleReturnSetting);
    }, []);

    // 处理目标语言变化
    const handleTargetLangChange = (value: Value) => {
        setSelectedLang(value);
        emit<ChangeSettingHandler>('CHANGE_SETTING', { key: SettingKey.TargetLanguage, value: value[0].id.toString() });
    };

    // 处理显示模式变化
    const handleDisplayModeChange = (value: Value) => {
        setSelectedDisplayMode(value);
        emit<ChangeSettingHandler>('CHANGE_SETTING', { key: SettingKey.DisplayMode, value: value[0].id.toString() });
    };

    // 处理 Stylelint 按钮点击
    const handleStylelintClick = () => {
        emit<StylelintHandler>('STYLELINT');
        // TODO: 添加 loading 状态
    };

    // 处理 Translate 按钮点击
    const handleTranslateClick = () => {
        emit<TranslateHandler>('TRANSLATE');
        // TODO: 添加 loading 状态
    };

    return (
        <Block paddingLeft="16px" paddingRight="16px" paddingTop="8px" paddingBottom="8px">
            <FormControl label="Target language">
                <Select
                    clearable={false}
                    options={[
                        { label: "English", id: Language.EN },
                        { label: "Chinese", id: Language.ZH },
                    ]}
                    value={selectedLang}
                    placeholder="Please select"
                    onChange={({ value }) => handleTargetLangChange(value)}
                />
            </FormControl>

            <FormControl label="Result">
                <Select
                    clearable={false}
                    options={[
                        { label: "Display on new frame", id: DisplayMode.Duplicate },
                        { label: "Replace source text", id: DisplayMode.Replace },
                    ]}
                    value={selectedDisplayMode}
                    placeholder="Please select"
                    onChange={({ value }) => handleDisplayModeChange(value)}
                />
            </FormControl>

            <Block display="flex" justifyContent="center" alignItems="center" paddingTop="16px" style={{ gap: '8px' }}>
                <Button style={{ flex: '1' }} onClick={handleStylelintClick} kind={KIND.secondary}>Stylelint</Button>
                <Button style={{ flex: '2' }} onClick={handleTranslateClick}>Translate</Button>
            </Block>

            <Block display="flex" justifyContent="center" alignItems="center" paddingTop="8px">
                <Link to="/setting">
                    <Button kind={KIND.tertiary} size={SIZE.compact}>Setting</Button>
                </Link>
                <Link to="https://www.baidu.com" target="_blank" rel="noopener noreferrer">
                    <Button kind={KIND.tertiary} size={SIZE.compact}>Help</Button>
                </Link>
            </Block>
        </Block>
    );
};

export default Toolbox;