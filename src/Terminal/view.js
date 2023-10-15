/**
 * 用于支持终端 Canvas 渲染的视图
 */

/**
 * 创建 Canvas
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
    canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
    canvas.addEventListener('focus', () => {
        // 在canvas 左上角绘制长方形
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = 'white';
        ctx.strokeRect(0, 0, canvas.width/100, canvas.height/10);
        // fill
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width/100, canvas.height/10);
        // 父节点高亮边框
        container.style.borderBottom = '1px solid white';
    });
    // 当canvas 失去焦点时
    canvas.addEventListener('blur', () => {
        // 在canvas 左上角绘制长方形
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = 'gray';
        ctx.strokeRect(0, 0, canvas.width/100, canvas.height/10);
        // fill
        ctx.fillStyle = 'gray';
        ctx.fillRect(0, 0, canvas.width/100, canvas.height/10);
        // 父节点取消高亮边框 只保留最下面的边框
        container.style.borderBottom = '1px solid gray';
    });

    // canvas 监听键盘事件 ‘p’
    canvas.addEventListener('keydown', (e) => {
        if (e.key === 'p') {
            console.log('p');
        }
    });

    container.appendChild(canvas);

    // 填充canvas 为白色
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return canvas;
}


export function HelloWorld(){

}