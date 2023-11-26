export class View{
    constructor(data,canvas,style){
        this.data = data; // 数据 class
        this.canvas = canvas; // canvas 元素
        this.style = style; // 样式
    }

    computeLayout(){
        let layout = [];
        let lineNum = this.data.data.length;
        for(let i=0;i<lineNum;i++){
            let line = [];
            let charNum = this.data.data[i].length;
            for(let j=0;j<charNum;j++){
                let word = this.data.data[i][j];
                let [width, height] = this.measureText(word);
                let charNum = word.length;
                let word2 = [];
                for(let k=0;k<charNum;k++){
                    let [crwidth, crheight] = this.measureText(word[k]);
                    word2.push({word: word[k], width: crwidth, height: height});
                }
                line.push(word2);
            }
            layout.push(line);
        }
        return layout;
    }

    render(){
        let ctx = this.canvas.getContext('2d');
        ctx.font = this.style['font-size'] + ' ' + this.style['font-family'];
        ctx.fillStyle = this.style['color'];
        // ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        let layout = this.computeLayout();
        let lineNum = layout.length;

        for(let i=0;i<lineNum;i++){
            let line = layout[i];
            let charNum = line.length;
            let x = 0;
            let y = 0;
            for(let j=0;j<charNum;j++){
                let word = line[j];
                let charNum = word.length;
                for(let k=0;k<charNum;k++){
                    let char = word[k];
                    ctx.fillText(char.word, x, y + char.height);
                    x += char.width;
                }
                x += this.measureText(' ')[0];
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