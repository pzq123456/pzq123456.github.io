import { fileToHtml } from './helpers/markdown.js';
import { fillNavBar } from './helpers/navBar.js';
import {markedHighlight} from './helpers/highlight.js';
import { metalist } from './blogs/meta.js'; // metalist is a list of blog metadata
import { createCanvas, animationEngine, eventEngine} from './src/Terminal/view.js';

import { drawTData } from './src/Terminal/renderer.js';
import { Line, TerminalData } from './src/Terminal/data.js';

import {parseLine, run} from './src/Terminal/interpreter.js';

document.body.onkeydown = function (event) { 
    // 禁止键盘事件 滚动页面
    var e = event;
    e.preventDefault();
}

const myCommandList = [
    {
        name: "cd",
        description: "change directory",
        usage: "cd <path>",
        func: function(path){
            // console.log("cd", path);
            // fileToHtml('/blogs/Blog1.md',document.getElementById('content'), mdStyle);
            fileToHtml(path,document.getElementById('content'), mdStyle);
        },
        manipulate: function(data){
            let line = Line.fromString('pzq123456.github.io%> ');
            data.addLine(line);
            return data.getFullLength() - 1;
        }
    },
    {
        name: "ls",
        description: "list files",
        usage: "ls <path>",
        func: function(path){
            console.log("ls", path);
        },
        manipulate: function(data){
            // manipulate 用于修改数据以实现交互
        }
    },
    {
        name: "cat",
        description: "show file content",
        usage: "cat <path>",
        func: function(path){
            console.log("cat", path);
        },
        manipulate: function(data){
            // manipulate 用于修改数据以实现交互
        }
    },
    {
        name: "clear",
        description: "clear the terminal",
        usage: "clear",
        func: function(){
            console.log("clear");
        },
        manipulate: function(data){
            // manipulate 用于修改数据以实现交互
        }
    },
    {
        name: "help",
        description: "show help",
        usage: "help",
        func: function(){
            console.log("help");
        },
        manipulate: function(data){
            // manipulate 用于修改数据以实现交互
        }
    },
]

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
    'background-color': 'black',
    'color': 'green',
    'cursor-color': 'green',
}; // style for the markdown content
let blockStyle2 = {
    'font-family': 'monospace',
    'font-size': '30px',
    'background-color': 'black',
    'color': 'white',
    'cursor-color': 'white',
}; // style for the markdown content
let blockStyle3 = {
    'font-family': 'monospace',
    'font-size': '30px',
    'background-color': 'purple',
    'color': 'white',
    'cursor-color': 'white',
}; // style for the markdown content
let blockStyle4 = {
    'font-family': 'monospace',
    'font-size': '30px',
    'background-color': 'black',
    'color': 'orange',
    'cursor-color': 'white',
}; // style for the markdown content
let blockStyle5 = {
    'font-family': 'monospace',
    'font-size': '30px',
    'background-color': 'black',
    'color': 'blue',
    'cursor-color': 'purple',
}; // style for the markdown content

// let line = Line.fromString('pzq 123456.github.io% yourInput ');

// let myHistory = 
// `Hello World
// Hello World
// abc
// Hello World
// Hello World
// Hello World
// Hello World
// Hello World
// Hello World
// Hello World
// You can not see me
// You can not see me
// You can not see me
// You can not see me
// You can not see me`;

// let myHistory =
// `PS E:\\pzq123456.github.io> cd .\\blogs`

let myHistory =`pzq123456.github.io%> cd /blogs/Blog1.md`;
let Tdata = TerminalData.fromString(myHistory);

/**
 * 自定义样式 根据block的内容
 * @param {Block} block 
 */
function getStyle(block){
    if(block.contains("%")){
        // console.log('pzq');
        return blockStyle;
    }else if(block.equals("cd")){
        return blockStyle3;
    }else if(
        block.contains('/') 
    ){
        return blockStyle4;
    }else if(block.equals('ls')){
        return blockStyle5;
    }
    else{
        return blockStyle2;
    }
}

let wholeStyle = {
    'background-color': 'black',
    // 行间距
    'line-interval': '10px',
}


drawTData(myCanvas, Tdata, 0, 40, wholeStyle, getStyle,123);



let c = 37; // 当前光标位置
let i = 0; // 用于控制光标闪烁
let timeInterval = 100; // 动画间隔时间
// c = eventEngine(myCanvas, eventList, c);

animationEngine(timeInterval, () => {
    // clear canvas
    const ctx = myCanvas.getContext('2d');
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    i++;

    // 更具canvas 是否聚焦采用不同的渲染方式
    if (myCanvas === document.activeElement){
        // // 若为偶数则绘制光标
        if (i % 2 === 0){
            // drawLine(myCanvas, line, 0, 30, [blockStyle,blockStyle2], c);
            // drawLine(myCanvas, line, 0, 30, blockStyle, c);
            // drawLine2(myCanvas, line, 0, 30, getStyle, c);
            drawTData(myCanvas, Tdata, 0, 40, wholeStyle, getStyle,c);
        } else {
            // drawLine(myCanvas, line, 0, 30, [blockStyle,blockStyle2]);
            // drawLine(myCanvas, line, 0, 30, blockStyle);
            // drawLine2(myCanvas, line, 0, 30, getStyle);
            drawTData(myCanvas, Tdata, 0, 40, wholeStyle, getStyle,c,false);
        }
    }else{
        drawTData(myCanvas, Tdata, 0, 40, wholeStyle, getStyle,c);
    }
});








// 动画窗口绘制光标闪烁
// 光标暗状态
// drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 20,blockStyle);
// 光标亮状态
//drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 20,blockStyle,i);
// let i = 0;
// let c = 0;
// let block = Block.fromString('Hello');
// 为canvas 添加键盘事件 右方向键
myCanvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight'){
        c++;
        if(c >= Tdata.getFullLength() - 1){
            c = Tdata.getFullLength() - 1; 
        }
    }
})
myCanvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft'){
        c--;
        if (c < 0){
            c = 0;
        }
    }
})
myCanvas.addEventListener('keydown', (e) => {
    //向下
    if (e.key === 'ArrowDown'){
        c = Tdata.downIndex(c);
    }
})
myCanvas.addEventListener('keydown', (e) => {
    //向上
    if (e.key === 'ArrowUp'){
        c = Tdata.upIndex(c);
    }
})
myCanvas.addEventListener('keydown', (e) => {
    // 键盘输入
    if (e.key.length === 1 && e.key !== ' '){
        c = Tdata.insertChar(c, e.key);
    }
});
myCanvas.addEventListener('keydown', (e) => {
    // 删除字符
    if (e.key === 'Backspace'){
        c = Tdata.deleteCharBefore(c);
    }
});
myCanvas.addEventListener('keydown', (e) => {
    // 空格键则创建空block
    if (e.key === ' '){
        c = Tdata.splitBlock(c);
    }
});
myCanvas.addEventListener('keydown', (e) => {
    // 检测到回车
    if (e.key === 'Enter'){
        let actLine = Tdata.enter(c);
        let res = parseLine(actLine);
        console.log(res);
        c = run(res, Tdata, myCommandList);
    }
});


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
    },{
        "text": "add line",
        "action": function(){
            let line = Line.fromString('pzq 123456.github.io% yourInput ');
            Tdata.addLine(line);
            c = Tdata.getFullLength() - 1;
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

