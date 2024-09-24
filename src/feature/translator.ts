import { emit, once } from "@create-figma-plugin/utilities";
import { AjaxRequestHandler, Language, TranslationModal } from "./types";
import md5 from "md5";

const maxRequestsPerSecond = 10; // 每秒请求的翻译次数上限

export async function test() {
    const res1 = await translateContentByModal(['hello. and how are you today', 'world?'], Language.ZH, TranslationModal.GoogleBasic);
    console.log('GoogleBasic', res1);

    const res2 = await translateContentByModal(['hello. and how are you today', 'world?'], Language.ZH, TranslationModal.GoogleFree);
    console.log('GoogleFree', res2);

    const res3 = await translateContentByModal(['hello. and how are you today', 'world?'], Language.ZH, TranslationModal.Baidu);
    console.log('Baidu', res3);
}


// 统一的错误处理函数
function handleError(error: any, context: string) {
    console.error(`${context}: `, error); // 记录错误信息
    throw new Error(`${context} - ${error.message}`); // 重新抛出错误并附加上下文
}

// 判断 Google 翻译 API 是否可访问
export async function isGoogleTranslationApiAccessible(): Promise<boolean> {
    const apiKey = 'AIzaSyAKnBSvfJ184dT7CiRcvoT-gkBfsN7jiR8';
    const testUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=test&target=zh`; // 替换为有效的请求 URL

    const fetchPromise = fetch(testUrl, { method: 'GET' });

    // 创建一个超时的 Promise
    const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
            reject(new Error('Request timed out')); // 超时后拒绝
        }, 5000);
    });

    try {
        const response = await Promise.race([fetchPromise, timeoutPromise]); // 竞争两个 Promise
        return response && typeof response === 'object' && 'ok' in response ? response.ok : false;
    } catch (error) {
        console.error('Error accessing Google Translation API: ', error); // 处理错误
        return false; // 捕获错误并返回不可用
    }
}

// 根据选择的翻译模式进行翻译
export async function translateContentByModal(textArray: string[], targetLanguage: Language, translationModal: TranslationModal): Promise<string[]> {
    const translationStrategies = {
        [TranslationModal.GoogleBasic]: () => translator(translateByGoogleBasic, textArray, targetLanguage),
        [TranslationModal.GoogleFree]: () => Promise.all(textArray.map(text => translateByGoogleFree(text, targetLanguage))),
        [TranslationModal.Baidu]: () => translator(translateByBaidu, textArray, targetLanguage),
    };

    const translateFunction = translationStrategies[translationModal];

    if (!translateFunction) {
        throw new Error('Unsupported translation modal'); // 错误处理
    }

    return await translateFunction(); // 直接返回翻译结果
}

// 处理翻译请求的节流
function translator(requestFunction, content: string[], targetLanguage: Language) {
    const interval = 1000 / maxRequestsPerSecond; // 计算每次请求的间隔时间
    let lastRequestTime = 0;

    const fetchWithRateLimit = async () => {
        const currentTime = Date.now();
        const timeSinceLastRequest = currentTime - lastRequestTime;

        if (timeSinceLastRequest < interval) {
            await new Promise(resolve => setTimeout(resolve, interval - timeSinceLastRequest)); // 等待剩余时间
        }

        lastRequestTime = Date.now();
        try {
            return await requestFunction(content, targetLanguage); // 执行请求
        } catch (error) {
            handleError(error, 'Request failed in translator'); // 处理错误
        }
    };

    return fetchWithRateLimit();
}

// Google Basic 翻译
async function translateByGoogleBasic(query: string[], targetLanguage: Language) {
    const apiKey = 'AIzaSyAKnBSvfJ184dT7CiRcvoT-gkBfsN7jiR8';
    const requestBody = JSON.stringify({ q: query, target: targetLanguage });

    try {
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // 设置请求头为 JSON
            body: requestBody,
        });

        if (!response.ok) {
            throw new Error('Translation Request Failed Due to Network Error');
        }

        const data = await response.json(); // 解析 JSON 响应
        // 提取翻译结果
        return data.data.translations.map((item: any) => item['translatedText'] !== undefined ? item['translatedText'] : '');
    } catch (error) {
        handleError(error, 'Failed to translate by Google Basic'); // 处理错误
    }
}

// Google Free 翻译
async function translateByGoogleFree(query: string, targetLanguage: Language) {
    const sourceLanguage = targetLanguage === Language.EN ? Language.ZH : Language.EN;

    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${sourceLanguage}&tl=${targetLanguage}&q=${query}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Network Error');
        }

        const data = await response.json(); // 解析 JSON 响应
        // 提取翻译结果
        return data[0].map((item: any) => item[0]).join('');
    } catch (error) {
        handleError(error, 'Failed to translate by Google Free'); // 处理错误
    }
}

// 百度翻译
async function translateByBaidu(query: string[], targetLanguage: Language) {
    const appid = '20240603002068454'; // 替换为你的百度翻译 API 的 App ID
    const key = 'IMUxQywxN0bZ5XERNKiy'; // 替换为你的百度翻译 API 的密钥
    const textToTranslate = query.join('\n');
    const salt = (new Date()).getTime();
    const sign = md5(appid + textToTranslate + salt + key); // 使用 md5 生成签名
    const url = `https://api.fanyi.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(textToTranslate)}&from=auto&to=${targetLanguage}&appid=${appid}&salt=${salt}&sign=${sign}`;

    return new Promise((resolve, reject) => {
        const messageID = Math.random().toString(36).substring(2, 15);
        const handleResponse = (res: { messageID: string; isSuccessful: any; data: { trans_result: { dst: string }[] }; errMessage: any; }) => {
            if (res.messageID === messageID) {
                if (res.isSuccessful) {
                    // 提取翻译结果
                    resolve(res.data.trans_result.map(item => item.dst));
                } else {
                    handleError(res.errMessage, 'Translation Request Failed'); // 处理错误
                    reject(res.errMessage);
                }
            }
        }

        once('AJAX_RESPONSE', handleResponse);

        emit<AjaxRequestHandler>('AJAX_REQUEST', {
            url,
            method: 'GET',
            dataType: 'jsonp',
            messageID
        });
    });
}
