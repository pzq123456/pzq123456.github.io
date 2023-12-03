/**
 * 用于支持终端 Canvas 渲染的视图
 */

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
        // 父节点高亮边框
        container.style.borderBottom = '1px solid white';
    });

    // 当canvas 失去焦点时
    canvas.addEventListener('blur', () => {
        // 父节点取消高亮边框
        container.style.borderBottom = '1px solid gray';
    });

    container.appendChild(canvas);
    return canvas;
}


export function HelloWorld(
    canvas,
){
    // 向 canvas 中绘制文字 Hello World
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.font = '30px monospace';
    // 打印字体的宽度和高度
    // 遍历计算每一个字符的宽度
    console.log(measure('B'));
    console.log(measure('H'));
    console.log(measure('D'));
    console.log(measure('L'));
    console.log(measure('W'));
    console.log(measure(' '));
    // 绘制光标
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 18, 20);
    // 绘制文字
    ctx.fillText('Hello World', 0, 20);

    function measure(text){
        let metrics = ctx.measureText(text);
        let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        return {
            width: metrics.width,
            height: actualHeight,
        };
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

function addEventFor(element, eventName, callback){
    element.addEventListener(eventName, callback);
}

/**
 * 事件引擎 用于向元素添加事件
 * @param {HTMLElement} element - 元素
 * @param {any[]} eventCallbackList - 事件回调列表
 * @returns {Number} - 操作后的推荐光标位置
 */
export function eventEngine(element, eventCallbackList){
    eventCallbackList.forEach((eventCallback) => {
        addEventFor(element, eventCallback.eventName, eventCallback.callback);
    });
}



// 以对象列表的形式传递事件 line 操作事件列表
let lineEventList = [
    {
        eventName: 'keydown',
        callback: (e) => {
            if (e.key === 'ArrowRight'){
                c++;
                // 若光标超出行的长度 则不移动
                if (c >= line.getFullLength()){
                    c = line.getFullLength() - 1;
                }
            }
        }
    },
    {
        eventName: 'keydown',
        callback: (e) => {
            if (e.key === 'ArrowLeft'){
                c--;
                if (c < 0){
                    c = 0;
                }
            }
        }
    },
    {
        eventName: 'keydown',
        callback: (e) => {
            // 键盘输入
            if (e.key.length === 1 && e.key !== ' '){
                line.insertChar(c, e.key);
                c++;
            }
        }
    },
    {
        eventName: 'keydown',
        callback: (e) => {
            // 删除字符
            if (e.key === 'Backspace'){
                line.deleteCharBefore(c);
                c--;
                if (c < 0){
                    c = 0;
                }
            }
        }
    },
    {
        eventName: 'keydown',
        callback: (e) => {
            // 空格键则创建空block
            if (e.key === ' '){
                if(line.splitBlock(c)){
                    c++;
                }
            }
        }
    }
]




