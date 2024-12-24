import { debounce, syncScroll, pasteAsPlainText, handleTabKey } from './utils.js';
import { init, 
  highlightLayer, 
  editableLayer, 
  myCanvas
 } from './init.js';

init();

syncScroll(editableLayer, highlightLayer);
pasteAsPlainText(editableLayer);
handleTabKey(editableLayer);

// 监听输入事件
editableLayer.addEventListener('input', () => {
  debounce(updateHighlight, 200)();
  // updateCanvas();
});

// // animate loop
// function animate() {
//   updateHighlight();
//   requestAnimationFrame(animate);
// }

// animate();


// 更新高亮显示
function updateHighlight() {
  // 获取可编辑层内容并保留换行符
  const content = editableLayer.innerText;
  const highlighted = hljs.highlightAuto(content, ['javascript', 'html', 'css', 'markdown', 'bash']); // 高亮代码
  highlightLayer.innerHTML = highlighted.value;
}

// 使用 html2canvas 渲染 highlighLayer 到 canvas
function updateCanvas() {
  const ctx = myCanvas.getContext('2d'); // 获取 canvas 上下文
  // 随机绘制背景色
  ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
  ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);
}