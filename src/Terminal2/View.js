import { tokenization, tokenStyle } from './Parser.js';

export class View{
    constructor(data,canvas,style){
        this.data = data; // 数据 class
        this.canvas = canvas; // canvas 元素
        this.style = style; // canvas 全局样式
        this.y = 0; // canvas 的 y 偏移量 用以支持滚动
    }

    drawLine(line,x,y){
        // 解析 获得 tokens 获得 token 的样式 然后绘制
        let tokens = tokenization(line);
        let ctx = this.canvas.getContext('2d');
        let height = parseInt(this.style['font-size']);
        y += height + this.y;
        for(let token of tokens){
            let style = tokenStyle(token);
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
                // 将 token.value 从超过处截断 循环绘制直到
                // let i = 0;
                // let tmp = '';
                // while(x + this.measureText(tmp+token.value[i])[0] < this.canvas.width){
                //     tmp += token.value[i];
                //     i++;
                // }
                // ctx.fillText(tmp,x,y);
                // x = 0;
                // y += height;

                while(x + width > this.canvas.width){
                    let i = 0;
                    let tmp = '';
                    while(x + this.measureText(tmp+token.value[i])[0] < this.canvas.width){
                        tmp += token.value[i];
                        i++;
                    }
                    ctx.fillText(tmp,x,y);
                    x = 0;
                    y += height;
                    token.value = token.value.slice(i);
                    [width, _height] = this.measureText(token.value+" ");
                }
                ctx.fillText(token.value,x,y);
                x += width;
            }else{
                ctx.fillText(token.value,x,y);
                x += width;
            }
        }
        // 返回高度
        return y;
    }

    drawLine2(line,x,y){
        // 默认样式绘制 不高亮
        let ctx = this.canvas.getContext('2d');
        let height = parseInt(this.style['font-size']);
        y += height + this.y;
        ctx.fillStyle = this.style['color'];
        ctx.font = this.style['font-size'] + ' ' + this.style['font-family'];
        ctx.textBaseline = 'bottom';
        ctx.fontWeight = 'normal';
        // 逐字母绘制 若 x 超过 canvas 的宽度则换行
        for(let i = 0; i < line.length; i++){
            let [width, _height] = this.measureText(line[i]);
            if (x + width > this.canvas.width){
                x = 0;
                y += height;
            }
            ctx.fillText(line[i],x,y);
            x += width;
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
        let cursorWidth = 1;
        let cursorHeight = height;
        let cursorColor = 'white';

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
        }
        // 返回高度
        return y2;
    }

    /**
     * 绘制历史记录
     * @param {number} i - 高亮索引
     * @returns 
     */
    drawHiostry(i){
        let ctx = this.canvas.getContext('2d');
        let height = parseInt(this.style['font-size']);
        let y = 0;
        // i 为高亮索引 高亮并绘制底色
        for(let j = 0; j < this.data._history.length; j++){
            let line = this.data._history[j];
            if (j == i){
                // ctx.fillRect(0,y,this.canvas.width,height);
                // y = this.drawLine(line,0,y);
                // 两次的高度差作为底色的高度
                let height2 = this.drawLine(line,0,y);
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(0,y,this.canvas.width,height2-y);
                y = height2;
            }else{
                y = this.drawLine2(line,0,y);
            }
        }
        return y;
    };

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