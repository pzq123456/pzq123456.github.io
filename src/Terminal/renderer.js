/**
 * 渲染器
 */
import { Block, Line } from './data.js';
// [x,y,w,h] // MBR
/**
 * 绘制字符块
 * @param {HTMLCanvasElement} canvas - 画布
 * @param {Block} block - 字符块
 * @param {Number} x - 左下角
 * @param {Number} y - 左下角
 * @param {Object | Object[]} style - 样式
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
    ctx.fillRect(x, y - height, width + charWidth, height);
    // 绘制文字
    ctx.fillStyle = style['color'];
    // 控制文本基线
    ctx.textBaseline = 'bottom';
    ctx.fillText(block.getChar(), x, y);

    // 绘制光标
    if(i !== null && i < block.length){
        ctx.fillStyle = style['cursor-color'];
        ctx.fillRect(x + i * charWidth, y - height, charWidth, height);
        // 再次绘制文字 使用背景色
        ctx.fillStyle = style['background-color'];
        ctx.fillText(block.get(i), x + i * charWidth, y);
    }else if(i == block.length){
        // 可以往后多绘制一个光标 且不用绘制文字
        ctx.fillStyle = style['cursor-color'];
        ctx.fillRect(x + i * charWidth, y - height, charWidth, height);
    }
}

/**
 * 绘制行
 * @param {HTMLCanvasElement} canvas - 画布
 * @param {Line} line - 字符块
 * @param {Number} x - 左下角
 * @param {Number} y - 左下角
 * @param {Object | Object[]} style - 样式
 * @param {Number} i - 光标位置(从 0 开始) 
 */
export function drawLine(
    canvas, line, x, y, style, i = null
){

    // 取一个字符块获取字符尺寸参数
    let metrics = measureByStyle(canvas.getContext('2d'), style, line.get(0));
    let charWidth = metrics.charWidth;
    let height = metrics.height;

    let currentCursor = calCursorIndex(line, i); // [blockindex, charindex]
    // See: block_ ==> (last char in block is _ space) !


    // 判断样式是否为数组
    if(Array.isArray(style)){
        let offsetX = 0; // 水平偏移量
        let styindex = 0;
        line.data.forEach((block, index) => {
            // 首先判断样式是否越界
            if(styindex >= style.length){
                styindex = style.length - 1;
            }
            if(index == currentCursor[0]){
                drawBlock(canvas, block, x + offsetX, y, style[styindex], currentCursor[1]);
                offsetX += (block.length+1) * charWidth;
                styindex++;
            }else{
                drawBlock(canvas, block, x + offsetX, y, style[styindex]);
                offsetX += (block.length+1) * charWidth;
                styindex++;
            }



        })
    }else
    {
        let offsetX = 0; // 水平偏移量
        line.data.forEach((block, index) => {
            // drawBlock(canvas, block, x + offsetX, y, style, i);
            // offsetX += (block.length+1) * charWidth;
            if(index == currentCursor[0]){
                drawBlock(canvas, block, x + offsetX, y, style, currentCursor[1]);
                offsetX += (block.length+1) * charWidth;
            }else{
                drawBlock(canvas, block, x + offsetX, y, style);
                offsetX += (block.length+1) * charWidth;
            }
        });
    }

    return [x, y - height, charWidth * line.getFullLength(), height] // 返回 MBR [x,y,w,h] (x,y) -> (屏幕坐标系)左上角
}

function measureByStyle(
    ctx, style, block
){
    // 若传入的 style 为数组 则只取第一个样式
    if(Array.isArray(style)){
        style = style[0];
    }
    ctx.font = style['font-size'] + ' ' + style['font-family'];
    let metrics = ctx.measureText(block.getChar());
    let width = metrics.width;
    let charWidth = width / block.length;
    let height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    return {
        width,
        charWidth,
        height,
    };
}

/**
 * 计算行内光标位置
 * @param {Line} line 
 * @param {Number} i 
 * @return {[Number, Number]} [行索引, 列索引]
 */
function calCursorIndex(
    line, i
){
    let lineIndex = 0;
    let charIndex = 0;
    for(let block of line.data){
        if(i < block.length+1){
            charIndex = i;
            break;
        }else{
            i -= block.length+1;
            lineIndex++;
        }
    }


    return [lineIndex, charIndex];
}

