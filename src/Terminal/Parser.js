// 类别包括：命令、参数、地址
// 命令包括：cd、ls、echo、clear、help
const commands = ['cd', 'ls', 'echo', 'clear', 'help'];
// 用正则表达式表示规则
const tokenClass = ['command', 'option', 'path', 'argument'];

export function tokenization(line){
    // tokenization
    let tokens = line.split(' ');
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
            'color': 'orange',
            'font-weight': 'bold'
        }
    } else if (token.type === 'option'){
        return {
            'color': 'blue',
        }
    } else if (token.type === 'path'){
        return {
            'color': '#00ff00',
        }
    } else if (token.type === 'argument'){
        return {
            'color': 'gray',
        }
    }else if (token.type === 'warning'){
        return {
            'color': 'red',
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
        arguments: []
    };
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
