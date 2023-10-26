# 3D Gaussian Splatting
> - BT `UTC+8` 2023.10.24 17:14 --> ET _ _ _ _ _ _
## Structure from motion(SfM)

## Neural Rendering
>"Neural rendering is a method, based on deep neural networks and physics engines, which can create novel images and video footage based on existing scenes. It gives the user control over scene properties such as lighting, camera parameters, poses, geometry, shapes, and semantic structures. " ---- [Neural Rendering: A Gentle Introduction](https://datagen.tech/guides/synthetic-data/neural-rendering)

传统图形学一般将要显示对象的信息存储在各种结构化的模型中（mesh表面，点云等），然后再在此基础上通过一些物理学、数学方法将纹理、光照混合渲染为输出图像。这里我们可以将这种渲染过程概括为：

- 结构化对象 ---> | 渲染方法 | ---> 二维视图

Neural Rendering 与传统图形学有着本质的不同。首先，存储信息的载体不同。不再是使用几何节点（或点云）来存储对象的形状特征，而是将这种形状特征存储到某个网络的参数中，网络接受接受参数（方位、位置）返回结果值（RGBA、密度等）。

- Net ---> 批量 Query Function ---> 二维视图

## 3D Gaussian Splatting

## Reference
- [Introduction to 3D Gaussian Splatting](https://huggingface.co/blog/gaussian-splatting)
- [COLMAP](https://colmap.github.io/tutorial.html)
- [Structure from motion](https://en.wikipedia.org/wiki/Structure_from_motion)