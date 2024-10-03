import React from 'react';
import { Link } from "react-router-dom";
import { emit } from '@create-figma-plugin/utilities';

import { Block } from "baseui/block";
import { Button, KIND, SIZE } from "baseui/button";
import { Tabs, Tab } from "baseui/tabs-motion";
import { FormControl } from "baseui/form-control";
import { Select, Value } from "baseui/select";
import { RadioGroup, Radio, ALIGN } from "baseui/radio";
import { Input } from "baseui/input";

import { ResizeWindowHandler } from '../../types';
import '../../css/global.css';

const Setting = () => {
    // 状态管理
    const [activeTab, setActiveTab] = React.useState<React.Key>(0);
    const [selectedTransModal, setSelectedTransModal] = React.useState<Value>([{ id: 'Google' }]);
    const [termbase, setTermbase] = React.useState("on");
    const [autoStylelint, setAutoStylelint] = React.useState("on");
    const [googleAPIKey, setGoogleAPIKey] = React.useState("");

    // 初始化时调整窗口大小
    React.useEffect(() => {
        emit<ResizeWindowHandler>('RESIZE_WINDOW', { width: 380, height: 509 });
    }, []);

    // 处理自动样式检查的变化
    const handleAutoStylelintChange = (value: string) => {
        setAutoStylelint(value);
    };

    // 处理术语库的变化
    const handleTermbaseChange = (value: string) => {
        setTermbase(value);
    };

    // 处理翻译模式的变化
    const handleTransModalChange = (value: Value) => {
        setSelectedTransModal(value);
    };

    // 取消按钮点击处理
    const handleCancelClick = () => {
        // TODO: 添加取消逻辑
    };

    // 保存按钮点击处理
    const handleSaveClick = () => {
        // TODO: 添加保存逻辑
    };

    return (
        <Block>
            <Tabs
                activeKey={activeTab}
                onChange={({ activeKey }) => setActiveTab(activeKey)}
                activateOnFocus
            >
                <Tab title="General">
                    <Block style={{ paddingLeft: 16, paddingRight: 16 }}>
                        <FormControl label="Translation modal">
                            <Select
                                clearable={false}
                                options={[
                                    { label: "Google", id: "Google" },
                                    { label: "Baidu", id: "Baidu" },
                                ]}
                                value={selectedTransModal}
                                placeholder="Please select"
                                onChange={({ value }) => handleTransModalChange(value)}
                            />
                        </FormControl>

                        <FormControl label="Term base">
                            <RadioGroup
                                value={termbase}
                                onChange={e => handleTermbaseChange(e.currentTarget.value)}
                                align={ALIGN.horizontal}
                            >
                                <Radio value="on">On</Radio>
                                <Radio value="off">Off</Radio>
                            </RadioGroup>
                        </FormControl>

                        <FormControl label="Auto stylelint">
                            <RadioGroup
                                value={autoStylelint}
                                onChange={e => handleAutoStylelintChange(e.currentTarget.value)}
                                align={ALIGN.horizontal}
                            >
                                <Radio value="on">On</Radio>
                                <Radio value="off">Off</Radio>
                            </RadioGroup>
                        </FormControl>

                        <FormControl label="Auto content polishing">
                            <RadioGroup
                                value={autoStylelint}
                                onChange={e => handleAutoStylelintChange(e.currentTarget.value)}
                                align={ALIGN.horizontal}
                            >
                                <Radio value="on">On</Radio>
                                <Radio value="off">Off</Radio>
                            </RadioGroup>
                        </FormControl>
                    </Block>
                </Tab>

                <Tab title="Accounts">
                    <Block style={{ height: 324, overflowY: 'scroll', paddingLeft: 16, paddingRight: 16 }}>
                        <FormControl label="Google API">
                            <Block style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Input
                                    value={googleAPIKey}
                                    onChange={e => setGoogleAPIKey(e.target.value)}
                                    placeholder="Enter key"
                                    clearOnEscape
                                />
                                <Input
                                    value={googleAPIKey}
                                    onChange={e => setGoogleAPIKey(e.target.value)}
                                    placeholder="Enter password"
                                    clearOnEscape
                                />
                            </Block>
                        </FormControl>

                        <FormControl label="Baidu API">
                            <Block style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Input
                                    value={googleAPIKey}
                                    onChange={e => setGoogleAPIKey(e.target.value)}
                                    placeholder="Enter key"
                                    clearOnEscape
                                />
                                <Input
                                    value={googleAPIKey}
                                    onChange={e => setGoogleAPIKey(e.target.value)}
                                    placeholder="Enter password"
                                    clearOnEscape
                                />
                            </Block>
                        </FormControl>

                        <FormControl label="Coze API">
                            <Block style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Input
                                    value={googleAPIKey}
                                    onChange={e => setGoogleAPIKey(e.target.value)}
                                    placeholder="Enter key"
                                    clearOnEscape
                                />
                                <Input
                                    value={googleAPIKey}
                                    onChange={e => setGoogleAPIKey(e.target.value)}
                                    placeholder="Enter password"
                                    clearOnEscape
                                />
                            </Block>
                        </FormControl>
                    </Block>
                </Tab>
            </Tabs>

            <Block style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, paddingLeft: 16, paddingRight: 16 }}>
                <Link to="/" style={{ flex: '1' }}>
                    <Button kind={KIND.secondary} onClick={handleCancelClick} style={{ width: '100%' }}>Cancel</Button>
                </Link>
                <Button style={{ flex: '2' }} onClick={handleSaveClick}>Save</Button>
            </Block>

            <Block style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: 8, paddingBottom: 8 }}>
                <Link to="/help">
                    <Button kind={KIND.tertiary} size={SIZE.compact}>Help</Button>
                </Link>
            </Block>
        </Block>
    );
};

export default Setting;