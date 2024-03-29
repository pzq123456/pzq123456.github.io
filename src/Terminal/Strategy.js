import {env,Base64Decoder} from './enp.js';
// command strstegy 用于解析并执行命令
export function run(comObj,terminal,callBackList){
    // 判断命令是否存在
    if(callBackList[comObj.command]){
        callBackList[comObj.command].callBack(comObj,terminal);
    }else{
        terminal.writeHistory("command not found: " + terminal._history[terminal._history.length - 1]);
    }
}

/**
 * chat 模式用于调用人工智能聊天接口
 */
export function chat(terminal,input){
    let key = Base64Decoder(env['PALM_API_KEY']); // 从环境变量中获取 API KEY
    let url = 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=' + key;
    let data = {
        "prompt": {
            "text": input
        }
    }
    openLoadingBar();
    // 发送请求
    fetch(url,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    .then(res => {
        res.json().then(data => {
            if(data.candidates == undefined || data.candidates.length == 0){
                terminal.writeHistory("-Response: " + "Sorry, I don't know what you are talking about.(api response error)");
            }else{
                let res = data.candidates[0].output;
                terminal.writeHistory("-Response: " + res);
            }
            closeLoadingBar();
        })
    })
    .catch(err => {
        console.log(err);
    })
}

function closeLoadingBar(){
    document.getElementById("loading-bar").style.display = "none";
}

function openLoadingBar(){
    document.getElementById("loading-bar").style.display = "block";
}