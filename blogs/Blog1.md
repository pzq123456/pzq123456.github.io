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