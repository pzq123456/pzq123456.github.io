/**
 * Data class
 * - 本质上是一个三维数组
 */
export class Data{
    constructor(){
        this.data = [];
    }

    toString(){
        let str = '';
        for(let line of this.data){
            for(let word of line){
                str += word;
            }
            str += '\n';
        }
        return str;
    }

    /**
     * 从字符串中读取数据
     * @param {string} str 
     */
    static fromString(str){
        let data = new Data();
        let lines = str.split('\n');
        for(let line of lines){
            let words = line.split(' ');
            let lineData = [];
            for(let word of words){
                lineData.push(word+" ");
            }
            data.data.push(lineData);
        }
        return data;
    }
}

/**
 * [ 
 *     [ ['a', 'b', 'c'], ['d', 'e', 'f'] ], // line 0
 *     [ ['g', 'h', 'i'], ['j', 'k', 'l'] ], // line 1
 *     [ ['m', 'n', 'o'], ['p', 'q', 'r'] ]  // line 2
 * ]
 * 
 */

