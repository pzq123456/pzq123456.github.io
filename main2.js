import { fileToHtml } from './helpers/markdown.js';
import { fillNavBar } from './helpers/navBar.js';
import { createCanvas} from './src/Terminal/view.js';
import { Data } from './src/Terminal2/Data.js';
import { View,animationEngine } from './src/Terminal2/View.js';
// import * as RVGeo from 'https://cdn.jsdelivr.net/npm/rvgeo@2.0.7/+esm'

let myCanvas = createCanvas(document.getElementById('terminal'), 500, 310);

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
            const myMBR1 = [
                -109.04885344551185,
                36.988099165319085,
                -102.05550147177286,
                41.01069002801907
              ]
            const canvas = myCanvas;
            const fastFFT2 = RVGeo.Fourier.fastFFT2; // 2D快速傅里叶变换
            const drawGrid2d = RVGeo.Renderer.drawGrid2d; // 2D网格绘制
            const Grid = RVGeo.Coverage.Grid; // 网格类
            const Sin3D = RVGeo.Noise.Sin3D; // 3D正弦波噪声生成器
            const Perlin = RVGeo.Noise.Perlin; // Perlin 噪声生成器
            const dampedSin3D = RVGeo.Noise.dampedSin3D; // 3D阻尼正弦波噪声生成器
          
            let data = []; // 二维噪声数据
            data.push(sample(128,0.05,0.05,Perlin));
            data.push(sample(128,0.05,0.5,Perlin));
            data.push(sample(128,0.01,0.01,Perlin));
            data.push(sample(128,0.1,0.1,Sin3D));
            data.push(sample(128,1,1,Sin3D));
            data.push(sample(128,0.05,0.01,Sin3D));
            data.push(sample(128,0.5,0.1,Perlin));
            data.push(sample(128,1,1,dampedSin3D));
          
            let fft = []; // 二维傅里叶变换结果
            data.forEach((d) => {
              let tmp = fastFFT2(d);
              fft.push(tmp.map((row) => row.map((c) => Math.sqrt(c.real*c.real + c.imag*c.imag)))); // 模值
            });
          
            let grid = []; // 二维网格
            data.forEach((d) => {
              grid.push(new Grid(myMBR1, [d]));
            });
          
            let fftGrid = []; // 二维傅里叶变换网格
            fft.forEach((d) => {
              fftGrid.push(new Grid(myMBR1, [d]));
            });
          
            // 1024 * 1024
            for(let i = 0; i < 4; i++){
              drawGrid2d(canvas, data[i], {x: 0, y: i*256, w: 256, h: 256}, grid[i].getBandStatistics(0), RVGeo.Colors.simpleColorBandFactory(RVGeo.Colors.stretchType.linear));
              drawGrid2d(canvas, fft[i], {x: 256, y: i*256, w: 256, h: 256}, fftGrid[i].getBandStatistics(0), RVGeo.Colors.simpleColorBandFactory(RVGeo.Colors.stretchType.linear));
            }
          
            for(let i = 4; i < 8; i++){
              drawGrid2d(canvas, data[i], {x: 512, y:(i - 4)*256, w: 256, h: 256}, grid[i].getBandStatistics(0), RVGeo.Colors.simpleColorBandFactory(RVGeo.Colors.stretchType.linear));
              drawGrid2d(canvas, fft[i], {x: 768, y:(i - 4)*256, w: 256, h: 256}, fftGrid[i].getBandStatistics(0), RVGeo.Colors.simpleColorBandFactory(RVGeo.Colors.stretchType.linear));
            }
          
            function sample(size,x,y, sampleFunc){
              let data = [];
              for(let i = 0; i < size; i++){
                let tmp = [];
                for(let j = 0; j < size; j++){
                  let noise = sampleFunc(i*x - size/2, j*y - size/2); // 生成噪声0-1
                  tmp.push(noise);
                }
                data.push(tmp);
              }
              return data;
            }
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

let testStyle = {
    'font-family': 'monospace',
    'font-size': '30px',
    'color': 'white',
    'background-color': 'black',
};



let data = Data.fromString(`cd test
cd /test/ test -h
help dhjksahd jdsklajdl djsaldj
ls djskaldj jdksaldj jdksaldjidw jsdkal`);

let testLine = "cd pzq /home/ -l -a -h cd pzq /home/ -l -a -h cd pzq /home/ -l -a -h cd pzq /home/ -l -a -h cd pzq /home/ -l -a -h cd pzq /home/ -l -a -h cd pzq /home/ -l -a -h";



// console.log(data);
let c = 0;
let hc = 0; // history cursor
animationEngine(1000/60, () => {
    // clear canvas
    myCanvas.getContext('2d').clearRect(0,0,myCanvas.width,myCanvas.height);
    let view = new View(data,myCanvas,testStyle);
    let y = view.drawHiostry(hc);
    y = view.drawCurrent(y,c);
    // console.log(hc);
});
// 监听键盘事件输入字母
document.addEventListener('keydown',function(e){
    if (e.key.length === 1){
        // 输入字母
        c = data.insert(c,e.key);
    }
    if (e.key === 'Backspace'){
        // 删除字母
        c = data.delete(c);
    }
    if (e.key === 'Enter'){
        // 换行
        c = data.enter();
        console.log(data);
    }
    // 按下左右键
    if (e.key === 'ArrowLeft'){
        c--;
    }
    if (e.key === 'ArrowRight'){
        c++;
    }

    // 按下上下键
    if (e.key === 'ArrowUp'){
        hc--;
    }
    if (e.key === 'ArrowDown'){
        hc++;
    }
});