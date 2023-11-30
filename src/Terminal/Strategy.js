// command strstegy 用于解析并执行命令
export function run(comObj,terminal,callBackList){
    // 判断命令是否存在
    if(callBackList[comObj.command]){
        callBackList[comObj.command].callBack(comObj,terminal);
    }else{
        terminal.writeHistory("command not found: " + terminal._history[terminal._history.length - 1]);
    }
}