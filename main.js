import { fileToHtml, manipulateFile, stringToHtml } from './helpers/markdown.js';
import { fillNavBar } from './helpers/navBar.js';
import { metalist,metalist2str} from './blogs/meta.js'; // metalist is a list of blog metadata
import { initPage } from './helpers/init.js';
initPage();

import * as Terminal from '/src/Terminal/index.js';

const Data = Terminal.Data.Data;
const Parser = Terminal.Parser.Parser;
const tokenization = Terminal.Parser.tokenization;
const View = Terminal.View.View;
const animationEngine = Terminal.View.animationEngine;
const run = Terminal.Strategy.run;
const chat = Terminal.Strategy.chat;
const createCanvas = Terminal.View.createCanvas;
const infoBobble = Terminal.View.infoBobble;
const isMobile = Terminal.View.isMobile;
const trie = Terminal.Parser.commandTrie; // 获得已经注入命令行关键词的前缀树

trie.insertArray(metalist2str());

// ==== 页面部分 ====
let darkBG =  "#0d1117";
let lightBG = "#d4dbe197";
let mode = 'dark'; // dark or light
let currentMarkdown = '/README.md'; // 当前渲染的 markdown 文件
// 获取系统是否处于 dark mode
const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (darkMode){
    document.body.style.backgroundColor = darkBG;
    mode = 'dark';
}else{
    document.body.style.backgroundColor = lightBG;
    mode = 'light';
}

function refreshContent(){
    fileToHtml(currentMarkdown,document.getElementById('content'), getMDStyle(mode));
}

// ==== 终端部分 ====
const helpInfo = [
    "cd : change directory",
    "ls : list files",
    "help : get help",
    "clear : clear terminal options: -all",
    "chat : enter chat mode",
    "exit : exit chat mode",
    "style : change style: style -dark or style -light",
    "about : about me",
    "mdr : render markdown string to this page",
    "echo : echo string",
    "cm : current markdown file path",
    "cache : cache history to localStorage",
    "load : load history from localStorage and clear cache",
    "nav : show navBar options: -on or -off",
];

// 将 helpInfo 中除了标点符号的单词提取至数组
let helpInfoWords = [];
helpInfo.forEach(item => {
    let words = item.split(' ');
    words.forEach(word => {
        if (word !== '-' && word !== ':'){
            helpInfoWords.push(word);
        }
    });
});

// 注入 前缀树
trie.insertArray(helpInfoWords);

let isChatMode = false; // 是否处于聊天模式

let myCanvas = createCanvas(document.getElementById('terminal'), window.innerWidth * 0.81, 600);
let testStyle = {
    'font-family': 'monospace',
    'font-size': '36px',
    'color': 'white',
    'background-color': 'black',
};



let data = Data.fromString(`🎄Type ' help ' and press enter to get help.🎄 \n🎅Gemini ✨ in it ! Type ' chat ' to enter chat mode.🎅`);

let ChristmasTree = 
`  *    *   ()   *   *
*        * /\\         *
      *   /i\\\    *  *
    *     o/\\\  *      *
 *       ///\i\\    *
     *   /*/o\\\\  *    *
   *    /i//\*\\\\      *
        /o/*\\i\\\\   *
  *    //i//o\\\\\\\     *
    * /*////\\\\i\*\\
 *    //o//i\\*\\\\\\  *
   * /i///*/\\\\\o\\\\\   *
  *    *   ||     *    `;

