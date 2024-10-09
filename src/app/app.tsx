import React, { useEffect } from 'react';
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Client as Styletron } from "styletron-engine-monolithic";
import { Provider as StyletronProvider } from "styletron-react";
import { LightTheme, BaseProvider } from "baseui";
import './global.css';

import Toolbox from './components/toolbox';
import Setting from './components/setting';
import Help from './components/help';
import { ChangeSettingHandler, ReadSettingHandler, ReturnSettingHandler, SettingKey } from '../types';
import { emit, on } from '@create-figma-plugin/utilities';

const engine = new Styletron();

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    emit<ReadSettingHandler>('READ_SETTING', { key: SettingKey.isFirstOpen });
  }, []);

  // 处理返回的设置
  useEffect(() => {
    const handleReturnSetting = ({ key, value }) => {
      if (key === SettingKey.isFirstOpen) {

        console.log(value);
        if (value === true) {
          // 如果是首次打开，设置标记并导航到 /help
          emit<ChangeSettingHandler>('CHANGE_SETTING', { key: SettingKey.isFirstOpen, value: false });

          navigate('/help');
        } else {
          // 如果不是首次打开，导航到 /
          navigate('/');
        }
      }
    };

    // 监听 RETURN_SETTING 事件
    on<ReturnSettingHandler>('RETURN_SETTING', handleReturnSetting);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Toolbox />} />
      <Route path="/setting" element={<Setting />} />
      <Route path="/help" element={<Help />} />
    </Routes>

  );
};

const AppWrapper = () => (
  <StyletronProvider value={engine}>
    <BaseProvider theme={LightTheme}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </BaseProvider>
  </StyletronProvider>
);

export default AppWrapper;
