import { emit } from '@create-figma-plugin/utilities';
import React from 'react';
import { Link } from "react-router-dom";
import { ResizeWindowHandler } from '../../types';

import './help.css';
import { Button } from 'baseui/button';
import { DisplayMedium, } from "baseui/typography";
import { HeadingXSmall, } from "baseui/typography";

const Help = () => {
    // 初始化时调整窗口大小
    React.useEffect(() => {
        emit<ResizeWindowHandler>('RESIZE_WINDOW', { width: 380, height: 509 });
    }, []);

    return (
        <div className="help-container">
            <div className="title-container">
                <DisplayMedium marginBottom="scale500" className='main-title'>Smart i18n</DisplayMedium>
                <HeadingXSmall className='sub-title'>Figma Translator for CIS</HeadingXSmall>
            </div>

            <Link to="/Setting">
                <Button className="button-container">Begin</Button>
            </Link>

        </div>
    );
}

export default Help;