// 将 ChristmasTree 按行分割 并写入 data
let lines = ChristmasTree.split('\n');
lines.forEach(line => {
    data.writeHistory(line);
});




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
    // com + c or ctrl + c
    if (e.key === 'c' && e.metaKey || e.key === 'c' && e.ctrlKey){
        // copy cmd + c
        let text = data._history[hc];
        if(text){
            navigator.clipboard.writeText(text).then(function() {
                let info = new infoBobble('copy success','success',1000);
                info.render();
            }, function(err) {
                console.error('Async: Could not copy text: ', err);
                let info = new infoBobble('copy failed','error',1000);
                info.render();
            });
        }else{
            let info = new infoBobble('can not copy undefined','error',1000);
            info.render();
        }

    }else if (e.key === 'v' && e.metaKey || e.key === 'v' && e.ctrlKey){
        // paste cmd + v
        navigator.clipboard.readText().then(function(text) {
            if(text === ''){
                let info = new infoBobble('paste failed: no text in clipboard','error',1000);
                info.render();
            }else{
                let info = new infoBobble('paste success','success',1000);
                info.render();
                c = data.paste(c,text);
            }

        }, function(err) {
            let info = new infoBobble('paste failed: other error','error',1000);
            info.render();
        });

    } else if (e.key.length === 1){
        // 输入字母
        c = data.insert(c,e.key);
        // console.log(data.getLeftActiveWord(c));
        let com = trie.autoComplete(data.getActiveWord(c-1));
        // console.log(com);
        data._candidates = com;
    }
    if (e.key === 'Backspace'){

        // 删除字母
        c = data.delete(c);
        // console.log(data.getLeftActiveWord(c));
        let com = trie.autoComplete(data.getActiveWord(c-1));
        // console.log(com);
        data._candidates = com;
    }
    if (e.key === 'Enter'){
        if(!isChatMode){
            let obj = Parser(tokenization(data._current));
            c = data.enter();
            run(obj,data,callBackList);
        }else{
            let obj = Parser(tokenization(data._current));
            // only run exit command
            if (obj.command === 'exit'){
                c = data.enter();
                run(obj,data,callBackList);
            }else{
                chat(data,data._current);
                c = data.enter();
            }
        }

        // 清除候选词
        data._candidates = [];
    }
    // 按下左右键
    if (e.key === 'ArrowLeft'){
        if (c > 0){
            c--;
            // console.log(data.getActiveWord(c));
        }else{
            c = 0;
        }
    }
    if (e.key === 'ArrowRight'){
        if (c < data._current.length){
            c++;
            // console.log(data.getActiveWord(c-1));
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

    // 按下 tab 键
    if (e.key === 'Tab'){
        c = data.tab(c);
        // 清除候选词
        data._candidates = [];
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

// 若为移动设备则监听触摸事件
if (isMobile()){
    let startY = 0;
    myCanvas.addEventListener('touchstart',function(e){
        scrollMode = true;
        startY = e.touches[0].clientY;
    });
    myCanvas.addEventListener('touchmove',function(e){
        scrollMode = true;
        canvasy += e.touches[0].clientY - startY;
        startY = e.touches[0].clientY;
        if(canvasy > 0){
            canvasy = 0;
        }
    });
}


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

                    fileToHtml(comObj.path,document.getElementById('content'), getMDStyle(mode));
                    terminal.writeHistory("cd success " + comObj.path + " original file content: ");

                    manipulateFile(comObj.path,function(data){
                        terminal.writeHistory(data);
                    });

                    // 更新 currentMarkdown
                    currentMarkdown = comObj.path;
                }else{
                    terminal.writeHistory("no such path " + comObj.path);
                }
                
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
            helpInfo.forEach(item => {
                terminal.writeHistory(item);
            });
        }
    },
    "clear": {
        "callBack": function clear(comObj,terminal){
            terminal.clear();
            canvasy = 0;
            hc = 0;
            c = 0;

            // // 清除剪贴板
            // navigator.clipboard.writeText("");
            // // 清除 content
            // document.getElementById('content').innerHTML = '';

            // -all 选项代表清除所有内容
            if (comObj.options == '-all'){
                // 清除剪贴板
                navigator.clipboard.writeText("");
                // 清除 content
                document.getElementById('content').innerHTML = '';
            } 
        }
    },
    "chat":{
        "callBack": function chat(comObj,terminal){
            isChatMode = true;
            terminal.writeHistory("=== chat mode ===");
            view.cursorColor = "#ebbbff";
            view.currentRectColor = "#ebbbff";
            view.currentRectBackgroundColor = "rgba(0,255,0,0.1)";
        }
    },
    "exit":{
        "callBack": function exit(comObj,terminal){
            if(isChatMode){
                isChatMode = false;
                terminal.writeHistory("=== exit chat mode ===");
                view.cursorColor = "white";
                view.currentRectColor = "white";
                view.currentRectBackgroundColor = null;
            }else{
                terminal.writeHistory("not in chat mode");
            }
        }
    },
    "style":{
        "callBack": function style(comObj,terminal){
            if (comObj.options == '-dark'){
                document.body.style.backgroundColor = darkBG;
                mode = 'dark';
                refreshContent();
                terminal.writeHistory("change to dark mode 🌙 ");
            }else if (comObj.options == '-light'){
                document.body.style.backgroundColor = lightBG;
                mode = 'light';
                refreshContent();
                terminal.writeHistory("change to light mode 🔆 ");
            }else{
                terminal.writeHistory("no such style: " + comObj.options);
            }
        }
    },
    "about":{
        "callBack": function about(comObj,terminal){
            terminal.writeHistory("=== about ===");
            terminal.writeHistory("-Site Version 2.0.0 (Stable) Powered by PzqCanvasTerminal V2.0.0 (Created by Pzq123456 using vanilla JS from scratch)");
            terminal.writeHistory("-春江潮水连海平，海上明月共潮生。");
            terminal.writeHistory("=== end ===");
        },
    },
    "mdr":{
        "callBack": function mdRender(comObj,terminal){
            let md = comObj.others;
            if (md){
                // console.log(md);
                stringToHtml(md,document.getElementById('content'), getMDStyle(mode));
            }else{
                terminal.writeHistory("no md string");
            }
        }
    },
    "echo":{
        "callBack": function echo(comObj,terminal){
            let str = comObj.others;
            if (str){
                terminal.writeHistory(str);
            }else{
                terminal.writeHistory("no string");
            }
        }
    },
    "cm":{
        "callBack": function cm(comObj,terminal){
            terminal.writeHistory(currentMarkdown);
            console.log(currentMarkdown);
        }
    },
    "cache":{
        "callBack": function saveHistory2JSON(comObj,terminal){
            let json = data.toJSON();
            console.log(json);
            
            // 将 json 缓存至浏览器
            localStorage.setItem('myHistory',json);
            terminal.writeHistory( `save success to ${data._timeStamp}`);
        }
    },
    "load":{
        "callBack": function loadHistoryFromJSON(comObj,terminal){
            let json = localStorage.getItem('myHistory');
            if (json){
                // console.log(json);
                data.readJSON(json);
                terminal.writeHistory(`load success from ${data._timeStamp}`);
                // 默认清除 cache
                localStorage.removeItem('myHistory');
            }else{
                terminal.writeHistory("load failed");
            }
        }
    },
    "nav":{
        "callBack": function nav(comObj,terminal){
            if(comObj.options == '-on'){
                // 检查是否已经存在 navBar 若存在则不再创建
                if (document.getElementById("navBar").innerHTML !='' && document.getElementById("blogsColumn").innerHTML !=''){
                    terminal.writeHistory("navBar already exists");
                    return;
                }
                fillNavBar(document.getElementById('navBar'),
                [
                    {
                        "text": "Home",
                        "action": function(){
                            fileToHtml('/README.md',document.getElementById('content'), getMDStyle(mode));
                            currentMarkdown = '/README.md';
                        }
                    },
                    {
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
                        }
                ],
                {
                    'width': '100%',
                    'height': 'auto',
                    'display': 'flex',
                    'flex-direction': 'row',
                    'align-items': 'center',
                    // 'border-bottom':'1px solid gray',
                }
                );
            fillNavBar(document.getElementById("blogsColumn"), 
                metalist.map(item => {
                    return {
                        "text": item.title,
                        "action": function(){
                            fileToHtml(item.path, document.getElementById('content'), getMDStyle(mode));
                        },
                        "info": item.date + " " + item.tag + " " + item.title,
                    };
                }),
                {
                    'width': '100%',
                    'height': 'auto',
                    'display': 'flex',
                    'flex-direction': 'column',
                    'align-items': 'center',
                    'border-bottom':'1px solid gray',
                    'padding': '10px',
                }
            );
            terminal.writeHistory("nav on");
            }
            else if(comObj.options == '-off'){
                document.getElementById("blogsColumn").innerHTML = '';
                document.getElementById("navBar").innerHTML = '';
                terminal.writeHistory("nav off");
            }
        }
    }
}


const mdStyle = {
    'padding': '10px',
    'font-family': 'monospace',
    'font-size': '30px',
    'overflow': 'auto',
    'border-bottom': '1px solid white',
    'border-radius': '5px',
    'background-color': '#161b22',
    'width': '80%',
    'color': 'white',
}; // style for the markdown content

const mdStyle2 = { // 浅色主体
    'padding': '10px',
    'font-family': 'monospace',
    'font-size': '30px',
    'overflow': 'auto',
    'border-bottom': '1px solid black',
    'border-radius': '5px',
    'background-color': 'white',
    'width': '80%',
    'color': 'black',
}; // style for the markdown content
function getMDStyle(mode){
    if (mode === 'dark'){
        return mdStyle;
    }else{
        return mdStyle2;
    }
}
function getBG(mode){
    if (mode === 'dark'){
        return darkBG;
    }else{
        return lightBG;
    }
}


fileToHtml('/README.md',document.getElementById('content'), getMDStyle(mode));




