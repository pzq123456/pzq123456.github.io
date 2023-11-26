export class View{
    constructor(data,canvas,style){
        this.data = data; // 数据 class
        this.canvas = canvas; // canvas 元素
        this.style = style; // 样式
    }

    computeLayout(){
        let layout = [];
        let lineNum = this.data.data.length;
        let x = 0;
        let y = 0;
        for(let i=0;i<lineNum;i++){
            let line = [];
            let charNum = this.data.data[i].length;
            for(let j=0;j<charNum;j++){
                let char = this.data.data[i][j];
                let charSize = this.measureText(char);
                line.push({
                    'char': char,
                    'x': x,
                    'y': y,
                    'w': charSize[0],
                    'h': charSize[1],
                });
                x += charSize[0];
            }
            layout.push(line);
            x = 0;
            y += line[0].h;
        }
        return layout;
    }

    render(){
        let ctx = this.canvas.getContext('2d');
        ctx.font = this.style['font-size'] + ' ' + this.style['font-family'];
        ctx.fillStyle = this.style['color'];
        let layout = this.computeLayout();
        for(let line of layout){
            for(let char of line){
                ctx.fillText(char.char, char.x, char.y);
            }
        }
        
    }



    /**
     * 量测单个字符的宽度和高度
     * @param {*} text 
     * @returns [width, height]
     */
    measureText(text){
        let ctx = this.canvas.getContext('2d');
        ctx.font = this.style['font-size'] + ' ' + this.style['font-family'];
        let metrics = ctx.measureText(text);
        return [metrics.width, metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent];
    }
}