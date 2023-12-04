import { tokenization, tokenStyle, mdTokenization, mdTokenStyle } from './Parser.js';

export class View{
    constructor(data,canvas,style){
        this.data = data; // 数据 class
        this.canvas = canvas; // canvas 元素
        this.style = style; // canvas 全局样式
        this.y = 0; // canvas 的 y 偏移量 用以支持滚动
        this.cursorColor = 'white'; // 光标颜色
        this.currentRectColor = 'white'; // 当前行的边框颜色
        this.currentRectBackgroundColor; // 当前行的底色
        this.backgroundColor = "rgba(20,0,20,0.5)"; // canvas 的底色
    }

    drawLine(line,x,y,mytokenization = tokenization,mytokenStyle = tokenStyle){
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
            // 若 style 有 font-weight 则设置
            if (style['font-weight']){
                ctx.fontWeight = style['font-weight'];
                // 设置为粗体
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
        // 返回高度
        return y;
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
        let cursorWidth = 3;
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
            // 高亮当前行
        }
        ctx.strokeStyle = this.currentRectColor;
        ctx.strokeRect(0,y,this.canvas.width,y2-y);

        // 绘制底色
        if(this.currentRectBackgroundColor){
            ctx.fillStyle = this.currentRectBackgroundColor;
            ctx.fillRect(0,y,this.canvas.width,y2-y);
        }
        return y2;
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
                // 两次的高度差作为底色的高度
                let height2 = this.drawLine(line,0,y);
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(0,y,this.canvas.width,height2-y);
                y = height2;
            }else{
                y = this.drawLine(line,0,y,mdTokenization,mdTokenStyle);
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
        let ctx = this.canvas.getContext('2d');
        ctx.font = this.style['font-size'] + ' ' + this.style['font-family'];
        let metrics = ctx.measureText(text);
        return [metrics.width, metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent];
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
        let info = new infoBobble('disable scroll click outside Terminal to enable scroll','error',3000);
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

function isMobile(){
    return /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
}

function disableScroll() {
    document.body.style.overflow = 'hidden';
    // 若为移动设备则禁用 touchmove 事件
    if (isMobile()){
        document.body.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
}

function enableScroll() {
    document.body.style.overflow = 'auto';
    // 若为移动设备则启用 touchmove 事件
    if (isMobile()){
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
            'left': '0',
            'width': '100%',
            'height': 'auto',
            'background-color': 'rgba(0,0,0,0.5)',
            'color': 'white',
            'font-size': '30px',
            'font-family': 'monospace',
            'padding': '10px',
            'z-index': '100',
            'text-align': 'center',
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
        let div = document.createElement('div');
        div.textContent = this.info;
        let style = this.getStyle();
        for(let key in style){
            div.style[key] = style[key];
        }
        document.body.appendChild(div);
        setTimeout(()=>{
            document.body.removeChild(div);
        },this.time);
    }

}

