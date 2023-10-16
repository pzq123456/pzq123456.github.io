/**
 * 渲染器
 */
import { Block } from './data.js';

/**
 * 绘制字符块
 * @param {HTMLCanvasElement} canvas - 画布
 * @param {Block} block - 字符块
 * @param {Number} x - 左下角
 * @param {Number} y - 左下角
 * @param {Object} style - 样式
 * @param {Number} i - 光标位置(从 0 开始) 
 */
export function drawBlock(
    canvas, block, x, y, style, i = null
){
    const ctx = canvas.getContext('2d');

    ctx.font = style['font-size'] + ' ' + style['font-family'];
    // 绘制背景
    ctx.fillStyle = style['background-color'];
    // 计算宽度
    let metrics = ctx.measureText(block.getChar());
    let width = metrics.width;
    let charWidth = width / block.length;
    let height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    // 绘制背景
    ctx.fillRect(x, y - height, width, height);
    // 绘制文字
    ctx.fillStyle = style['color'];
    ctx.fillText(block.getChar(), x, y);

    // 绘制光标
    if(i !== null){
        ctx.fillStyle = style['cursor-color'];
        ctx.fillRect(x + i * charWidth, y - height, charWidth, height);
        // 再次绘制文字 使用背景色
        ctx.fillStyle = style['background-color'];
        ctx.fillText(block.get(i), x + i * charWidth, y);
    }
}
