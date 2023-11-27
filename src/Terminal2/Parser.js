/**
 * 抽象语法树
 */
export class AST{
    constructor(){
        this.children = [];
    }
    appendChild(child){
        this.children.push(child);
    }
    toString(){
        let str = '';
        for(let child of this.children){
            str += child.toString();
        }
        return str;
    }
}