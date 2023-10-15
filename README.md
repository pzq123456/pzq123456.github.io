# Zhiqing Pan's website
<div class="colorbox" style="
    width: 20px;
    height: 20px;
    background-color: green;
    border-radius: 50%;
"></div>

> 网站布局简介：
> - 最上面一栏为导航栏兼精选栏，点击导航栏可以跳转到相应的页面，点击精选栏可以跳转到精选文章。
> - 导航栏下面是简易终端，如果您希望在网站上执行一些命令，可以在这里输入。
>   - 可以点击 `toggleTerminal` 按钮来控制终端是否随页面滚动，以免影响阅读体验。
> - 右侧导航栏用于访问所有博客文章。



## About me

> I am working on this Blog website. It will be updated regularly. Stay tuned!
> - no Vue or any other front-end framework
> - just pure HTML, CSS and JavaScript
> - make it simple and easy to use
> - no database, no server, no backend


> <img src="https://avatars.githubusercontent.com/u/82391775?v=4" width="50" height="50" alt="avatar"/>

> I am an undergraduate student in [Shan Dong University of Science and Technology](https://en.sdust.edu.cn) at the [College of Geodesy and Geomatics](https://gc.sdust.edu.cn/). I am currently working on the topic of **Geographic Information Systems (GIS)** and **Medical Image Auto Analysis Systems**. High-performance 3D terrain rendering is my next topic to dive into.

## Skills
```js
import { fileToHtml } from './helpers/markdown.js';
import { fillNavBar } from './helpers/navBar.js';
import {markedHighlight} from './helpers/highlight.js';

// config code highlight into the marked.js
marked = new marked.Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        // console.log(language);
        return hljs.highlight(code, { language }).value;
      }
    })
);


const mdStyle = {
    'padding': '10px',
    'font-family': 'monospace',
    'font-size': '30px',
    'overflow': 'auto',
    'border': '1px solid #8b949e',
    'border-radius': '5px',
    'background-color': '#0d1117',
    'width': '80%',
    'color': 'white',
};
fileToHtml('/README.md',document.getElementById('content'), mdStyle);


fillNavBar(document.getElementById('navBar'),[
    {
        "text": "Home",
        "action": function(){
            fileToHtml('/README.md',document.getElementById('content'), mdStyle);
        }
    },{
        "text": "Blog0",
        "action": function(){
            fileToHtml('/blogs/Blog0.md',document.getElementById('content'), mdStyle);
        }

    }
],
);

```

### 1. programming language
* `JavaScript`: [RVGeo](https://github.com/pzq123456/RVGeo) --- A JavaScript library for spacial information analysis and visualization. 
* `Python`: [MapCommunity](https://github.com/pzq123456/mapcommunity) --- A Flask web application for map community. 
* `Java`: [JavaHelloWorld](https://github.com/pzq123456/JAVAhelloWorld) --- Simple Java homework 


> Thanks for Frontend Mentor's challenge!

### 3. Data analysis and Intelligent algorithm

* [MedicalAI](https://github.com/pzq123456/MdicalAI): medical image auto segmentation model
* [MIP](https://github.com/pzq123456/MIP): Medical Image analysis and processing platform based on the Web (we will open-source it soon!)

## Contact me
- Email: 1812673119@qq.com

> This website will be updated regularly. If you have any questions, please contact me by email. Thank you for your support!

> Next version will be constructed by Vue3.js, and will have more functions. Stay tuned!

```javascript
// test code block
console.log('Hello World!')
```