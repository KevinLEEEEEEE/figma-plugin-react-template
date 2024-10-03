import React from 'react';
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Client as Styletron } from "styletron-engine-monolithic";
import { Provider as StyletronProvider } from "styletron-react";
import { LightTheme, BaseProvider } from "baseui";
import './global.css';

import Toolbox from './components/toolbox';
import Setting from './components/setting';
import Help from './components/help';

const engine = new Styletron();

const App = () => (
  <StyletronProvider value={engine}>
    <BaseProvider theme={LightTheme}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Toolbox />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </MemoryRouter>
    </BaseProvider>
  </StyletronProvider>
);

export default App;
