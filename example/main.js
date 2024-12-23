const highlightLayer = document.querySelector('.highlight-layer');
const editableLayer = document.querySelector('.editable-layer');
const errorMessagesDiv = document.getElementById('errorMessages');
const myCanvas = document.getElementById('myCanvas');

const container = document.querySelector('.editor-container');

function init(){
  // 自动获取高亮图层的 字体及行间距 并将所有样式应用到可编辑层
  const computedStyle = window.getComputedStyle(highlightLayer);
  editableLayer.style.fontFamily = computedStyle.fontFamily;
  editableLayer.style.fontSize = computedStyle.fontSize;
  editableLayer.style.lineHeight = computedStyle.lineHeight;
  editableLayer.style.whiteSpace = 'pre-wrap';

  // 获取 container 的宽高
  const width = container.offsetWidth;
  const height = container.offsetHeight;

  // 重设 canvas 元素宽高
  myCanvas.width = width;  // 设置 canvas 的宽度
  myCanvas.height = height; // 设置 canvas 的高度
}

init();

// 过滤粘贴内容的函数，去除样式
function sanitizePaste(content) {
  const div = document.createElement('div');
  div.innerHTML = content;
  const text = div.innerText;
  return text;
}

// 更新高亮显示
function updateHighlight() {
  // 获取可编辑层内容并保留换行符
  const content = editableLayer.innerText;
  const highlighted = hljs.highlightAuto(content, ['javascript', 'html', 'css', 'markdown', 'bash']); // 高亮代码
  highlightLayer.innerHTML = highlighted.value;
}



// 使用 html2canvas 渲染 highlighLayer 到 canvas
function updateCanvas() {
  // const ctx = myCanvas.getContext('2d'); // 获取 canvas 上下文
}

function render() {
  debounce(updateHighlight, 1000)();
}

// animate loop
function animate() {
  render();
  requestAnimationFrame(animate);
}

// 同步滚动条
function syncScroll() {
  const scrollTop = editableLayer.scrollTop;
  highlightLayer.scrollTop = scrollTop;
}

// 监听粘贴事件并过滤内容
editableLayer.addEventListener('paste', (event) => {
  event.preventDefault();
  const text = event.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, sanitizePaste(text));
});

// 监听输入事件
editableLayer.addEventListener('input', () => {
  updateHighlight();
  // updateCanvas();
});

editableLayer.addEventListener('scroll', syncScroll);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  updateHighlight();
});

function debounce(fn, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}