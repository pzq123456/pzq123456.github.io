import { fileToHtml } from './helpers/markdown.js';
import { fillNavBar } from './helpers/navBar.js';

import { metalist } from './blogs/meta.js'; // metalist is a list of blog metadata
import { createCanvas, animationEngine, eventEngine} from './src/Terminal/view.js';
import { drawTData2,drawMouse,smartDrawMouse } from './src/Terminal/renderer.js';
import { Line, TerminalData } from './src/Terminal/data.js';
import {parseLine, run} from './src/Terminal/interpreter.js';
import { blockStyle,blockStyle2,blockStyle3,blockStyle4,blockStyle5 } from './src/Terminal/defaultStyle.js';
import {initPage2} from './helpers/init.js';

// initPage2();

// Terminal === 部分
let myCanvas = createCanvas(document.getElementById('terminal'), window.innerWidth * 0.81, 300);
let myHistory =`pzq123456.github.io%> cd /blogs/Blog1.md`;
let Tdata = TerminalData.fromString(myHistory);
let wholeStyle = {
    'background-color': 'black',
    // 行间距
    'line-interval': '10px',
}
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
// draw Tdata
drawTData2(myCanvas, Tdata, 0, 40, wholeStyle, getStyle,0);
console.log(Tdata);