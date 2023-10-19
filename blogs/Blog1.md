# 第一篇正式博客: 从 0 开始的基于 Canvas 标签的（简易）命令行窗口
> - BT 2023.10.15 21:28 --> ET _ _ _ _ 

## 思路
使用 HTML 的 Canvas 标签，实现一个简易的命令行窗口。只实现键盘输入，不实现鼠标输入。

- 我将设计一系列用以支持彩色渲染命令行的数据结构
- 实现一个渲染器，将数据结构渲染到 Canvas 上
- 实现一个键盘监听器，将键盘输入转化为命令行的输入
  
该项目具有一定挑战性，比一般的基于 Dom 的解决方案要复杂。

## 资料整理
1. [Bash](https://en.wikipedia.org/wiki/Bash_(Unix_shell)): Bash is a command processor that typically runs in a text window where the user types commands that cause actions. 
2. [command-line interface](https://en.wikipedia.org/wiki/Command-line_interface#Command-line_interpreter): CLIs are made possible by **command-line interpreters** or command-line processors, which are programs that read command-lines and carry out the commands.
3. [Canvas text1](https://www.cnblogs.com/OrochiZ-/p/11645217.html)
4. [Canvas text2](https://zhuanlan.zhihu.com/p/639209644)

## 数据结构设计
对于这个简易命令行窗口，我设计了由小到大的三种数据结构：Block、Line、TerminalData。它们之间是逐级包裹的关系。
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
- 
## 简易键盘事件控制

