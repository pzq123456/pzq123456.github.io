# 第一篇正式博客: 从 0 开始的基于 Canvas 标签的（简易）命令行窗口
> - BT 2023.10.15 21:28 --> ET _ _ _ _ 

## TODO
使用 HTML 的 Canvas 标签，实现一个简易的命令行窗口。只实现键盘输入，不实现鼠标输入。

- [x] 我将设计一系列用以支持彩色渲染命令行的数据结构
- [ ] 编写解释器用以确定执行页面代码的规则
- [x] 实现一个渲染器，将数据结构渲染到 Canvas 上
- [x] 实现一个键盘监听器，将键盘输入转化为命令行的输入
  
该项目具有一定挑战性，比一般的基于 Dom 的解决方案要复杂。

## 数据结构设计
对于这个简易命令行窗口，我设计了由小到大的三种数据结构：Block、Line、TerminalData。它们之间是逐级包裹的关系。
- Block: ["H","E","E","L","L","^"]
- Line: [block1,block2,block3]
- TerminalData: [line1,line2,line3]

我采用数据与现实解耦合的设计思路，上述的三个数据类都有对应的渲染函数：renderer.js
```js
/**
 * 绘制字符块
 * @param {HTMLCanvasElement} canvas - 画布
 * @param {Block} block - 字符块
 * @param {Number} x - 左下角
 * @param {Number} y - 左下角
 * @param {Object | Object[]} style - 样式
 * @param {Number} i - 光标位置(从 0 开始) 
 */
export function drawBlock(canvas, block, x, y, style, i = null){ // ...
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
export function drawLine(canvas, line, x, y, style, i = null){ //...
}
```

这些函数都能够根据当前的数据内容、画布大小以及光标索引位置渲染出当前帧。

## 基于动画窗口的动画渲染
下面，我们以某一名为`line`的行类别数据渲染为例：
- 使用样例：需要注意的是，其中`i`及`c`需要作为全局变量对待。`i`用于检测当前动画帧的奇偶性并以此为凭据绘制闪烁光标动画。`c`代表当前行中光标的位置，为一个整数，渲染函数会计算出当前光标所在的具体层级。
    ```js
    animationEngine(100, myDraw);

    function myDraw(){ // 客制化的绘制函数
        // clear canvas 需要手动清除canvas
        const ctx = myCanvas.getContext('2d');
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

        i++;
        // 若为偶数则绘制光标
        if (i % 2 === 0){
            drawLine(myCanvas, line, 0, 30, [blockStyle,blockStyle2], c);
        } else {
            drawLine(myCanvas, line, 0, 30, [blockStyle,blockStyle2]);
        }
    }
    ```
- 实现代码及原理：您可以在 view.js 中找到
    ```js
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
    ```
- 其中 timeInterval 代表绘制的间隔时间， callback 则是用于具体绘制的回调函数（再该函数中需要包含清除画布的代码）。
## 简易键盘事件控制
键盘事件只绑定在 Canvas 元素上，只有该元素有焦点才能输入（命令行底部的提示条高亮代表有焦点）。我采用事件列表的形式批量注册事件，这样可以一定程度上简化代码。
- 以下是业务代码：
    ```js
    let line = Line.fromString('pzq123456.github.io% yourInput ');

    // 以对象列表的形式传递事件 不完整 仅举一例代表
    let eventList = [
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
        // ...
    ]

    let c = 31; // 当前光标位置
    let i = 0; // 用于控制光标闪烁
    c = eventEngine(myCanvas, eventList, c); // 传入要绑定的事件的元素 及事件列表 c用以控制光标
    ```
- `eventEngine` 的实现也十分简单
    ```js
    function addEventFor(element, eventName, callback){
        element.addEventListener(eventName, callback);
    }
    /**
    * 事件引擎 用于向元素添加事件
    * @param {HTMLElement} element - 元素
    * @param {any[]} eventCallbackList - 事件回调列表
    * @param {Number} c - 光标位置
    * @returns {Number} - 操作后的推荐光标位置
    */
    export function eventEngine(element, eventCallbackList, c){
        eventCallbackList.forEach((eventCallback) => {
            addEventFor(element, eventCallback.eventName, eventCallback.callback);
        });
        return c;
    }
    ```
## 简易语法高亮 
- 打算使用 Abstract Syntax Trees - ASTs 但是我打算首先写一个简单的硬编码过度一下，之后配合解释器一起实现 ASTs
- 当前语法高亮实现方案：一个根据 block 内容返回不同样式的判断函数
    ```js
    /**
     * 自定义样式 根据block的内容
     * @param {Block} block 
     */
    function getStyle(block){
        if(block.equals("pzq")){
            // console.log('pzq');
            return blockStyle;
        }else if(block.equals("cd")){
            return blockStyle3;
        }
        else{
            return blockStyle2;
        }
    }
    ```
- 与之配合使用的行渲染函数
    ```js
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
        //...
        if(!getStyle){
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
        //...
    }
    ```

## 简化 Shell 解释器
## Reference
  1. [Bash](https://en.wikipedia.org/wiki/Bash_(Unix_shell)): Bash is a command processor that typically runs in a text window where the user types commands that cause actions. 
  2. [command-line interface](https://en.wikipedia.org/wiki/Command-line_interface#Command-line_interpreter): CLIs are made possible by **command-line interpreters** or command-line processors, which are programs that read command-lines and carry out the commands.
  3. [Canvas text1](https://www.cnblogs.com/OrochiZ-/p/11645217.html)
  4. [Canvas text2](https://zhuanlan.zhihu.com/p/639209644)
  5. [shell 解释器部分](http://kerneltravel.net/blog/2020/ezine03_djy/)