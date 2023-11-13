# 初步了解 [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
<div class="colorbox" style="
    width: 20%;
    height: 30px;
    background-color: rgba(255, 123, 255, 0.3);
    margin-top: 10px;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
">
front-end
</div>

> - BT `UTC+8` 2023.11.8 19:38 --> ET `UTC+8` _ _ _ _ _ _

## MDN 的简单[示例](https://github.com/mdn/dom-examples/tree/main/web-workers/simple-web-worker)

### 文件夹结构
```bash
.
├── index.html
├── main.js
└── worker.js
```
### 关键代码片段
1. `main.js`:
    ```js
    const first = document.querySelector('#number1');
    const second = document.querySelector('#number2');

    const result = document.querySelector('.result');

    if (window.Worker) {
    const myWorker = new Worker("worker.js");

    [first, second].forEach(input => {
        input.onchange = function() {
        myWorker.postMessage([first.value, second.value]);
        console.log('Message posted to worker');
        }
    })

    myWorker.onmessage = function(e) {
        result.textContent = e.data;
        console.log('Message received from worker');
    }
    } else {
    console.log('Your browser doesn\'t support web workers.');
    }
    ```
2. `worker.js`:
    ```js
    onmessage = function(e) {
        console.log('Worker: Message received from main script');
        const result = e.data[0] * e.data[1];
        if (isNaN(result)) {
            postMessage('Please write two numbers');
        } else {
            const workerResult = 'Result: ' + result;
            console.log('Worker: Posting message back to main script');
            postMessage(workerResult);
        }
    }
    ```