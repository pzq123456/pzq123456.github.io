/**
 * 用于设计终端的数据结构
 */
import { calCursorIndex } from './renderer.js'


/**
 * 单词块
 */
export class Block{
    // 以数组的形式存储每一个字符，可以向后扩展
    constructor(){
        this.data = [];
    }

    // 获取索引为 index 的字符
    get(index){
        return this.data[index];
    }

    // 添加字符
    addChar(char){
        this.data.push(char);
    }

    // 删除字符
    deleteChar(){
        if(this.data.length > 0){
            this.data.pop();
        }else{
            throw new Error('Block is empty');
        }
    }

    // 在index 处插入字符
    insertChar(index, char){
        this.data.splice(index, 0, char);
    }

    // 删除index 前的一个字符
    deleteCharBefore(index){
        this.data.splice(index - 1, 1);

        // hello
    }

    // 获取字符
    getChar(){
        return this.data.join('');
    }

    /**
     * 判断是否与给定的字符串相等
     * @param {string} str 
     * @returns {boolean} 是否相等
     */
    equals(str){
        return this.getChar() === str;
    }

    // 获取字符块的长度
    get length(){
        return this.data.length;
    }

    // 清空字符块
    clear(){
        this.data = [];
    }

    // -- 静态方法 -- //

    // 将字符串转换为字符块
    static fromString(str){
        let block = new Block();
        for(let char of str){
            block.addChar(char);
        }
        return block;
    }
}

/**
 * 行
 */
export class Line{
    constructor(){
        this.data = [];
    }

    // 在index 处插入字符
    insertChar(index, char){
        // this.data.splice(index, 0, char);
        let currentCursor = calCursorIndex(this, index);
        this.data[currentCursor[0]].insertChar(currentCursor[1], char);
    }

    // 删除index 前的一个字符
    deleteCharBefore(index){
        let currentCursor = calCursorIndex(this, index);
        // 若为行首则不删除
        if(currentCursor[1] === 0 && currentCursor[0] === 0){
            return false;
        }
        // 若当前字符块仅有一个字符 则删除当前字符块
        if(currentCursor[1] === 0){
            this.data.splice(currentCursor[0], 1);
        }else{
            this.data[currentCursor[0]].deleteCharBefore(currentCursor[1]);
        }
        return true;
    }

    /**
     * 获取索引为 index 的字符块
     * @param {Number} index 
     * @returns 
     */
    get(index){
        return this.data[index];
    }

    // 添加字符块
    addBlock(block){
        this.data.push(block);
    }

    // 在索引处创建空字符块
    createBlock(index){
        let block = new Block();
        // 并首先插入 ^ 字符
        block.addChar('^');
        let currentCursor = calCursorIndex(this, index);

        // 在当前索引处插入字符块
        this.data.splice(currentCursor[0], 0, block);
    }

    // 在当前索引处分割 block
    splitBlock(index){
        let currentCursor = calCursorIndex(this, index);
        // console.log(currentCursor);
        let block = this.data[currentCursor[0]];
        // console.log(block.length);
        // 首先判断是否在 block 的末尾 却不在行末尾
        // if(currentCursor[1] == block.length - 1 && currentCursor[0] !== this.data.length - 1){
        //     console.log(this.data);
        //     console.log(currentCursor);
        //     // 若在末尾则不分割
        //     return false;
        // }else 

        // 若是第一个字符块的第一个元素 则不分割
        if(currentCursor[1] === 0 && currentCursor[0] === 0){
            return false;
        }else if(  // 若在行末尾 则创建一个空 block
            currentCursor[1] == block.length - 1 && currentCursor[0] == this.data.length - 1 
        ){     
            console.log(this.data);
            // 创建空 block 并插入 末尾
            let newBlock = new Block();
            newBlock.addChar('^');
            this.data.push(newBlock);
        }else{
            // 只需要新建一个 block 并将后半部分的字符插入
            let newBlock = new Block();
            // 将 block 从 index 处分割为两份
            let secondPart = block.data.splice(currentCursor[1]);
            // 将 secondPart 插入到新的 block 中
            secondPart.forEach((char) => {
                newBlock.addChar(char);
            })
            // 再在 block 中插入 ^ 字符
            block.addChar('^');
            // 将新的 block 插入到 index + 1 处
            this.data.splice(currentCursor[0] + 1, 0, newBlock);
        }
        return true;
    }

    // 删除字符块
    deleteBlock(){
        if(this.data.length > 0){
            this.data.pop();
        }else{
            throw new Error('Line is empty');
        }
    }

    // 获取行的字符串
    getLine(){
        // block 之间加空格 末尾加换行符
        // return this.data.map(block => block.getChar()).join('');
        return this.data.map(block => block.getChar()).join(' ').concat('\n');
    }

    // 获取行的长度
    get length(){
        return this.data.length;
    }

    getFullLength(){
        let len = 0;
        this.data.forEach((block) => {
            len += block.length; // 加上空格
        })
        return len;
    }

    // 清空行
    clear(){
        this.data = [];
    }

    // -- 静态方法 -- //
    // 将字符串转换为行
    static fromString(str){
        let line = new Line();
        // 将 str 以空格分割为单词
        let words = str.split(' ');
        // 将每一个单词转换为字符块
        for(let word of words){
            line.addBlock(Block.fromString(word+'^'));
        }
        return line;
    }
}

/**
 * 终端数据
 * - 用于存储终端的数据
 * - 以行来组织数据
 */
export class TerminalData{
    constructor(){
        this.data = [];
    }

    /**
     * 添加行
     * @param {Line} line 
     */
    addLine(line){
        this.data.push(line);
    }

    // 静态方法
    // 将字符串转换为终端数据
    static fromString(str){
        let terminalData = new TerminalData();
        // 将 str 以换行符分割为行
        let lines = str.split('\n');
        // 将每一行转换为行
        for(let line of lines){
            terminalData.addLine(Line.fromString(line));
        }
        return terminalData;
    }
}

