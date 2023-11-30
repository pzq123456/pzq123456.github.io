/**
 * Data class
 * - 本质是一个二维数组
 * [
 *     line1,
 *     line2, // ...
 * ]
 */
export class Data{
    constructor(){
        this._history = [];
        this._current = ''; // 当前行 / 活跃行
        this._inputHistory = []; // 输入历史
    }

    insert(i,char){
        // 在当前行的第 i 个字符前插入 char
        this._current = this._current.slice(0,i) + char + this._current.slice(i);
        // 返回 i + 1 作为光标位置
        return i + 1;
    }

    /**
     * 删除 i 前一个字符
     * @param {number} i - index 
     */
    delete(i){
        // 删除当前行的第 i 个字符
        this._current = this._current.slice(0,i-1) + this._current.slice(i);
        // 若 i > 0 则返回 i - 1 作为光标位置
        // 否则返回 0 作为光标位置
        return i > 0 ? i - 1 : 0;
    }

    enter(){
        // 将当前行写入历史记录 并清空当前行
        this._history.push(this._current);
        // 存入输入历史
        this._inputHistory.push(this._current);
        this._current = '';
        return 0;
    }

    writeCurrent(str){
        // 将 str 写入当前行
        this._current = str;
        return str.length;
    }
    
    writeHistory(str){
        // 将 str 写入历史记录
        this._history.push(str);
        return 0;
    }

    toString(){
        // 将历史记录和当前行拼接成字符串
        return this._history.join('\n') + '\n' + this._current;
    }

    clear(){
        // 清空历史记录和当前行
        this._history = [];
        this._current = '';
    }

    /**
     * 从字符串中读取（历史）数据
     * @param {string} str 
     */
    static fromString(str){
        let data = new Data();
        data._history = str.split('\n');
        return data;
    }
}

// 设计： 终端的数据仅当前行可以修改，一旦 enter 则将其写入到 data 中作为历史记录不可修改

