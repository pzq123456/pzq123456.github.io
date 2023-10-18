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
    let metrics;
    let width;
    let charWidth;

    metrics = ctx.measureText(block.getChar());
    width = metrics.width;
    // 三目运算符 若 block 为空 则宽度为 1
    let length = block.length === 0 ? 1 : block.length;
    charWidth = width / length;

    let height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    // 绘制背景
    ctx.fillRect(x, y - height, width, height);
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
    }
    else if(i == block.length){
        // 可以往后多绘制一个光标 且不用绘制文字
        ctx.fillStyle = style['cursor-color'];
        ctx.fillRect(x + i * charWidth, y - height, charWidth, height);
    }

    return [x, y - height, width, height] // 返回 MBR [x,y,w,h] (x,y) -> (屏幕坐标系)左上角
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

    let MBR = [x, y - height, charWidth * line.getFullLength(), height] // 返回 MBR [x,y,w,h] (x,y) -> (屏幕坐标系)左上角

    let currentCursor = calCursorIndex(line, i); // [blockindex, charindex]

    // See: block_ ==> (last char in block is _ space) !

    let offsetX = 0; // 水平偏移量
    let offsetY = 0; // 垂直偏移量用于绘制多行以应对文本过长而换行

    // 判断样式是否为数组
    if(Array.isArray(style))
    {
        let styindex = 0;
        line.data.forEach((block, index) => {
            // 首先判断样式是否越界
            if(styindex >= style.length){
                styindex = style.length - 1;
            }
            // 绘制字符块
            let myMBR = drawItemBlock(canvas, block, x + offsetX, y + offsetY, style[styindex], index, currentCursor);

            // 判断是否超过屏幕边界
            if(isOverScreen(canvas, x, myMBR, offsetX)){
                // 超过屏幕边界 则换行
                offsetX = 0;
                offsetY += height;
                MBR[3] += height;
                // 清空 MBR 区域再次绘制
                const ctx = canvas.getContext('2d');
                ctx.clearRect(...myMBR);
                drawItemBlock(canvas, block, x + offsetX, y + offsetY, style[styindex], index, currentCursor);
            }

            offsetX += (block.length) * charWidth;
            styindex++;

        })
    }else
    {
        line.data.forEach((block, index) => {
            // 绘制字符块
            let myMBR = drawItemBlock(canvas, block, x + offsetX, y + offsetY, style, index, currentCursor);

            // 判断是否超过屏幕边界
            if(isOverScreen(canvas, x, myMBR, offsetX)){
                // 超过屏幕边界 则换行
                offsetX = 0;
                offsetY += height;
                console.log(offsetY);
                MBR[3] += height;
                // 清空 MBR 区域再次绘制
                const ctx = canvas.getContext('2d');
                ctx.clearRect(...myMBR);
                drawItemBlock(canvas, block, x + offsetX, y + offsetY, style, index, currentCursor);
            }

            drawItemBlock(canvas, block, x + offsetX, y + offsetY, style, index, currentCursor);

            offsetX += (block.length) * charWidth;

        });
    }

    function drawItemBlock(
        canvas, block, x, y, style, index, currentCursor
    ){
        let MBR;
        if(index == currentCursor[0]){
            MBR = drawBlock(canvas, block, x, y, style, currentCursor[1]);
            // 绘制红色边框
            // drawMBR(canvas, MBR);
        }else{
            MBR = drawBlock(canvas, block, x, y, style);
        }
        return MBR;
    }

    return MBR // 返回 MBR [x,y,w,h] (x,y) -> (屏幕坐标系)左上角
}

function drawMBR(canvas, MBR){
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.strokeRect(...MBR);
}

// 判断当前 block 是否超过屏幕边界 是否需要拐弯
function isOverScreen(canvas,x,blockMBR, offsetX){
    // 首先获取 canvas 的宽度
    let width = canvas.width - x; // 从 x 开始绘制
    // 判断是否超过屏幕边界
    if( offsetX + blockMBR[2] > width){
        return true;
    }else{
        return false;
    }

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
export function calCursorIndex(
    line, i
){
    let lineIndex = 0;
    let charIndex = 0;
    for(let block of line.data){
        if(i < block.length){
            charIndex = i;
            break;
        }else{
            i -= block.length;
            lineIndex++;
        }
    }
    // 若 i 超过了行的长度 则将光标放在行末尾
    if(lineIndex >= line.data.length){
        lineIndex = line.data.length - 1;
        charIndex = line.get(lineIndex).length;
    }


    return [lineIndex, charIndex];
}

