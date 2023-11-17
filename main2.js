import { fileToHtml } from './helpers/markdown.js';
import { fillNavBar } from './helpers/navBar.js';

import { metalist } from './blogs/meta.js'; // metalist is a list of blog metadata
import { createCanvas, animationEngine, eventEngine} from './src/Terminal/view.js';
import { drawTData,drawMouse,smartDrawMouse } from './src/Terminal/renderer.js';
import { Line, TerminalData } from './src/Terminal/data.js';
import {parseLine, run} from './src/Terminal/interpreter.js';
import { blockStyle,blockStyle2,blockStyle3,blockStyle4,blockStyle5 } from './src/Terminal/defaultStyle.js';
import {initPage2} from './helpers/init.js';

// initPage2();

// Terminal === 部分
let myCanvas = createCanvas(document.getElementById('terminal'), window.innerWidth * 0.81, 300);
