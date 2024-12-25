import { GoogleGenerativeAI } from "@google/generative-ai";
import {env,Base64Decoder} from './enp.js';

let inputCache = "";

export function chat(editableLayer, input) {
    // 若输入为空则不调用 API
    if (input === "") return;
    // 若输入内容未改变则不调用 API
    if (input === inputCache) return;
    // 更新输入缓存
    inputCache = input;

    // 从环境变量获取 API 密钥并解码
    const key = Base64Decoder(env['PALM_API_KEY']); 
  
    // 使用 GoogleGenerativeAI 类来调用 API
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
    // 打开加载条
    openLoadingBar();
  
    // 调用 API 生成文本
    model.generateContent(input).then((result) => {
      // 输出结果到终端 向其中插入文本
      editableLayer.innerText += result.response.text();
    }).catch((error) => {
      // 错误处理
      editableLayer.innerText += error;
    }).finally(() => {
      // 关闭加载条
      closeLoadingBar();
    });

  }

  function closeLoadingBar() {
    document.getElementById("loading-bar").style.display = "none";
  }

  function openLoadingBar() {
    document.getElementById("loading-bar").style.display = "block";
  }