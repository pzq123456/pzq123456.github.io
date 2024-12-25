import { debounce, syncScroll, pasteAsPlainText, handleTabKey } from './utils.js';

import { chat } from './gemini.js';

import { init, 
  highlightLayer, 
  editableLayer, 
  myCanvas
 } from './init.js';

init();
closeLoadingBar();

const btn_run = document.getElementById('run');
const btn_clear = document.getElementById('clear');
const btn_chat = document.getElementById('chat');

const output = document.getElementById('output');

btn_chat.addEventListener('click', () => {
  chat(editableLayer, editableLayer.innerText);
});

// debounce(chat(editableLayer, editableLayer.innerText), 2000);
function runCode(editableLayer, output) {
  return function() {
    const code = editableLayer.innerText;
    try {
      const result = eval(code);
      output.innerText = result;
    } catch (error) {
      output.innerText = error.message;
    }
  }
}


btn_run.addEventListener('click', runCode(editableLayer,output));
btn_clear.addEventListener('click', () => {
  editableLayer.innerText = '';
  updateHighlight();
});


syncScroll(editableLayer, highlightLayer);
pasteAsPlainText(editableLayer);
handleTabKey(editableLayer);

// 监听输入事件
// editableLayer.addEventListener('input', (e) => {
//   updateHighlight();
// });

// 使用 web worker 高亮显示代码
const worker = new Worker('worker.js');
worker.onmessage = (event) => { highlightLayer.innerHTML = event.data; }

// 更新高亮显示
function updateHighlight() {
  // 获取可编辑层内容并保留换行符
  const content = editableLayer.innerText;
  worker.postMessage(content);
}

function closeLoadingBar(){
  document.getElementById("loading-bar").style.display = "none";
}

function openLoadingBar(){
  document.getElementById("loading-bar").style.display = "block";
}


function animate() {
  requestAnimationFrame(animate);
  // updateHighlight();
  debounce(updateHighlight, 1000)();
}

animate();