import { fileToHtml } from './helpers/markdown.js';
import { fillNavBar } from './helpers/navBar.js';
import { metalist } from './blogs/meta.js'; // metalist is a list of blog metadata
import {initPage} from './helpers/init.js';
initPage();

import * as Terminal from '/src/Terminal/index.js';

const Data = Terminal.Data.Data;
const Parser = Terminal.Parser.Parser;
const tokenization = Terminal.Parser.tokenization;
const View = Terminal.View.View;
const animationEngine = Terminal.View.animationEngine;
const run = Terminal.Strategy.run;
const createCanvas = Terminal.View.createCanvas;

// Terminal === 部分
let myCanvas = createCanvas(document.getElementById('terminal'), window.innerWidth * 0.81, 300);
let testStyle = {
    'font-family': 'monospace',
    'font-size': '30px',
    'color': 'white',
    'background-color': 'black',
};



let data = Data.fromString(`type ' help ' and press enter to get help`);

// console.log(data);
let c = 0;
let hc = 0; // history cursor
let canvasy = 0;
let scrollMode = false;
let i = 0;// 用于控制光标闪烁
let view = new View(data,myCanvas,testStyle);

animationEngine(100/60, () => {
    // clear canvas
    myCanvas.getContext('2d').clearRect(0,0,myCanvas.width,myCanvas.height);
    let y = 0;

    if (myCanvas === document.activeElement){
        if (i % 60 < 30){
            y = view.render(c,hc,canvasy,true);
        }else{
            y = view.render(c,hc,canvasy,false);
        }
    }else{
        y = view.render(c,hc,canvasy,false);
    }
    if (y > myCanvas.height && !scrollMode){
        canvasy -= y - myCanvas.height;
    }
    i++;
});


// 监听键盘事件输入字母
myCanvas.addEventListener('keydown',function(e){
    scrollMode = false;
    if (e.key.length === 1){
        // 输入字母
        c = data.insert(c,e.key);
    }
    if (e.key === 'Backspace'){
        // 删除字母
        c = data.delete(c);
    }
    if (e.key === 'Enter'){
        let obj = Parser(tokenization(data._current));
        c = data.enter();
        run(obj,data,callBackList);
    }
    // 按下左右键
    if (e.key === 'ArrowLeft'){
        if (c > 0){
            c--;
        }else{
            c = 0;
        }
    }
    if (e.key === 'ArrowRight'){
        if (c < data._current.length){
            c++;
        }else{
            c = data._current.length;
        }
    }

    // 按下上下键
    if (e.key === 'ArrowUp'){
        hc--;
        if (hc < 0){
            hc = 0;
        }
        scrollMode = true;
    }
    if (e.key === 'ArrowDown'){
        hc++;
        if (hc > data._history.length - 1){
            hc = data._history.length - 1;
        }
        scrollMode = true;
    }
});



// 监听鼠标滚动事件
myCanvas.addEventListener('wheel',function(e){
    scrollMode = true;
    canvasy -= e.deltaY;
    if(canvasy > 0){
        canvasy = 0;
    }
});


const callBackList = 
{
    "cd": {
        "callBack": function cd(comObj,terminal){
            // 判断是否有 path
            if(comObj.path){
                // 判断 path 是否在 metalist 中
                let flag = false;
                metalist.forEach(item => {
                    if (item.path === comObj.path){
                        flag = true;
                    }
                });
                if (flag){
                    terminal.writeHistory("cd success");
                    fileToHtml(comObj.path,document.getElementById('content'), mdStyle);
                }else{
                    terminal.writeHistory("no such path " + comObj.path);
                }
                // fileToHtml(comObj.path,document.getElementById('content'), mdStyle);
            }else{
                terminal.writeHistory("no path");
            }
        }
    },
    "ls": {
        "callBack": function ls(comObj,terminal){
            let head = ['date','command','path', 'tag', 'title'];; // 表头
            // 打印表头
            terminal.writeHistory(head.join('   '));
            metalist.forEach(item => {
                let row = [];
                row.push(item.date);
                row.push(item.command);
                row.push(item.path);
                row.push(item.tag);
                row.push(item.title);
                terminal.writeHistory(row.join(' '));
            });
        }
    },
    "help": {
        "callBack": function help(comObj,terminal){
            let helpInfo = [
                "cd : change directory",
                "ls : list files",
                "help : get help",
                "clear : clear terminal",
                "toggleTerminal : toggle terminal",
            ];
            helpInfo.forEach(item => {
                terminal.writeHistory(item);
            });
        }
    },
    "clear": {
        "callBack": function clear(comObj,terminal){
            terminal.clear();
            canvasy = 0;
        }
    },
}

// ==== 页面部分 ====
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


