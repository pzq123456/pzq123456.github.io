// 类别包括：命令、参数、地址
import { Trie } from "./Trie.js";
// 命令包括：cd、ls、echo、clear、help
const commands = ['cd', 'ls', 'echo', 'clear', 'help', 'chat', 'exit','style','about', 'mdr','cm','cache','load','nav'];
// 将 commands 注入 Trie 并返回
function injectCommands(){
    let trie = new Trie();
    commands.forEach(command => trie.insert(command));
    return trie;
}
export const commandTrie = injectCommands(); // 命令前缀树

// 用正则表达式表示规则
const tokenClass = ['command', 'option', 'path', 'argument'];

export function tokenization(line){
    // tokenization
    // let tokens = line.split(' ');
    // splitWords
    let tokens = splitWords(line);
    // 为每一个 token 添加类型
    tokens = tokens.map(token => {
        if (commands.includes(token)){
            return {
                type: 'command',
                value: token
            }
        }else if(token.includes('.') || token.includes('/')){
            return {
                type: 'path',
                value: token
            }
        }
        else if (token.startsWith('-')){
            return {
                type: 'option',
                value: token
            }
            // 含有 ! 或 no 说明为警告
        }else if(token.startsWith('!') || token.startsWith('no')){
            return {
                type: 'warning',
                value: token
            }
        }
        else{
            return {
                type: 'argument',
                value: token
            }
        }
    }
    );
    return tokens;
}

// 根据 token 的类型返回对应的样式
export function tokenStyle(token){
    if (token.type === 'command'){
        return {
            'color': '#ebbbff',
        }
    } else if (token.type === 'option'){
        return {
            'color': '#ffc58f',
        }
    } else if (token.type === 'path'){
        return {
            'color': '#bbdaff',
        }
    } else if (token.type === 'argument'){
        return {
            'color': 'rgba(255,255,255,0.8)'
        }
    }else if (token.type === 'warning'){
        return {
            'color': '#ff9da4',
        }
    }
}


// MarkDown tokenization
export function mdTokenization(line){
    // tokenization
    // let tokens = line.split(' ');
    // splitWords
    let tokens = splitWords(line);
    // 为每一个 token 添加类型
    tokens = tokens.map(token => {
        // 使用正则表达式判断
        if (token.includes('#')){
            return {
                type: 'title',
                value: token
            }
        }else if (token.includes('[') || token.includes(']') || token.includes('(') || token.includes(')')){
            return {
                type: 'link',
                value: token
            }
        }else if (token.startsWith('---')){
            return {
                type: 'hr',
                value: token
            }
        }else if (token.startsWith('>')){
            return {
                type: 'quote',
                value: token
            }
        }else if (token.startsWith("```")){
            return {
                type: 'code',
                value: token
            }
        }else if (token.includes('*') || token.startsWith('-') || token.includes('+')){
            return {
                type: 'list',
                value: token
            }
        }
        else if (token.startsWith('//') || token.startsWith('/*') || token.startsWith('*/') || token.includes('/')){
            return {
                type: 'escape',
                value: token
            }
        }else{
            return {
                type: 'text',
                value: token
            }
        }
    }
    );
    return tokens;
}

export function mdTokenStyle(token){
    if (token.type === 'title'){
        return {
            'color': '#ebbbff',
        }
    } else if (token.type === 'link'){
        return {
            'color': '#bbdaff',
        }
    } else if (token.type === 'list'){
        return {
            'color': '#99ffff',
        }
    } else if (token.type === 'quote'){
        return {
            'color': '#ff9da4',
        }
    }else if (token.type === 'code'){
        return {
            'color': '#d1f1a9',
        }
    }else if (token.type === 'hr'){
        return {
            'color': '#ffeead',
        }
    }else if (token.type === 'text'){
        return {
            'color': 'rgba(255,255,255,0.8)'
        }
    }else if (token.type === 'escape'){
        return {
            'color': '#bbdaff',
        }
    }
}





/**
 * 解析 token 用于后续执行命令
 * @param {string[]} tokens 
 * @returns {object}
 */
export function Parser(tokens){
    // 从左到右依次解析 token
    // 返回一个对象
    // {
    //     command: 'cd',
    //     options: ['-l','-a','-h'],
    //     path: '/home/',
    //     arguments: []
    // }
    let result = {
        command: '',
        options: [],
        path: '',
        arguments: [],
        others: ""
    };

    // 若有 mdr 命令则直接返回others 
    if (tokens[0].value === 'mdr' || tokens[0].value === 'echo'){
        result.command = tokens[0].value;
        // 若tokens[1] == '-response' 则返回后面的所有内容
        if (tokens[1].value == '-Response:'){
            result.others = tokens.slice(2).map(token => token.value).join(' ');
            return result;
        }
        result.others = tokens.slice(1).map(token => token.value).join(' ');
        return result;
    }
    for (let i = 0; i < tokens.length; i++){
        let token = tokens[i];
        if (token.type === 'command'){
            result.command = token.value;
        }else if (token.type === 'option'){
            result.options.push(token.value);
        }else if (token.type === 'path'){
            result.path = token.value;
        }else if (token.type === 'argument'){
            result.arguments.push(token.value);
        }
    }
    return result;
}


// @function splitWords(str: String): String[]
// Trims and splits the string on whitespace and returns the array of parts.
export function splitWords(str) {
	// return str.trim().split(/\s+/);
    // 以空格为分隔符 但是对于连续的空格 譬如 tab 代表四个空格 则会被认为一个 token
    return str.trim().split(' ');
}