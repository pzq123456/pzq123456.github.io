import { fileToHtml } from './helpers/markdown.js';
import { fillNavBar } from './helpers/navBar.js';
import {markedHighlight} from './helpers/highlight.js';
import { metalist } from './blogs/meta.js'; // metalist is a list of blog metadata
import { createCanvas,HelloWorld } from './src/Terminal/view.js';

import { drawBlock, drawLine } from './src/Terminal/renderer.js';
import { Block, Line } from './src/Terminal/data.js';




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

// Terminal
let myCanvas = createCanvas(document.getElementById('terminal'), 1655, 300);
// HelloWorld(myCanvas);
let blockStyle = {
    'font-family': 'monospace',
    'font-size': '30px',
    'background-color': 'blue',
    'color': 'white',
    'cursor-color': 'white',
}; // style for the markdown content
let blockStyle2 = {
    'font-family': 'monospace',
    'font-size': '30px',
    'background-color': 'red',
    'color': 'white',
    'cursor-color': 'white',
}; // style for the markdown content
let blockStyle3 = {
    'font-family': 'monospace',
    'font-size': '30px',
    'background-color': 'blue',
    'color': 'white',
    'cursor-color': 'green',
}; // style for the markdown content
let blockStyle4 = {
    'font-family': 'monospace',
    'font-size': '30px',
    'background-color': 'white',
    'color': 'black',
    'cursor-color': 'red',
}; // style for the markdown content
let line = Line.fromString('panzhiqing@panzhiqingdeMacBook-Air pzq123456.github.io% panzhiqing@panzhiqingdeMacBook-Air');
drawLine(myCanvas, line, 0, 30, [blockStyle,blockStyle2,blockStyle3,blockStyle4], 0);

console.log(line);
// 动画窗口绘制光标闪烁

let i = 0;
let c = 0;
// 为canvas 添加键盘事件 右方向键
// myCanvas.addEventListener('keydown', (e) => {
//     if (e.key === 'ArrowRight'){
//         c++;
//     }
// })
// myCanvas.addEventListener('keydown', (e) => {
//     if (e.key === 'ArrowLeft'){
//         c--;
//     }
// })
// setInterval(() => {
//     i++;
//     // 若为偶数则绘制光标
//     if (i % 2 === 0){
//         drawLine(myCanvas, line, 0, 30, [blockStyle,blockStyle2,blockStyle3,blockStyle4], c);
//     } else {
//         drawLine(myCanvas, line, 0, 30, [blockStyle,blockStyle2,blockStyle3,blockStyle4]);
//     }
// }, 500);






// 动画窗口绘制光标闪烁
// 光标暗状态
// drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 20,blockStyle);
// 光标亮状态
//drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 20,blockStyle,i);
// let i = 0;
// let c = 0;
// // 为canvas 添加键盘事件 右方向键
// myCanvas.addEventListener('keydown', (e) => {
//     if (e.key === 'ArrowRight'){
//         c++;
//     }
// })
// myCanvas.addEventListener('keydown', (e) => {
//     if (e.key === 'ArrowLeft'){
//         c--;
//     }
// })
// setInterval(() => {
//     i++;
//     // 若为偶数则绘制光标
//     if (i % 2 === 0){
//         drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 20,blockStyle,c);
//     } else {
//         drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 20,blockStyle);
//     }
// }, 500);

const mdStyle = {
    'padding': '20px',
    'font-family': 'monospace',
    'font-size': '30px',
    'overflow': 'auto',
    'border-bottom': '1px solid white',
    'border-radius': '5px',
    'background-color': '#161b22',
    'width': '80%',
    'color': 'white',
}; // style for the markdown content

fileToHtml('/README.md',document.getElementById('content'), mdStyle);


fillNavBar(document.getElementById('navBar'),
[
    {
        "text": "Home",
        "action": function(){
            fileToHtml('/README.md',document.getElementById('content'), mdStyle);
        }
    },{
        'text':'toggleTerminal',
        'action': function(){
            // 控制 terminal 是否固定在顶部
            const terminal = document.getElementById('terminal');
            // 在固定模式与非固定模式之间切换
            if (terminal.style.position === 'sticky'){
                terminal.style.position = 'static';
                terminal.style.top = '0';
                terminal.style.zIndex = '1';

                // 改变自身样式
                this.style.backgroundColor = '#0d1117';
                this.style.color = 'white';

            } else {
                terminal.style.position = 'sticky';
                terminal.style.top = '0';
                terminal.style.zIndex = '1';
                // 改变自身样式
                this.style.backgroundColor = 'white';
                this.style.color = 'green';
            }}


        },
    {
        "text": "Blog1",
        "action": function(){
            fileToHtml('/blogs/Blog1.md',document.getElementById('content'), mdStyle);
        }
    }
],
{
    'width': '100%',
    'background-color': '#0d1117',
    'height': 'auto',
    'display': 'flex',
    'flex-direction': 'row',
    'align-items': 'center',
    'border-bottom':'1px solid white',
}
);

fillNavBar(document.getElementById("blogsColumn"), 
    metalist.map(item => {
        return {
            "text": item.title,
            "action": function(){
                fileToHtml(item.path, document.getElementById('content'), mdStyle);
            },
            "info": item.date + " " + item.tag + " " + item.title,
        };
    }),
    {
        'width': '100%',
        'background-color': '#0d1117',
        'height': 'auto',
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'border-bottom':'1px solid #8b949e',
        'padding': '10px',
    }
);

