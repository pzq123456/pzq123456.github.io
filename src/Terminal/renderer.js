/**
 * 渲染器
 */
import { Block, Line, TerminalData } from './data.js';
// [x,y,w,h] // MBR

const DefaultStyle = {
    'font-family': 'monospace',
    'font-size': '30px',
    'background-color': 'black',
    'color': 'green',
    'cursor-color': 'green',
};




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
 * @param {Function} getStyle - 样式
 * @param {Number} i - 光标位置(从 0 开始) 
 */
export function drawLine2(
    canvas, line, x, y, getStyle , i = null
){
    // getStyle 函数会更具 block 的内容返回对应的样式
    let {width,charWidth,height,} = 
        measureByStyle(canvas.getContext('2d'), getStyle(line.get(0)), line.get(0));
    let MBR = [x, y - height, charWidth * line.getFullLength(), height] // 返回 MBR [x,y,w,h] (x,y) -> (屏幕坐标系)左上角
    let currentCursor = calCursorIndex(line, i); // [blockindex, charindex]
    let offsetX = 0; // 水平偏移量
    let offsetY = 0; // 垂直偏移量用于绘制多行以应对文本过长而换行
    if(!getStyle || typeof getStyle !== 'function'){
        drawLine(canvas, line, x, y, DefaultStyle, i);
    }else{
        line.data.forEach((block, index) => {
            let myMBR = measureBlock(canvas, block, x + offsetX, y + offsetY, getStyle(block), index, currentCursor);
            // 判断是否超过屏幕边界
            if(isOverScreen(canvas, x, myMBR, offsetX)){
                // 超过屏幕边界 则换行
                offsetX = 0;
                offsetY += height;
                MBR[3] += height;
                drawItemBlock(canvas, block, x + offsetX, y + offsetY, getStyle(block), index, currentCursor);
            }else{
                drawItemBlock(canvas, block, x + offsetX, y + offsetY, getStyle(block), index, currentCursor);
            }
            offsetX += (block.length) * charWidth;
        });
    }
    function drawItemBlock(
        canvas, block, x, y, style, index, currentCursor
    ){
        let MBR;
        if(index == currentCursor[0] && currentCursor[1] !== null){
            MBR = drawBlock(canvas, block, x, y, style, currentCursor[1]);
            // drwa rect
            let ctx = canvas.getContext('2d');
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 1;
            ctx.strokeRect(...MBR);
            // 填充透明色
            ctx.fillStyle = 'rgba(155,255,255,0.3)';
            ctx.fillRect(...MBR);
        }else{
            MBR = drawBlock(canvas, block, x, y, style);
        }
        return MBR;
    }
    return MBR // 返回 MBR [x,y,w,h] (x,y) -> (屏幕坐标系)左上角
}

/**
 * 量测 Block 的 MBR
 * @param {HTMLElement} canvas 
 * @param {Block} block 
 * @param {Number} x 
 * @param {Nunber} y 
 * @param {Object} style
 * @returns {Number[]} - MBR [x,y,w,h] (x,y) -> (屏幕坐标系)左上角
 */
function measureBlock(canvas, block, x, y, style){
    const ctx = canvas.getContext('2d');

    ctx.font = style['font-size'] + ' ' + style['font-family'];
    // 绘制背景
    ctx.fillStyle = style['background-color'];
    // 计算宽度
    let metrics;
    let width;

    metrics = ctx.measureText(block.getChar());
    width = metrics.width;
    let height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    
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

            let myMBR = measureBlock(canvas, block, x + offsetX,  y + offsetY, style[styindex]);

            // 判断是否超过屏幕边界
            if(isOverScreen(canvas, x, myMBR, offsetX)){
                // 超过屏幕边界 则换行
                offsetX = 0;
                offsetY += height;
                MBR[3] += height;
                drawItemBlock(canvas, block, x + offsetX, y + offsetY, style[styindex], index, currentCursor);
            }else{
                drawItemBlock(canvas, block, x + offsetX,  y + offsetY, style[styindex], index, currentCursor);
            }

            offsetX += (block.length) * charWidth;
            styindex++;
        })
    }else
    {
        line.data.forEach((block, index) => {
            // 绘制字符块
            let myMBR = measureBlock(canvas, block, x + offsetX, y + offsetY, style, index, currentCursor);


            // 判断是否超过屏幕边界
            if(isOverScreen(canvas, x, myMBR, offsetX)){
                // 超过屏幕边界 则换行
                offsetX = 0;
                offsetY += height;
                // console.log(offsetY);
                MBR[3] += height;
                drawItemBlock(canvas, block, x + offsetX, y + offsetY, style, index, currentCursor);
            }else{
                drawItemBlock(canvas, block, x + offsetX, y + offsetY, style, index, currentCursor);
            }

            offsetX += (block.length) * charWidth;

        });
    }

    function drawItemBlock(
        canvas, block, x, y, style, index, currentCursor
    ){
        let MBR;
        if(index == currentCursor[0] && currentCursor[1] !== null){
            MBR = drawBlock(canvas, block, x, y, style, currentCursor[1]);
            // drwa rect
            let ctx = canvas.getContext('2d');
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.strokeRect(...MBR);
        }else{
            MBR = drawBlock(canvas, block, x, y, style);
        }
        return MBR;
    }

    return MBR // 返回 MBR [x,y,w,h] (x,y) -> (屏幕坐标系)左上角
}

