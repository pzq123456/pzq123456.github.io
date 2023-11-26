/**
 * Data class
 * - 本质上是一个三维数组
 */
export class Data{
    constructor(){
        this.data = [];
    }

    fromString(str){
        let lines = str.split('\n');
        for(let line of lines){
            let lineArray = [];
            for(let char of line){
                lineArray.push(char);
            }
            this.data.push(lineArray);
        }
    }

    toString(){
        let str = '';
        for(let line of this.data){
            str += line.join('');
            str += '\n';
        }
        return str;
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