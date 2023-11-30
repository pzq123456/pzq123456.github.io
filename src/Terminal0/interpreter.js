/**
 * 用于解释器的一些函数
 */

import { Line, TerminalData } from "./data.js";

const defaultCommandList = [
    {
        name: "cd",
        description: "change directory",
        usage: "cd <path>",
        func: function(path){
            console.log("cd", path);
        },
        manipulate: function(data){
            let line = Line.fromString('pzq123456.github.io%> ');
            data.addLine(line);
            return data.getFullLength() - 1;
        }
    },
    {
        name: "ls",
        description: "list files",
        usage: "ls <path>",
        func: function(path){
            console.log("ls", path);
        },
        manipulate: function(data){
            // manipulate 用于修改数据以实现交互
        }
    },
    {
        name: "cat",
        description: "show file content",
        usage: "cat <path>",
        func: function(path){
            console.log("cat", path);
        },
        manipulate: function(data){
            // manipulate 用于修改数据以实现交互
        }
    },
    {
        name: "clear",
        description: "clear the terminal",
        usage: "clear",
        func: function(){
            console.log("clear");
        },
        manipulate: function(data){
            // manipulate 用于修改数据以实现交互
        }
    },
    {
        name: "help",
        description: "show help",
        usage: "help",
        func: function(){
            console.log("help");
        },
        manipulate: function(data){
            // manipulate 用于修改数据以实现交互
        }
    },
]


const deflautCommandList = ["cd", "ls", "cat", "clear", "help"];

export function defaultParseFun(line){
    let blockStrings = line.blockStrings;
    let res = {
        command: null,
        args: [],
    };
    if(blockStrings.length === 0){
        return res;
    }else{
        // parseFun 用于将命令与参数分开 默认是只取第一个为命令 其余为参数
        let command = blockStrings[0];
        let args = blockStrings.slice(1);
        res.command = command;
        res.args = args;
        return res;
    }
}
export function defaultParseFun2(line){
    let blockStrings = line.blockStrings;
    let res = {
        command: null,
        args: [],
    };
    if(blockStrings.length === 0){
        return res;
    }else{
        // 第一个 block 为提示信息忽略 第二个为命令 其余为参数
        let command = blockStrings[1];
        let args = blockStrings.slice(2);
        res.command = command;
        res.args = args;
        return res;
    }
}


/**
 * 用于解析一行命令 解析成命令和参数
 * @param {Line} line 
 * @param {Function} parseFun - 用于解析命令的函数
 * @returns {Object} - {command, args}
 */
export function parseLine(line, parseFun = defaultParseFun2){
    let blockStrings = line.blockStrings;
    let res = {
        command: null,
        args: [],
    };
    if(blockStrings.length === 0){
        return res;
    }else{
        // parseFun 用于将命令与参数分开 默认是只取第一个为命令 其余为参数
        let { command, args } = parseFun(line);
        res.command = command;
        res.args = args;
        return res;
    }
}

/**
 * 运行命令
 * @param {Object} comObj - 需要 parseLine 解析后的对象
 * @param {TerminalData} data - 需要交互的数据
 * @param {Array} commandList - 命令列表 
 * @returns {TerminalData} - 运行命令后的数据
 */
export function run(comObj,data, commandList = defaultCommandList){
    let { command, args } = comObj;
    if(command === null || command === undefined){
        throw new Error("command is null or undefined");
    }
    let commandObj = commandList.find((item) => {
        return item.name === command;
    });
    console.log(commandObj);
    commandObj.func(...args);
    let res = commandObj.manipulate(data);
    return res;
}