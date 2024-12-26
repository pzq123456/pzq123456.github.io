import { debounce, syncScroll, pasteAsPlainText, handleTabKey } from './utils.js';

import { chat } from './gemini.js';

import { init, highlightLayer, editableLayer, } from './init.js';

init();

// const btn_run = document.getElementById('run');
const btn_clear = document.getElementById('clear');
const btn_chat = document.getElementById('chat');

btn_chat.addEventListener('click', () => {
  chat(editableLayer, editableLayer.innerText);
});

// debounce(chat(editableLayer, editableLayer.innerText), 2000);
// function runCode(editableLayer) {
//   return function() {
//     const code = editableLayer.innerText;
//     try {
//       const result = eval(code);
//       console.log(result);
//     } catch (error) {
//       console.error(error);
//     }
//   }
// }

// btn_run.addEventListener('click', runCode(editableLayer));
btn_clear.addEventListener('click', () => {
  editableLayer.innerText = '';
  updateHighlight();
});


syncScroll(editableLayer, highlightLayer);
pasteAsPlainText(editableLayer);
handleTabKey(editableLayer);

// 监听输入事件
editableLayer.addEventListener('input', (e) => {
  updateHighlight();
});

// 使用 web worker 高亮显示代码
const worker = new Worker('worker.js');
worker.onmessage = (event) => { highlightLayer.innerHTML = event.data; }

// 更新高亮显示
function updateHighlight() {
  // 获取可编辑层内容并保留换行符
  const content = editableLayer.innerText;
  worker.postMessage(content);
}

// function animate() {
//   requestAnimationFrame(animate);
//   debounce(updateHighlight, 1000)();
// }

// animate();