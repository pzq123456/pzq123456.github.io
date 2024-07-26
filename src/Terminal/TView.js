import { tokenization, tokenStyle, mdTokenization, mdTokenStyle } from './Parser.js';

const maxLineChar = 3000;
let measureTextCache = {};

export class View{
    constructor(data,canvas,style){
        this.data = data; // 数据 class
        this.canvas = canvas; // canvas 元素
        this.style = style; // canvas 全局样式
        this.y = 0; // canvas 的 y 偏移量 用以支持滚动
        this.cursorColor = 'white'; // 光标颜色
        this.currentRectColor = 'white'; // 当前行的边框颜色
        this.currentRectBackgroundColor; // 当前行的底色
        this.backgroundColor = "rgba(10,10,110,0.4)"; // canvas 的底色
        this.cursorPosition = [0,0]; // 光标位置
        this.cursorWidth = 3; // 光标宽度
        this.mirrorCanvas = null; // 镜像 canvas
    }

    // 提取当前 canvas 中的图像
    toImage(){
        return this.canvas.toDataURL();
    }

    drawLine2(line, x, y) {
        // 降级渲染
        let ctx = this.canvas.getContext('2d');
        let height = parseInt(this.style['font-size']);
        y += height;
      
        // Assume single style for all tokens (remove style logic)
        ctx.fillStyle = '#ff9da4'; // Change to your default color
        ctx.font = this.style['font-size'] + ' ' + this.style['font-family'];

        // Draw the entire line at once
        ctx.fillText(line, x, y);
      
        // Update cursor position
        this.cursorPosition = [x, y];
        // Return height
        return y;
    }

    drawLine(line,x,y,mytokenization = tokenization,mytokenStyle = tokenStyle){
        // 若输入的行长度大于 maxLineChar 则 降级为 drawLine2
        if (line.length > maxLineChar){
            return this.drawLine2(line,x,y);
        }
        // 解析 获得 tokens 获得 token 的样式 然后绘制
        let tokens = mytokenization(line);
        let ctx = this.canvas.getContext('2d');
        let height = parseInt(this.style['font-size']);
        y += height ;
        for(let token of tokens){
            let style = mytokenStyle(token);
            ctx.fillStyle = style['color'];
            ctx.font = this.style['font-size'] + ' ' + this.style['font-family'];
            // 绘制基准
            ctx.textBaseline = 'bottom';
            // 若 style 有下划线则设置
            if (style['dash']){
                if(style['dash'] === 'wavyline'){
                    this.wavyline(ctx,x,y,x+this.measureText(token.value)[0],y,2,10,style['color']);
                }
                if(style['dash'] === 'underline'){
                    ctx.strokeStyle = style['color'];
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x,y+2);
                    ctx.lineTo(x+this.measureText(token.value)[0],y+2);
                    ctx.stroke();
                }
            }
            // 若 x 超过 canvas 的宽度则换行
            let [width, _height] = this.measureText(token.value+" ");

            if (x + width > this.canvas.width){
                while(x + width > this.canvas.width){
                    let i = 0;
                    let tmp = '';
                    while(x + this.measureText(tmp+token.value[i])[0] < this.canvas.width){
                        tmp += token.value[i];
                        i++;
                    }
                    if(y>0){
                        ctx.fillText(tmp,x,y);
                    }
                    x = 0;
                    y += height;
                    token.value = token.value.slice(i);
                    [width, _height] = this.measureText(token.value+" ");
                }
                if(y>0){
                    ctx.fillText(token.value,x,y);
                }
                x += width;
            }else{
                if(y>0){
                    ctx.fillText(token.value,x,y);
                }
                x += width;
            }
            
        }

