import {env,Base64Decoder} from './enp.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

export function run(comObj, terminal, callBackList) {
    // 判断命令是否存在
    if (callBackList[comObj.command]) {
      callBackList[comObj.command].callBack(comObj, terminal);
    } else {
      terminal.writeHistory("command not found: " + terminal._history[terminal._history.length - 1]);
    }
  }

// 假设 'Base64Decoder' 和 'env' 已经定义
export async function chat(terminal, input) {
    // 从环境变量获取 API 密钥并解码
    const key = Base64Decoder(env['PALM_API_KEY']); 
  
    // 使用 GoogleGenerativeAI 类来调用 API
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
    // 打开加载条
    openLoadingBar();
  
    try {
      // 调用 API 生成文本
      const result = await model.generateContent(input);  // 直接传递输入文本作为参数
  
      // 输出结果到终端
      terminal.writeHistory(result.response.text);
    } catch (error) {
      // 错误处理
      terminal.writeHistory("Error: " + error);
    } finally {
      // 关闭加载条
      closeLoadingBar();
    }
  }

  function closeLoadingBar() {
    document.getElementById("loading-bar").style.display = "none";
  }

  function openLoadingBar() {
    document.getElementById("loading-bar").style.display = "block";
  }