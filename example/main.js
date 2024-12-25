import { throttle, syncScroll, pasteAsPlainText, handleTabKey } from './utils.js';
import { init, 
  highlightLayer, 
  editableLayer, 
  myCanvas
 } from './init.js';

init();

const btn_run = document.getElementById('run');
const btn_clear = document.getElementById('clear');

const output = document.getElementById('output');

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
editableLayer.addEventListener('input', (e) => {
  updateHighlight();
  // updateCanvas();
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