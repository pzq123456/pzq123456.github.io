import {markedHighlight} from './highlight.js'
import { fileToHtml } from './markdown.js';

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

export function initPage2(){
    document.body.onkeydown = function (event) { 
        // 禁止键盘事件 滚动页面
        var e = event;
        e.preventDefault();
    }
    marked = new marked.Marked(
        markedHighlight({
          langPrefix: 'hljs language-',
          highlight(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
          }
        })
    );
    const mdStyle = {
      // 'padding': '20px',
      'font-family': 'monospace',
      'font-size': '30px',
      // 'overflow': 'auto',
      // 'border-bottom': '1px solid white',
      // 'border-radius': '5px',
      // 'width': '80%',
      'color': 'white',
  }; // style for the markdown content
fileToHtml('/README.md',document.getElementById('content'), mdStyle);
}