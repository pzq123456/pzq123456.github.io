# Blog 1 : Canvas 性能优化
> 2024.8.3

这里我们主要讨论在 HTML 中的 Canvas 标签使用 `Canvas 2D` 上下文渲染的前提下，进行性能优化的诸多思路（离屏渲染、分层渲染、局部渲染、多线程渲染等）。基于引用部分的博客内容，我们得到如下技术事实：
  1. 应用流畅运行的要求是保证至少每秒60帧的刷新率，即计算并绘制一帧的时间应当小于等于 16 ms。
  2. 一帧内容的生成至少可以分为两个部分：一般 JS 计算 - Canvas API 渲染。一般情况下，将内容渲染至画布所消耗的时间远大于执行计算的（一个数量级）。
  3. 浮点数坐标会带来额外的性能开销。



## References
1. [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
2. [淘系前端团队](https://fed.taobao.org/blog/taofed/do71ct/canvas-performance)
3. [如何有效提升 canvas 绘制速度 QiWang](https://github.com/wqzwh/blog/blob/master/2020/2020-10-25.md)
4. [AntV Canvas 局部渲染总结](https://juejin.cn/post/6844904103231881229)