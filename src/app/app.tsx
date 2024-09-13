import React from 'react';
import { Button } from "@arco-design/web-react";
import { emit } from '@create-figma-plugin/utilities'
import "@arco-design/web-react/dist/css/arco.css";

import { TranslateHandler } from '../types/types'

function App() {
  const handleTranslateButtonClick = () => emit<TranslateHandler>('TRANSLATE');

  React.useEffect(() => {
    // This is how we read messages sent from the plugin controller
    window.onmessage = (event) => {
      const { type, message } = event.data.pluginMessage;
      if (type === 'create-rectangles') {
        console.log(`Figma Says: ${message}`);
      }
    };
  }, []);

  return (
    <div className="App">
      <Button size='large' type="primary" onClick={handleTranslateButtonClick}>Translate</Button>
      <Button size='large' type="secondary">Stylelint</Button>
    </div>
  );
}

export default App;
