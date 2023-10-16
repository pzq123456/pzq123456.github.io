/**
 * 用于设计终端的数据结构
 */

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
