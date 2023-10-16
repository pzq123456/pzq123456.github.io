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