/**
 * 
 * @param {HTMElement} canvas 
 * @param {TerminalData} TData
 * @param {Number} x 
 * @param {Number} y 
 * @param {Object} style - 仅设置背景色
 * @param {Function} getLineStyle - 获取行样式的函数 若为空则使用默认 style
 * @param {Number} i 
 */
export function drawTData(canvas, TData, x, y, style, getLineStyle, i = null, showCursor = true){
    // 首先绘制背景色
    const ctx = canvas.getContext('2d');
    if(style['background-color']){
        ctx.fillStyle = style['background-color'];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // 获取行高
    let height = parseInt(getLineStyle(TData.get(0).get(0))['font-size']);

    // 计算当前光标位置
    let currentCursor = calCursorIndex2(TData, i); // [lineindex, blockindex, charindex]
    let offsetY = 0; // 垂直偏移量
    let MBR = [x, y - height, 0, 0]; // MBR
    // 从光标所在行开始渲染
    // 行可以没有光标 但是TDdata必须有光标 所以光标位置不可以为空 手动控制是否显示光标
    if(showCursor){
        // 从style中获取 行间距
        let lineInterval = style['line-interval'] ? parseInt(style['line-interval']) : 0;

        // 遍历绘制每一行 并更新MBR 直到超过屏幕边界
        for(let i = currentCursor[0]; i < TData.data.length; i++){
            let line = TData.data[i];
            let currentIndex = i == currentCursor[0] ? deCalCursorIndex(line, [currentCursor[1],currentCursor[2]]) : null;
            let myMBR = drawLine2(canvas, line, x, y + offsetY, getLineStyle,currentIndex);
            // 判断是否超过屏幕边界
            if(isOverScreen2(canvas, y, myMBR, offsetY)){
                // 超过屏幕边界 则停止绘制
                break;
            }else{
                offsetY += (myMBR[3] + lineInterval);
                MBR[3] += (myMBR[3] + lineInterval);
                // 取较大的宽度
                MBR[2] = MBR[2] > myMBR[2] ? MBR[2] : myMBR[2];
            }
        }
    }else{
        // 从style中获取 行间距
        let lineInterval = style['line-interval'] ? parseInt(style['line-interval']) : 0;
        // 遍历绘制每一行 并更新MBR 直到超过屏幕边界
        for(let i = currentCursor[0]; i < TData.data.length; i++){
            let line = TData.data[i];
            let myMBR = drawLine2(canvas, line, x, y + offsetY, getLineStyle);
            // 判断是否超过屏幕边界
            if(isOverScreen2(canvas, y, myMBR, offsetY)){
                // 超过屏幕边界 则停止绘制
                break;
            }else{
                offsetY += (myMBR[3] + lineInterval);
                MBR[3] += (myMBR[3] + lineInterval);
                // 取较大的宽度
                MBR[2] = MBR[2] > myMBR[2] ? MBR[2] : myMBR[2];
            }
        }
    }
    // drawMBR(canvas, MBR);
    // console.log(MBR);
    return MBR;
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

// 判断当前 line 是否超过屏幕边界
function isOverScreen2(canvas, y,lineMBR, offsetY){
    // 首先获取 canvas 的高度
    y = y - lineMBR[3]; // 从 y 开始绘制
    let height = canvas.height - y; // 从 y 开始绘制
    // 判断是否超过屏幕边界
    if( offsetY + lineMBR[3] > height){
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

/**
 * 还原行内光标位置的索引 与 calCursorIndex 相反操作
 * @param {Line} line 
 * @param {[Number, Number]} currentCursor
 * @return {Number} i
 */
export function deCalCursorIndex(
    line, currentCursor
){
    let i = 0;
    for(let j = 0; j < currentCursor[0]; j++){
        i += line.get(j).length;
    }
    i += currentCursor[1];
    return i;
}




/**
 * 计算历史记录内标位置
 * @param {TerminalData} tdata - 终端数据
 * @param {Number} i - 光标位置
 */
export function calCursorIndex2(
    tdata,i
){
    let lineIndex = 0;
    let blockIndex = 0;
    let charIndex = 0;
    for(let line of tdata.data){
        if(i < line.getFullLength()){
            // i 在当前行
            for(let block of line.data){
                if(i < block.length){
                    charIndex = i;
                    break;
                }else{
                    i -= block.length;
                    blockIndex++;
                }
            }
            break;
        }else{
            i -= line.getFullLength();
            lineIndex++;
        }
    }
    // 若 i 超过了行的长度 则将光标放在行末尾
    if(lineIndex >= tdata.data.length){
        lineIndex = tdata.data.length - 1;
        blockIndex = tdata.get(lineIndex).length - 1;
        charIndex = tdata.get(lineIndex).get(blockIndex).length;
    }

    return [lineIndex, blockIndex, charIndex];
}

/**
 * 计算历史记录内标位置
 * @param {TerminalData} tdata - 终端数据
 * @param {[Number, Number, Number]} currentCursor - 光标位置
 * @returns {Number} i - 光标位置
 */
export function deCalCursorIndex2(
    tdata, currentCursor
){
    let i = 0;
    for(let j = 0; j < currentCursor[0]; j++){
        i += tdata.get(j).getFullLength();
    }
    for(let j = 0; j < currentCursor[1]; j++){
        i += tdata.get(currentCursor[0]).get(j).length;
    }
    i += currentCursor[2];
    return i;
}
