import { tokenization, tokenStyle } from './Parser.js';

export class View{
    constructor(data,canvas,style){
        this.data = data; // 数据 class
        this.canvas = canvas; // canvas 元素
        this.style = style; // canvas 全局样式
        this.x = 0;
        this.y = 0;
    }

    drawLine(line,x,y){
        // 解析 获得 tokens 获得 token 的样式 然后绘制
        let tokens = tokenization(line);
        let ctx = this.canvas.getContext('2d');
        let height = parseInt(this.style['font-size']);
        y += height;
        // console.log(y);
        for(let token of tokens){
            let style = tokenStyle(token);
            ctx.fillStyle = style['color'];
            ctx.font = this.style['font-size'] + ' ' + this.style['font-family'];
            // 若 x 超过 canvas 的宽度则换行
            let [width, _height] = this.measureText(token.value+" ");
            if (x + width > this.canvas.width){
                x = 0;
                y += height;
            }
            ctx.fillText(token.value,x,y);
            x += width;

        }

        // 返回高度
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