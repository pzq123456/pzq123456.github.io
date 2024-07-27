/**
 * Data class
 * - 本质是一个二维数组
 * [
 *     line1,
 *     line2, // ...
 * ]
 */
export class Data{
    constructor(trie){
        this.trie = trie;
        this._history = [];
        this._current = ''; // 当前行 / 活跃行
        this._inputHistory = []; // 输入历史
        this._candidates = []; // 候选词
        // 增添时间戳 默认为当前时间
        this._timeStamp = Date.now();
        this._undoStack = [];
        this._redoStack = [];
    }

    updateCandidates(c){
        this._candidates = this.trie.autoComplete(this.getActiveWord(c));
    }

    paste(i, text) {
        // 保存当前状态到撤销栈
        this._undoStack.push({ action: 'paste', index: i, text: text });
        // 清空重做栈
        this._redoStack = [];

        // 执行粘贴操作
        this._current = this._current.slice(0, i) + text + this._current.slice(i);

        let index = i + text.length;

        this.updateCandidates(index - 1);

        return index;
    }

    delete(i, length = 1) {
        if (length == 0) length = 1;
        
        // 保存当前状态到撤销栈
        const deletedText = this._current.slice(i - length, i);
        this._undoStack.push({ action: 'delete', index: i, length: length, text: deletedText });
        // 清空重做栈
        this._redoStack = [];

        // 执行删除操作
        this._current = this._current.slice(0, i - length) + this._current.slice(i);
        let index = i - length > 0 ? i - length : 0;
        this.updateCandidates(index - 1);

        return index;
    }
    
    _applyAction(action, isUndo) {
        if (action.action === 'paste') {
            this._current = isUndo
                ? this._current.slice(0, action.index) + this._current.slice(action.index + action.text.length)
                : this._current.slice(0, action.index) + action.text + this._current.slice(action.index);
        } else if (action.action === 'delete') {
            this._current = isUndo
                ? this._current.slice(0, action.index - action.length) + action.text + this._current.slice(action.index - action.length)
                : this._current.slice(0, action.index - action.length) + this._current.slice(action.index);
        }
        let index = this._current.length;
        this.updateCandidates(index - 1);
        return index;
    }

    undo() {
        if (this._undoStack.length === 0) return this._current.length;
        const lastAction = this._undoStack.pop();
        this._redoStack.push(lastAction);
        return this._applyAction(lastAction, true);
    }

    redo() {
        if (this._redoStack.length === 0) return this._current.length;
        const lastAction = this._redoStack.pop();
        this._undoStack.push(lastAction);
        return this._applyAction(lastAction, false);
    }

    clearUndoRedo() {
        this._undoStack = [];
        this._redoStack = [];
    }

    getCurrentText() {
        return this._current;
    }

    getActiveWord(i) {
        // 若单词本身为空格，则返回空字符串
        if (i < 0 || i >= this._current.length || this._current[i] === ' ') return '';
    
        let start = i;
        let end = i;
    
        // 向左扩展，找到单词的起始位置
        while (start > 0 && this._current[start - 1] !== ' ') {
            start--;
        }
    
        // 向右扩展，找到单词的结束位置
        while (end < this._current.length && this._current[end] !== ' ') {
            end++;
        }
    
        return this._current.slice(start, end);
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

    tab(i) {

        if (this._candidates.length > 0) {
            // 若有候选词 则将候选词接着当前行的第 i 个字符写入当前行
            return this.paste(i, this._candidates[0]);
        } else {
            // 写入四个空格
            return this.paste(i, '    ');
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
    static fromString(str, trie = null){
        let data;
        if(trie){
            trie.insertText(str);
            data = new Data(trie);
        }else{
            data = new Data();
        }
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