        // update cursorPosition
        this.cursorPosition = [x ,y]; // 光标位置
        // 返回高度
        return y;
    }

    wavyline(ctx,fromx, fromy, tox, toy, amplitude, wavelength, color){
        // 画波浪线
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        let delta = 0;
        for(let x = fromx; x < tox; x++){
            let y = fromy + amplitude * Math.sin(2 * Math.PI * delta / wavelength);
            ctx.lineTo(x, y);
            delta++;
        }
        ctx.stroke();
    }

    /**
     * 绘制候选字符
     */
    drawCandidates(candidates,x,y){
        // 绘制候选字符
        let ctx = this.canvas.getContext('2d');
        let height = parseInt(this.style['font-size']);
        y += height ;
        // 由于字符一般不会太长 所以不用考虑换行
        for(let candidate of candidates){
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = this.style['font-size'] + ' ' + this.style['font-family'];
            // 绘制基准
            ctx.textBaseline = 'bottom';
            // 若 style 有 font-weight 则设置
            ctx.fontWeight = 'bold';
            ctx.fillText(candidate,x,y);
            x += this.measureText(candidate)[0];
        }
    }

    /**
     * 绘制当前行
     * @param {number} i - 行内光标位置
     * @param {boolean} showCursor - 是否显示光标
     * @returns
     */
    drawCurrent(y,i,showCursor = true){
        let ctx = this.canvas.getContext('2d');
        let height = parseInt(this.style['font-size']);

        // 绘制当前行
        let y2 = this.drawLine(this.data._current,0,y);

        // 绘制光标
        // 按照 drawLine 的布局逻辑绘制光标
        // 从左到右绘制 若 x 超过 canvas 的宽度则换行
        let cursorX = 0;
        let cursorY = y;
        let cursorWidth = this.cursorWidth;
        let cursorHeight = height;
        let cursorColor = this.cursorColor;

        for(let j = 0; j < i; j++){
            let width = this.measureText(this.data._current[j])[0];
            if (cursorX + width > this.canvas.width){
                cursorX = 0;
                cursorY += height;
            }
            cursorX += width;
        }

        // 绘制光标
        if (showCursor){
            ctx.fillStyle = cursorColor;
            ctx.fillRect(cursorX,cursorY,cursorWidth,cursorHeight);
            // 若 data._candidates 长度大于 0 则绘制第一个候选字符
            // update cursorPosition
            this.cursorPosition = [cursorX ,cursorY]; // 光标位置
        }
        if (this.data._candidates && this.data._candidates.length > 0 ){
            this.drawCandidates(this.data._candidates[0],cursorX ,cursorY);
        }


        ctx.strokeStyle = this.currentRectColor;

        // 绘制虚线框
        this.drawDashRect(0,y,this.canvas.width,y2-y,this.currentRectColor);

        // 绘制底色
        if(this.currentRectBackgroundColor){
            ctx.fillStyle = this.currentRectBackgroundColor;
            ctx.fillRect(0,y,this.canvas.width,y2-y);
        }

        // update cursorPosition
        this.cursorPosition = [cursorX ,cursorY]; // 光标位置
        return y2;
    }

    /**
     * 绘制虚线矩形
     * @param {*} x 
     * @param {*} y 
     * @param {*} width 
     * @param {*} height 
     * @param {*} color 
     */
    drawDashRect(x,y,width,height,color){
        let ctx = this.canvas.getContext('2d');
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.setLineDash([3,10]);
        ctx.lineWidth = 1;
        ctx.moveTo(x,y);
        ctx.lineTo(x+width,y);
        ctx.lineTo(x+width,y+height);
        ctx.lineTo(x,y+height);
        ctx.lineTo(x,y);
        ctx.stroke();
        ctx.setLineDash([]);
    }


    /**
     * 绘制历史记录
     * @param {number} i - 高亮索引
     * @returns 
     */
    drawHiostry(y,i){
        let ctx = this.canvas.getContext('2d');
        // i 为高亮索引 高亮并绘制底色
        for(let j = 0; j < this.data._history.length; j++){
            let line = this.data._history[j];
            if (j == i){
                let height2 ;
                height2 = this.drawLine(line,0,y);
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(0,y,this.canvas.width,height2-y);
                y = height2;
            }else{
                let height2 = this.drawLine(line,0,y,mdTokenization,mdTokenStyle);
                // 只有在行高大于 两行高度时才绘制分割线
                if (height2 - y > parseInt(this.style['font-size'])*2){
                    ctx.strokeStyle = '#ebbbff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(0,y);
                    ctx.lineTo(this.canvas.width,y);
                    ctx.stroke();
                }
                y = height2;
            }
        }
        return y;
    };

    render(c,hc,canvasy,showCursor = true){
        // draw background
        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        // draw history
        let y = this.drawHiostry(canvasy,hc);
        y = this.drawCurrent(y,c,showCursor);
        return y;
    }

    /**
     * 量测单个字符的宽度和高度
     * @param {*} text 
     * @returns [width, height]
     */
    measureText(text){
        // 优化：使用缓存
        // cache mode
        if (measureTextCache[text]){
            return measureTextCache[text];
        }else{
            let ctx = this.canvas.getContext('2d');
            ctx.font = this.style['font-size'] + ' ' + this.style['font-family'];
            let metrics = ctx.measureText(text);
            // cache
            measureTextCache[text] = [metrics.width, metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent];
            return [metrics.width, metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent];
        }
    }

    getLineHeight(){
        return parseInt(this.style['font-size']);
    }

}

