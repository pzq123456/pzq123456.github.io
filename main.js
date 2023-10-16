import { fileToHtml } from './helpers/markdown.js';
import { fillNavBar } from './helpers/navBar.js';
import {markedHighlight} from './helpers/highlight.js';
import { metalist } from './blogs/meta.js'; // metalist is a list of blog metadata
import { createCanvas,HelloWorld } from './src/Terminal/view.js';

import { drawBlock } from './src/Terminal/renderer.js';
import { Block } from './src/Terminal/data.js';




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
    'color': 'white',
    'cursor-color': 'white',
}; // style for the markdown content

drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 20,blockStyle,0);
drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 45,blockStyle,1);
drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 70,blockStyle,2);
drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 95,blockStyle,3);
drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 120,blockStyle,4);
drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 145,blockStyle,5);
drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 170,blockStyle,6);
drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 195,blockStyle,7);
drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 220,blockStyle,8);
drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 245,blockStyle,9);
drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 270,blockStyle,10);
drawBlock(myCanvas, Block.fromString('Hello World Hello World Hello World Hello World! 123123'), 0, 295,blockStyle,11);


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
            } else {
                terminal.style.position = 'sticky';
                terminal.style.top = '0';
                terminal.style.zIndex = '1';
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

