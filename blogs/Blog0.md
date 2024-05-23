# Blog 0 : The tech-details for this site

<div class="colorbox" style="
    width: 20%;
    height: 30px;
    background-color: rgba(255, 123, 255, 0.3);
    margin-top: 10px;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
">
front-end
</div>

> - BT `UTC+8` 2023.10.15 21:28 --> ET `UTC+8` 2023.10.22 14:25
> - ChangeLog
>  - `UTC+8` 2023.10.22 14:25 完成初稿
> - `UTC+8` 2024.5.23 12:00 修改部分内容

## TODO
使用 HTML 的 Canvas 标签，实现一个简易的命令行窗口。只实现键盘输入，不实现鼠标输入。

- [x] 我将设计一系列用以支持彩色渲染命令行的数据结构
- [x] 编写解释器用以确定执行页面代码的规则
- [x] 实现一个渲染器，将数据结构渲染到 Canvas 上
- [x] 实现一个键盘监听器，将键盘输入转化为命令行的输入
  
该项目具有一定挑战性，比一般的基于 Dom 的解决方案要复杂。

## 数据结构设计
> - 此二次重构前的内容请参考最新实现。

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
> - 此为二次重构前的内容请参考最新实现。

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
> - 此为二次重构前的内容请参考最新实现。

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
> - 此为二次重构前的内容请参考最新实现。

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
> - 此为二次重构前的内容请参考最新实现。

- 用于记录命令的数据结构设计如下：
    ```js
    [{
        name: "cd",
        description: "change directory",
        usage: "cd <path>",
        func: function(path){
            // 用于修改页面样式以提醒用户该函数执行并对页面产生了作用
            terminal.style.borderBottom = '1px solid orange';
            setTimeout(() => {
                terminal.style.borderBottom = '1px solid white';
            }, 500);
            // 用于修改页面内容
            fileToHtml(path,document.getElementById('content'), mdStyle);
        },
        manipulate: function(data){
            // 用于修改 Terminal 内部数据用以和用户做交互
            let line = Line.fromString('pzq123456.github.io%> ');
            data.addLine(line);
            return data.getFullLength() - 1;
        }
    }, //...
    ]
    ```
    - 其中`manipulate`函数用于在执行命令后对数据进行操作，例如添加新的行、修改光标位置等等，主要用来管理 Terminal 内部数据。
    - 而`func`则用于操纵 HTML 页面，例如渲染新的内容、修改页面的样式等等。这样将操作分开，可以使得代码更加清晰。
    - 真正命令运行策略是这二者的结合，例如`cd`命令，它需要修改 Terminal 内部数据，同时也需要操纵 HTML 页面。
- 要执行一条 Terminal 内的命令，我们需要执行哪些步骤呢？
  - 首先我们需要解析 Terminal 中当前活跃行是否包含命令，如果包含命令，我们需要将命令解析出来。我们使用 ParseLine 函数。
    ```js
    /**
     * 用于解析一行命令 解析成命令和参数
     * @param {Line} line 
     * @param {Function} parseFun - 用于解析命令的函数
     * @returns {Object} - {command, args}
     */
    export function parseLine(line, parseFun = defaultParseFun2){
        let blockStrings = line.blockStrings;
        let res = {
            command: null,
            args: [],
        };
        if(blockStrings.length === 0){
            return res;
        }else{
            // parseFun 用于将命令与参数分开 默认是只取第一个为命令 其余为参数
            let { command, args } = parseFun(line);
            res.command = command;
            res.args = args;
            return res;
        }
    }
    ```
    - 可以发现，到这里我们还是没有执行命令，我们只是将命令解析出来了。这样做的好处是，我们可以在解析命令的时候，将命令与参数分开，这样可以更加方便地执行命令。
- 然后根据上一步的结果运行对应命令：
    ```js
    /**
    * 运行命令
    * @param {Object} comObj - 需要 parseLine 解析后的对象
    * @param {TerminalData} data - 需要交互的数据
    * @param {Array} commandList - 命令列表 
    * @returns {TerminalData} - 运行命令后的数据
    */
    export function run(comObj,data, commandList = defaultCommandList){
        let { command, args } = comObj;
        if(command === null || command === undefined){
            throw new Error("command is null or undefined");
        }
        let commandObj = commandList.find((item) => {
            return item.name === command;
        });
        console.log(commandObj);
        commandObj.func(...args);
        let res = commandObj.manipulate(data);
        return res;
    }
    ```
    - 由于运行策略都记录在`commandList`中，我们只需要在`commandList`中找到对应的命令，然后传入参数执行即可。
> 注意： 由于光标的渲染依赖全局变量 c ，所以我们最好在 main.js 中定义操作事件列表。同样的道理，对于键盘事件也需要在 main.js 中定义。因为只有 main.js 内的 c 才是全局可以访问的。

## 高级功能
> - 此三次重构前的内容，三次重构尚未进行。
> - todo：高级功能存在不完善的地方，考虑在第三次重构中解决。

### 1. 英文拼写检查
> - [The Algorithm Behind Spell Checkers](https://www.youtube.com/watch?v=d-Eq6x1yssU&t=3s)

基于[Levenshtein](https://en.wikipedia.org/wiki/Levenshtein_distance)距离，这是一种编辑距离，可以量测两个字符串之间从一个变为另一个所需的编辑（插入、删除、替换）步数，认为两个字符串约相似则距离值越小。基于bktree及Levenshtein距离对一个包含三千词左右的常用英文词库构建索引函数，并对用户输入的每一个词作编辑距离为1的匹配，若匹配结果为空则认为该词语拼写错误。（该部分存在不完善的地方）。

后续：将词语修正并入候选字符提示中去。需设计新的提示ui，可能需要重构现有的。

### 2. 候选字符提示
基于前缀树，具体内容后补。

### 3. Chat mode
基于谷歌的API，将用户输入发送给服务器并渲染输出。技术难度较小。

## Reference
  1. [Bash](https://en.wikipedia.org/wiki/Bash_(Unix_shell)): Bash is a command processor that typically runs in a text window where the user types commands that cause actions. 
  2. [command-line interface](https://en.wikipedia.org/wiki/Command-line_interface#Command-line_interpreter): CLIs are made possible by **command-line interpreters** or command-line processors, which are programs that read command-lines and carry out the commands.
  3. [Canvas text1](https://www.cnblogs.com/OrochiZ-/p/11645217.html)
  4. [Canvas text2](https://zhuanlan.zhihu.com/p/639209644)
  5. [shell 解释器部分](http://kerneltravel.net/blog/2020/ezine03_djy/)