/**
 * 动画引擎 用于向浏览器请求动画帧并绘制
 * @param {Number} timeInterval - 间隔时间例如 100 表示每 100ms 请求一次动画帧
 * @param {Function} callback - 回调函数用于绘制动画
 */
export function animationEngine(timeInterval, callback){
    let lastTime = 0;
    function animate(time){
        if (time - lastTime > timeInterval){
            lastTime = time;
            callback();
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

/**
 * 创建 Canvas 并添加到容器中
 * @param {HTMLElement} container - 容器
 */
export function createCanvas(
    container,
    width,
    height
){
    // 根据容器创建 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    // 聚焦 focus
    canvas.tabIndex = 1;
    canvas.addEventListener('focus', () => {
        // 禁用滚动
        disableScroll();
        // infoBobble
        let info = new infoBobble('click outside Terminal to enable scroll','error',3000);
        info.render();
    });

    // 当canvas 失去焦点时
    canvas.addEventListener('blur', () => {
        // 启用滚动
        enableScroll();
        // infoBobble
        let info = new infoBobble('enable scroll','success',1000);
        info.render();
    });

    container.appendChild(canvas);
    return canvas;
}

export function isMobile(){
    return /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
}

function disableScroll() {
    document.body.style.overflow = 'hidden';
    if (isMobile()){
        // 禁用移动端的滚动
        document.body.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
}

function enableScroll() {
    document.body.style.overflow = 'auto';
    if (isMobile()){
        // 启用移动端的滚动
        document.body.removeEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
}

/**
 * 向页面中添加一个 infoBobble
 */
export class infoBobble{
    constructor(info,type,time){
        this.info = info;
        this.type = type;
        this.time = time;
    }

    getStyle(){
        let style = {
            'position': 'fixed',
            'bottom': '0',
            'right': '0',
            'width': '20%',
            'height': 'auto',
            'background-color': 'rgba(0,0,0,0.5)',
            'color': 'white',
            'font-size': '30px',
            'font-family': 'monospace',
            'padding': '10px',
            'z-index': '100',
            'text-align': 'center',
            'border-radius': '10px',
        };
        if (this.type === 'error'){
            style['background-color'] = 'rgba(255,0,0,0.5)';
        }else if (this.type === 'warning'){
            style['background-color'] = 'rgba(255,255,0,0.5)';
        } else if (this.type === 'success'){
            style['background-color'] = 'rgba(0,255,0,0.5)';
        }else if (this.type === 'info'){
            style['background-color'] = 'rgba(0,0,255,0.5)';
        }
        return style;
    }

    render(){
        // create close button
        let div = document.createElement('div');
        div.textContent = this.info;

        let close = document.createElement('span');
        close.textContent = 'x';
        close.style.float = 'right';
        close.style.cursor = 'pointer';
        close.addEventListener('click',()=>{
            document.body.removeChild(div);
        });
        div.appendChild(close);

        let style = this.getStyle();
        for(let key in style){
            div.style[key] = style[key];
        }
        document.body.appendChild(div);
        setTimeout(()=>{
            // get parent
            if (div.parentNode){
                div.parentNode.removeChild(div);
            }
        },this.time);
    }

}

// 节流
export function throttle(func, wait) {
    let timer = null;
    return function () {
        if (!timer) {
            timer = setTimeout(() => {
                func.apply(this, arguments);
                timer = null;
            }, wait);
        }
    };
}