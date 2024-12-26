import { closeLoadingBar } from './utils.js';

export const container = document.querySelector('.editor-container');

export const highlightLayer = document.querySelector('.highlight-layer');
export const editableLayer = document.querySelector('.editable-layer');

export function init(){
  // 自动获取高亮图层的 字体及行间距 并将所有样式应用到可编辑层
  const computedStyle = window.getComputedStyle(highlightLayer);
  editableLayer.style.fontFamily = computedStyle.fontFamily;
  editableLayer.style.fontSize = computedStyle.fontSize;
  editableLayer.style.lineHeight = computedStyle.lineHeight;
  
  closeLoadingBar();
}