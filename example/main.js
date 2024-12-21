 // 获取 DOM 元素
 const highlightLayer = document.querySelector('.highlight-layer');
 const editableLayer = document.querySelector('.editable-layer');
 const container = document.querySelector('.editor-container');
 

 let debounceTimer;
 
 // 过滤粘贴内容的函数，去除样式
 function sanitizePaste(content) {
     const div = document.createElement('div');
     div.innerHTML = content;
     const text = div.innerText;
     return text;
 }
 
 // 调用高亮更新
 function updateHighlight() {
   const content = editableLayer.innerText;
   const highlighted = hljs.highlightAuto(content, ['javascript', 'html', 'css', 'markdown', 'bash']);
   highlightLayer.innerHTML = highlighted.value;
 }
 
 // 防抖函数，用于减少频繁调用 updateHighlight
 function debouncedUpdateHighlight() {
   clearTimeout(debounceTimer);
   debounceTimer = setTimeout(updateHighlight, 50); // 设置延迟50ms触发高亮更新
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
 editableLayer.addEventListener('input', debouncedUpdateHighlight);
 editableLayer.addEventListener('scroll', syncScroll);
 
 // 初始化
 document.addEventListener('DOMContentLoaded', () => {
   updateHighlight();
 });