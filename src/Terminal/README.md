# PZQ-Canvas-Vertual-Terminal(pcvterm)

## Basic Concept
1. Data: maintain the data of terminal. A Data object should be created to store the data of terminal.
2. View: render the data to canvas. A View object wraps the Data object and render the data to canvas.
3. Parser: parse the command. A Parser object parse the command and return a command object.
4. Strategy: run the command. A Strategy object run the command object and change the data of terminal.
5. Canvas: the canvas element. A Canvas object is the canvas element.
## quick start

### template
```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8"/>
</head>
    <body>
        <div id="terminal">
        </div>
        <script type="module" src="/main.js"></script>
    </body>
</html>
```

### main.js
```js
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
const trie = Terminal.Parser.commandTrie; // 获得已经注入命令行关键词的前缀树
// ==== 终端部分 ====
const helpInfo = [
    "help : get help",
    "clear : clear terminal options: -all",
    "echo : echo string",
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

let data = Data.fromString(`Type ' help ' and press enter to get help. \nGemini ✨ in it ! Type ' chat ' to enter chat mode.`);

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



const callBackList = 
{
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
            // -all 选项代表清除所有内容
            if (comObj.options == '-all'){
                // 清除剪贴板
                navigator.clipboard.writeText("");
                // 清除 content
                document.getElementById('content').innerHTML = '';
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
}
```