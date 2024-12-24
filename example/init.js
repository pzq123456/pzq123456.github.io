export const container = document.querySelector('.editor-container');

export const highlightLayer = document.querySelector('.highlight-layer');
export const editableLayer = document.querySelector('.editable-layer');

export const myCanvas = document.getElementById('myCanvas');

export function init(){
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