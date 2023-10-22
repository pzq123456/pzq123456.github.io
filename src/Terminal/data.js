/**
 * 用于设计终端的数据结构
 */
import { calCursorIndex, calCursorIndex2, deCalCursorIndex, deCalCursorIndex2 } from './renderer.js'


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
        if(this.getChar().endsWith('^')){
            return this.getChar().slice(0, -1) === str;
        }
    }
    /**
     * 若开头第一个字符与给定的字符相等
     * @param {*} char
     */
    headEquals(char){
        return this.getChar()[0] === char;
    }

    contains(char){
        return this.getChar().includes(char);
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
        if(this.data[currentCursor[0]].length === 1){
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

    get blockStrings(){
        // 首先去除每一个 block 的 ^ 字符
        let res = [];
        this.data.forEach((block) => {
            res.push(block.getChar().slice(0, -1));
        })
        return res;
    }

    // 在当前索引处分割 block
    splitBlock(index){
        let currentCursor = calCursorIndex(this, index);
        let block = this.data[currentCursor[0]];
        // 若是第一个字符块的第一个元素 则不分割
        if(currentCursor[1] === 0 && currentCursor[0] === 0){
            return false;
        }else if(  // 若在行末尾 则创建一个空 block
            currentCursor[1] == block.length - 1 && currentCursor[0] == this.data.length - 1 
        ){     
            // console.log(this.data);
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
    concat(line){
        // 将另一行的字符块连接到当前行的字符块后面
        line.data.forEach((block) => {
            this.addBlock(block);
        })
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

    clear(){
        this.data = [];
    }
    /**
     * 添加行
     * @param {Line} line 
     */
    addLine(line){
        this.data.push(line);
    }

    get(index){
        return this.data[index];
    }

    get length(){
        return this.data.length;
    }

    getFullLength(){
        let len = 0;
        this.data.forEach((line) => {
            len += line.getFullLength();
        })
        return len;
    }


    downIndex(currIndex){
        // 从当前index 起算 返回下一行合适位置的一纬索引
        // 若下一行较长可以到达当前位置的正下方 则返回当前位置的正下方
        // 否则返回下一行的末尾
        // 每一行的长度不一定相等 = [5, 5, 6, 7, 8, 9, 10] currIndex = 11 --> 17

        let currentCursor = calCursorIndex2(this, currIndex); // [lineIndex, blockIndex, charIndex]
        // 首先判断是否为最后一行
        if(currentCursor[0] === this.length - 1){
            return this.getFullLength() - 1;
        }else{

            // 找到下一行的长度
            let nextLineLength = this.data[currentCursor[0] + 1].getFullLength();
            // 获取行内索引
            let inLineIndex = deCalCursorIndex(this.data[currentCursor[0]], [currentCursor[1],currentCursor[2]]);

            if(inLineIndex < nextLineLength){
                // 获取当前行的长度
                let currentLineLength = this.data[currentCursor[0]].getFullLength();
                // 计算行内剩余长度
                let remain = currentLineLength - inLineIndex;
                // 当前总索引 + 行内剩余长度
                let nextLineIndex = currIndex + remain + inLineIndex;
                return nextLineIndex;
            }else{
                // 直接到下一行的末尾
                return deCalCursorIndex2(this, [currentCursor[0] + 1, this.data[currentCursor[0] + 1].length - 1, this.data[currentCursor[0] + 1].get(this.data[currentCursor[0] + 1].length - 1).length - 1]);
            }
        }
    }

    upIndex(currIndex){
        // 从当前index 起算 返回上一行合适位置的一纬索引
        // 若上一行较长可以到达当前位置的正上方 则返回当前位置的正上方
        // 否则返回上一行的末尾
        // 每一行的长度不一定相等 = [5, 5, 6, 7, 8, 9, 10] currIndex = 11 --> 17

        let currentCursor = calCursorIndex2(this, currIndex); // [lineIndex, blockIndex, charIndex]
        // 首先判断是否为第一行
        if(currentCursor[0] === 0){
            return 0;
        }else{
            // 找到上一行的长度
            let preLineLength = this.data[currentCursor[0] - 1].getFullLength();
            // 获取行内索引
            let inLineIndex = deCalCursorIndex(this, [currentCursor[1],currentCursor[2]]);
            if(inLineIndex < preLineLength){
                // 计算行内剩余长度
                let remain = preLineLength - inLineIndex;
                // 当前总索引 + 行内剩余长度
                let preLineIndex = currIndex - remain - inLineIndex;
                return preLineIndex;
            }else{
                // 直接到上一行的末尾
                return deCalCursorIndex2(this, [currentCursor[0] - 1, this.data[currentCursor[0] - 1].length - 1, this.data[currentCursor[0] - 1].get(this.data[currentCursor[0] - 1].length - 1).length - 1]);
            }
        }

    }

    insertChar(c, char){
        let currentCursor = calCursorIndex2(this, c);
        c++;
        let inLineIndex = deCalCursorIndex(this.data[currentCursor[0]], [currentCursor[1],currentCursor[2]]);
        // console.log(inLineIndex);
        this.data[currentCursor[0]].insertChar(inLineIndex, char);
        return c;
    }

    deleteCharBefore(c){
        if(c <= 0){
            return 0;
        }
        // 每一行的第一个字符处需要特殊处理
        // 其他位置可以直接调用 Line 的 deleteCharBefore 方法
        let currentCursor = calCursorIndex2(this, c);

        // 若为第一个字符
        if(currentCursor[1] === 0 && currentCursor[2] === 0){
            // 若为第一行
            if(currentCursor[0] === 0){
                return 0;
            }else{
                // 若不为第一行
                // 计算本行的长度 若为 1 则删除本行
                if(this.data[currentCursor[0]].getFullLength() === 1){
                    this.data.splice(currentCursor[0], 1);
                    // console.log(this.data);
                    // 获取上一行的末尾索引
                    let preLineIndex = deCalCursorIndex2(this, [currentCursor[0] - 1, this.data[currentCursor[0] - 1].length - 1, this.data[currentCursor[0] - 1].get(this.data[currentCursor[0] - 1].length - 1).length - 1]);
                    return preLineIndex;
                }else{
                    // 获取上一行的末尾索引
                    let preLineIndex = deCalCursorIndex2(this, [currentCursor[0] - 1, this.data[currentCursor[0] - 1].length - 1, this.data[currentCursor[0] - 1].get(this.data[currentCursor[0] - 1].length - 1).length - 1]);
                    return preLineIndex;
                }

            }
        }else{
            // 若不为第一个字符
            // 则直接调用 Line 的 deleteCharBefore 方法
            // 计算行内索引
            let inLineIndex = deCalCursorIndex(this.data[currentCursor[0]], [currentCursor[1],currentCursor[2]]);
            this.data[currentCursor[0]].deleteCharBefore(inLineIndex);
            return c - 1;
        }
    }
    splitBlock(c){
        // 直接映射到行内操作即可
        let currentCursor = calCursorIndex2(this, c);
        let inLineIndex = deCalCursorIndex(this.data[currentCursor[0]], [currentCursor[1],currentCursor[2]]);
        this.data[currentCursor[0]].splitBlock(inLineIndex);
        return c + 1;
    }

    /**
     * 与 enter 键配合使用
     * - 解析行并调用命令会在外部显式调用 所以这里只需要返回当前活跃行即可
     * @param {Number} c - 当前索引
     * @returns {Line} - 返回当前行
     */
    enter(c){
        // 返回当前活跃行本身
        let currentCursor = calCursorIndex2(this, c);
        return this.data[currentCursor[0]];
    }

    /**
     * 将另一个终端数据合并到当前终端数据中
     * @param {TerminalData} anthorTerminalData 
     */
    merge(
        anthorTerminalData,
    ){
        // 将另一个终端数据合并到当前终端数据中
        anthorTerminalData.data.forEach((line) => {
            this.addLine(line);
        })
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

