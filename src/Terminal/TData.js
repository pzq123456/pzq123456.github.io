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
        this._candidates = []; // 候选词
        // 增添时间戳 默认为当前时间
        this._timeStamp = Date.now();
    }

    paste(i,text){
        // 在当前行的第 i 个字符前粘贴 text
        this._current = this._current.slice(0,i) + text + this._current.slice(i);
        // 返回 i + text.length 作为光标位置
        return i + text.length;
    }

    getActiveWord(i){
        // 从当前行的第 i 个字符开始 向两边扩展 直到遇到空格或者边界
        // 返回扩展后的字符串
        let left = i - 1;
        let right = i;
        while(left >= 0 && this._current[left] !== ' '){
            left--;
        }
        while(right < this._current.length && this._current[right] !== ' '){
            right++;
        }
        return this._current.slice(left + 1,right);
    }

    getLeftActiveWord(i){
        // 从当前行的第 i 个字符开始 向左扩展 直到遇到空格或者边界
        // 返回扩展后的字符串
        let left = i - 1;
        while(left >= 0 && this._current[left] !== ' '){
            left--;
        }
        return this._current.slice(left + 1,i);
    }

    // insert(i,char){
    //     // 在当前行的第 i 个字符前插入 char
    //     this._current = this._current.slice(0,i) + char + this._current.slice(i);
    //     // 返回 i + 1 作为光标位置
    //     return i + 1;
    // }

    /**
     * 删除 i 前一个字符
     * @param {number} i - index 
     */
    delete(i, length = 1){
        // // 删除当前行的第 i 个字符
        // this._current = this._current.slice(0,i-1) + this._current.slice(i);
        // // 若 i > 0 则返回 i - 1 作为光标位置
        // // 否则返回 0 作为光标位置
        // return i > 0 ? i - 1 : 0;
        length == 0 ? length = 1 : length;
        // 删除指定长度的字符
        this._current = this._current.slice(0,i-length) + this._current.slice(i);
        return i - length > 0 ? i - length : 0;
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

    resetCurr(){
        // 重置当前行
        this._current = '';
    }

    clear(){
        // 清空历史记录和当前行
        this._history = [];
        this._current = '';
    }

    tab(i){
        // 若有候选词 则将候选词接着当前行的第 i 个字符写入当前行
        if(this._candidates.length > 0){
            this._current = this._current.slice(0,i) + this._candidates[0] + this._current.slice(i);
            return i + this._candidates[0].length;
        }else{
            // 写入四个空格
            this._current = this._current.slice(0,i) + '    ' + this._current.slice(i);
            return i + 4;
        }
    }

    getCurrent(c=-1){
        if(c == -1){
            return this._current.slice();
        }else{
            return this._current[c];
        }
    }


    // 将 data 类导出为 JSON 以供保存
    toJSON(){
        let json =  {
            history: this._history,
            current: this._current,
            inputHistory: this._inputHistory,
            candidates: this._candidates,
            timeStamp: Date.now()
        }
        // stringify
        return JSON.stringify(json);
    }

    // 从 JSON 中读取数据
    readJSON(json){
        let data = JSON.parse(json);
        this._history = data.history;
        this._current = data.current;
        this._inputHistory = data.inputHistory;
        this._candidates = data.candidates;
        this._timeStamp = data.timeStamp;
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

    /**
     * 从 JSON 中读取（历史）数据
     * @param {object} json 
     */
    static fromJSON(json){
        let data = new Data();
        data._history = json.history;
        data._current = json.current;
        data._inputHistory = json.inputHistory;
        data._candidates = json.candidates;
        return data;
    }
}

// 设计： 终端的数据仅当前行可以修改，一旦 enter 则将其写入到 data 中作为历史记录不可修改

