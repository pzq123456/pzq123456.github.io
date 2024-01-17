# 有关毕业设计（论文）的博客
## 潜在选题元素
> 选题元素：可能用于毕业设计的技术点、创新点等
### 1. GraphQL
- GraphQL是一种用于API的查询语言，是一个使用基于类型系统来执行查询的服务端运行时（类型系统由你的数据定义）。GraphQL并没有和任何特定数据库或者存储引擎绑定，而是依靠你现有的代码和数据支撑。GraphQL既可以在浏览器中发起请求，也可以在node.js服务器中发起请求，甚至可以在移动端发起请求。

### 2. Automic Design
- 原子设计是一种将界面分解为更小的元素的方法，这些元素可以更容易地重用。这些元素被称为原子，因为它们是构成界面的最小单元。原子设计的目标是创建一个可扩展的设计系统，可以用于构建任何东西。原子设计的核心是将界面分解为更小的元素，这些元素可以更容易地重用。这些元素被称为原子，因为它们是构成界面的最小单元。原子设计的目标是创建一个可扩展的设计系统，可以用于构建任何东西。

### 3. 基于四叉树的碰撞检测
> - 避免覆盖物压盖是地图开发中常见的需求，比如在地图上绘制多个点标记，当点标记重叠时，需要将点标记分散开来，以便用户可以清楚的看到每个点标记。这种需求在地图开发中非常常见，但是实现起来却并不简单。本文将介绍一种基于四叉树的碰撞检测算法，该算法可以高效的检测出多个点标记之间的碰撞，从而实现点标记的分散显示。

### 4. Leaflet 源码分析
> - Leaflet是一个开源的JavaScript库，用于移动设备友好的互动地图。它是由Vladimir Agafonkin创建的，他于2010年获得了Apple Design Award的学生奖。Leaflet最初是为移动设备设计的，因此具有轻量级、易于使用、高性能和可扩展性的特点。它可以在大多数现代桌面和移动浏览器上运行，而不需要任何额外的插件，并且可以在Android、iOS和Windows Phone等平台上运行。
- 我会研究Leaflet的源码，并尝试进行深度定制，以满足毕业设计的需求。

### 5. 现代 WebGIS 技术
现代WebGIS底层是数据层，提供空间数据与业务数据等基础数据支撑；中间层一般包括提供基础GIS服务的GIS服务器和提供应用服务支撑的业务逻辑服务器，其中 GIS 服务器可以是专业的GIS开发平台或开源 GIS 项目，也可以是简单的大众化应用地图服务器，主要为应用层提供地图数据服务和功能服务资源；最上层为客户端应用层，可基于 HTML5、ES6、WebGL、WebSocket、React、AngularJS、Vue.js等现代Web 技术栈，使用各类 WebGIS API 进行开发，与 GIS 服务器或业务逻辑服务器交互，实现满足具体需求的Web应用。
- https://iclient.supermap.io/web/books/modern-web-gis-in-action/11cong-chuan-tong-web-dao-xian-dai-web-kai-fa.html

### 6. Potree |  Harvest4D
- Potree is a free open-source WebGL based point cloud renderer for large point clouds. It is based on the TU Wien Scanopy project and research projects Harvest4D, GCD Doctoral College and Superhumans.
- Harvest4D example : https://www.cg.tuwien.ac.at/research/projects/Harvest4D/potree/2015.03.27/examples/arene_lutece.html



## Reference
1. [Creating a GeoJSON FeatureCollection Type for GraphQL](https://brygrill.medium.com/creating-a-geojson-featurecollection-type-for-graphql-352591451b4a)
2. [Automic Design](https://www.youtube.com/watch?v=W3A33dmp17E)
3. [基于四叉树的碰撞检测](https://www.youtube.com/watch?v=eED4bSkYCB8)
4. [现代 WebGIS 技术](https://iclient.supermap.io/web/technical-topics.html#webgis-devtools)
5. [Potree](https://github.com/potree/potree/)
6. [Harvest4D](https://harvest4d.org/index.html%3Fp=860.html)