import { Language } from "../types";

const CALL_LIMIT_PER_MINUTE = 10; // 每分钟最大调用次数
const CALL_INTERVAL_PER_MINUTE = 60000 / CALL_LIMIT_PER_MINUTE; // 每次调用的间隔时间（毫秒）

/**
 * 判断文本中英文单词与中文字符的总数是否大于 5
 * @param text - 输入的文本
 * @returns 是否需要润色的布尔值
 */
export function needPolishing(text: string): boolean {
    if (!text) {
        return false;
    }

    // 匹配英文单词的正则表达式
    const englishWordRegex = /\b[a-zA-Z]+\b/g;
    // 匹配中文字符的正则表达式
    const chineseCharRegex = /[\u4e00-\u9fa5]/g;

    // 获取英文单词的匹配结果
    const englishWords = text.match(englishWordRegex) || [];
    // 获取中文字符的匹配结果
    const chineseChars = text.match(chineseCharRegex) || [];

    // 计算英文单词与中文字符的总数
    const totalWordsAndChars = englishWords.length + chineseChars.length;

    // 判断总数是否大于 5
    return totalWordsAndChars > 5;
}

/**
 * 调用 Coze API 进行内容润色
 * @param content - 需要润色的内���
 * @returns API 响应结果
 */
function createPolishContentFunction() {
    let lastCallTime = 0; // 上一次调用的时间

    return async function polishContent(content: string, targetLanguage: Language) {
        if (!content || !targetLanguage) {
            throw new Error("Content and target language must be provided");
        }

        const currentTime = Date.now();
        const timeSinceLastCall = currentTime - lastCallTime;
        const prompt = targetLanguage === Language.ZH ? "润色以下文本: " : "Polish following content: ";

        // 如果调用间隔不足，则等待
        if (timeSinceLastCall < CALL_INTERVAL_PER_MINUTE) {
            console.log("等待调用 Coze API");

            await new Promise(resolve => setTimeout(resolve, CALL_INTERVAL_PER_MINUTE - timeSinceLastCall));
        }

        lastCallTime = Date.now(); // 更新上一次调用时间
        return fetchFromCozeApi(prompt + content);
    }
}

// 使用闭包创建的函数
export const polishContent = createPolishContentFunction();

/**
 * 调用 Coze API 进行内容润色
 * @param content - 需要润色的内容
 * @returns API 响应结果
 */
async function fetchFromCozeApi(content: string): Promise<any> {
    const result = await createChat(content);
    const conversationID = result.conversation_id;
    const chatID = result.id;

    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            const isCompleted = await isChatComplete(conversationID, chatID);

            console.log("isCompleted", isCompleted);

            if (isCompleted) {
                clearInterval(interval);
                resolve(await fetchChatResult(conversationID, chatID));
            }
        }, 1000);

        setTimeout(() => {
            clearInterval(interval);
            reject(new Error("Failed to fetch from Coze API"));
        }, 15000);
    });
}

/**
 * 创建聊天会话
 * @param content - 聊天内容
 * @returns 创建的聊天会话信息
 */
async function createChat(content: string) {
    const apiUrl = "https://api.coze.com/v3/chat"; // Coze API 的基础 URL
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": "Bearer pat_xe9dTJQ9mcjMBKffZbYO32Ym9ZHGiWDvtiK1oR0U0yc1gWI1kFS0NHtd4iO5Xgbk",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "bot_id": "7418029586187075592",
            "user_id": "001",
            "stream": false,
            "auto_save_history": true,
            "additional_messages": [
                {
                    "role": "user",
                    "content": content,
                    "content_type": "text"
                }
            ]
        }),
    });

    if (!response || !response.ok) {
        throw new Error("Failed to fetch from Coze API"); // 错误处理
    }

    const result = await response.json();
    return result.data;
}

/**
 * 检查聊天是否完成
 * @param conversationID - 会话 ID
 * @param chatID - 聊天 ID
 * @returns 聊天是否完成
 */
async function isChatComplete(conversationID: string, chatID: string) {
    const apiUrl = `https://api.coze.com/v3/chat/retrieve?conversation_id=${conversationID}&chat_id=${chatID}`; // 拼接参数到 URL
    const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
            "Authorization": "Bearer pat_xe9dTJQ9mcjMBKffZbYO32Ym9ZHGiWDvtiK1oR0U0yc1gWI1kFS0NHtd4iO5Xgbk",
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch from Coze API"); // 错误处理
    }

    const res = await response.json();
    return res.data.status === "completed";
}

/**
 * 获取聊天结果
 * @param conversationID - 会话 ID
 * @param chatID - 聊天 ID
 * @returns 聊天结果
 */
async function fetchChatResult(conversationID: string, chatID: string) {
    const apiKey = "pat_xe9dTJQ9mcjMBKffZbYO32Ym9ZHGiWDvtiK1oR0U0yc1gWI1kFS0NHtd4iO5Xgbk";

    const apiUrl = `https://api.coze.com/v3/chat/message/list?conversation_id=${conversationID}&chat_id=${chatID}`; // 拼接参数到 URL
    const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch from Coze API"); // 错误处理
    }

    const res = await response.json();
    return res.data[0].content;
}