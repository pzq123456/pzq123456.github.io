import {markedHighlight} from './highlight.js'
export function initPage(){
    document.body.onkeydown = function (event) { 
        // 禁止键盘事件 滚动页面
        var e = event;
        e.preventDefault();
    }
    // config code highlight into the marked.js
    marked = new marked.Marked(
        markedHighlight({
          langPrefix: 'hljs language-',
          highlight(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            // console.log(language);
            return hljs.highlight(code, { language }).value;
          }
        })
    );
}

// 若