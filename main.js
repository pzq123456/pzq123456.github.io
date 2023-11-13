import { fileToHtml } from './helpers/markdown.js';
import { fillNavBar } from './helpers/navBar.js';

import { metalist } from './blogs/meta.js'; // metalist is a list of blog metadata
import { createCanvas, animationEngine, eventEngine} from './src/Terminal/view.js';
import { drawTData,drawMouse,smartDrawMouse } from './src/Terminal/renderer.js';
import { Line, TerminalData } from './src/Terminal/data.js';
import {parseLine, run} from './src/Terminal/interpreter.js';
import { blockStyle,blockStyle2,blockStyle3,blockStyle4,blockStyle5 } from './src/Terminal/defaultStyle.js';
import {initPage} from './helpers/init.js';
initPage();
// Terminal === 部分
let myCanvas = createCanvas(document.getElementById('terminal'), window.innerWidth * 0.81, 300);

// ==== 数据部分
let myHistory =`pzq123456.github.io%> cd /blogs/Blog1.md`;
let Tdata = TerminalData.fromString(myHistory);
const helpInfo = 
`help
--Type help to show this help.
--Type clear to clear the screen.
--Type ls to list all the files.
--Type cd <directory> to change the current directory.`;
const myCommandList = [
    {
        name: "cd",
        description: "change directory",
        usage: "cd <path>",
        func: function(path){
            terminal.style.borderBottom = '1px solid orange';
            setTimeout(() => {
                terminal.style.borderBottom = '1px solid white';
            }, 500);
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
            terminal.style.borderBottom = '1px solid purple';
            setTimeout(() => {
                terminal.style.borderBottom = '1px solid white';
            }, 500);
        },
        manipulate: function(data){
            // get meta.js and render it
            // 首先打印表头
            let head = ['date','command','path', 'tag', 'title'];
            let miusCount = 0;
            // 首先打印表头
            let line = Line.fromString(head.join('--| '));
            data.addLine(line);
            miusCount += line.getFullLength();
            metalist.forEach(item => {
                let temp = [];
                head.forEach(key => {
                    temp.push(item[key]);
                });
                let tmpdata = Line.fromString(temp.join(' '));
                data.addLine(tmpdata);
                miusCount += tmpdata.getFullLength();
            });
            data.addLine(Line.fromString('pzq123456.github.io%> '));
            return data.getFullLength() - miusCount;
        }
    },
    {
        name: "clear",
        description: "clear the terminal",
        usage: "clear",
        func: function(){
            const terminal = document.getElementById('terminal');
            // 获取terminal元素 改变边框颜色
            // 一秒后恢复
            terminal.style.borderBottom = '1px solid blue';
            setTimeout(() => {
                terminal.style.borderBottom = '1px solid white';
            }, 500);
        },
        manipulate: function(data){
            data.clear();
            data.addLine(Line.fromString('pzq123456.github.io%> '));
            return data.getFullLength() - 1;
        }
    },
    {
        name: "help",
        description: "show help",
        usage: "help",
        func: function(){
            terminal.style.borderBottom = '1px solid pink';
            setTimeout(() => {
                terminal.style.borderBottom = '1px solid white';
            }, 500);
        },
        manipulate: function(data){
            let helpTdata = TerminalData.fromString(helpInfo);
            data.merge(helpTdata);
            data.addLine(Line.fromString('pzq123456.github.io%> '));
            return data.getFullLength() - helpTdata.getFullLength() - 1;
        }
    },
]

/**
 * 自定义样式 根据block的内容
 * @param {Block} block 
 */
function getStyle(block){
    if(block.contains("%")){
        // console.log('pzq');
        return blockStyle;
    }else if(block.equals("cd") || block.equals('ls') || block.equals('cat') || block.equals('clear') || block.equals('help')){
        return blockStyle3;
    }else if(
        block.contains('/') ||  block.contains(`path`)
    ){
        return blockStyle4;
    }else if(block.contains('202') || block.contains(`date`)){
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

// === 必要的全局变量 ===
let c = 40; // 当前光标位置
let i = 0; // 用于控制光标闪烁
let current3Mouse = [[0,0],[0,0],[0,0]]; // 临近三次采样的鼠标位置
let time3Mouse = [0,0,0]; // 临近三次采样的时间
let timeInterval = 100; // 动画间隔时间

// 用户自定义的绘制函数
function draw(){
    // clear canvas
    const ctx = myCanvas.getContext('2d');
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    i++;
    // 更具canvas 是否聚焦采用不同的渲染方式
    if (myCanvas === document.activeElement){
        // // 若为偶数则绘制光标
        if (i % 2 === 0){
            drawTData(myCanvas, Tdata, 0, 40, wholeStyle, getStyle,c);
        } else {
            drawTData(myCanvas, Tdata, 0, 40, wholeStyle, getStyle,c,false);
        }
    }else{
        drawTData(myCanvas, Tdata, 0, 40, wholeStyle, getStyle,c);
        smartDrawMouse(myCanvas, current3Mouse, time3Mouse);
    }
}
let myEventList = [
    { eventName: 'keydown',
        callback: (e) => {
        if (e.key === 'ArrowRight'){
            c++;
            if(c >= Tdata.getFullLength() - 1){
                c = Tdata.getFullLength() - 1; 
            }
        }
        }
    },
    { eventName: 'keydown',
        callback: (e) => {
        if (e.key === 'ArrowLeft'){
            c--;
            if (c < 0){
                c = 0;
            }
        }
        }
    },
    { eventName: 'keydown',
        callback: (e) => {
        //向下
        if (e.key === 'ArrowDown'){
            c = Tdata.downIndex(c);
        }
        }
    },
    { eventName: 'keydown',
        callback: (e) => {
        //向上
        if (e.key === 'ArrowUp'){
            c = Tdata.upIndex(c);
        }
        }
    },
    { eventName: 'keydown',
        callback: (e) => {
        // 键盘输入
        if (e.key.length === 1 && e.key !== ' '){
            c = Tdata.insertChar(c, e.key);
        }
        }
    },
    { eventName: 'keydown',
        callback: (e) => {
        // 删除字符
        if (e.key === 'Backspace'){
            c = Tdata.deleteCharBefore(c);
        }
        }
    },
    { eventName: 'keydown',
        callback: (e) => {
        // 空格键则创建空block
        if (e.key === ' '){
            c = Tdata.splitBlock(c);
        }
        }
    },
    { eventName: 'keydown',
        callback: (e) => {
        // 检测到回车
        if (e.key === 'Enter'){
            let actLine = Tdata.enter(c);
            let res = parseLine(actLine);
            console.log(res);
            c = run(res, Tdata, myCommandList);
        }
        }
    },
    {
        eventName: 'mousemove',
        callback: (e) => {
            // 以队列的方式维护鼠标位置 以及时间
            current3Mouse.shift();
            current3Mouse.push([e.offsetX, e.offsetY]);
            time3Mouse.shift();
            time3Mouse.push(Date.now());
        }
    },
    ]

animationEngine(timeInterval, draw); // 启动动画引擎
eventEngine(myCanvas, myEventList); // 启动事件引擎


// ==== 博客部分


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
    },
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


