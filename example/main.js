const highlightLayer = document.querySelector('.highlight-layer');
const editableLayer = document.querySelector('.editable-layer');
const errorMessagesDiv = document.getElementById('errorMessages');
const myCanvas = document.getElementById('myCanvas');



// 过滤粘贴内容的函数，去除样式
function sanitizePaste(content) {
  const div = document.createElement('div');
  div.innerHTML = content;
  const text = div.innerText;
  return text;
}

// 更新高亮显示
function updateHighlight() {
  const content = editableLayer.innerText;
  const highlighted = hljs.highlightAuto(content, ['javascript', 'html', 'css', 'markdown', 'bash']);
  highlightLayer.innerHTML = highlighted.value;
}

function updateCanvas(){
  // clear canvas
  const ctx = myCanvas.getContext('2d');
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  ctx.fillStyle = 'blue';
  const randomX = Math.floor(Math.random() * 400);
  const randomY = Math.floor(Math.random() * 400);
  ctx.fillRect(randomX, randomY, 50, 50);
}

function render() {
  debounce(updateHighlight, 100)();
  // debounce(updateCanvas, 50)();
}

// animate loop
function animate() {
  render();
  requestAnimationFrame(animate);
}

animate();



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
// editableLayer.addEventListener('input', debouncedUpdateHighlight);
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