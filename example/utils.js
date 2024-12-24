// Description: This file contains the common utility functions used in the application.

// Function to debounce the function call
export function debounce(fn, delay) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, arguments);
      }, delay);
    };
  }

// 过滤粘贴内容的函数，去除样式
export function sanitizePaste(content) {
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.innerText;
    return text;
}

/**
 * 向多个层同步滚动条(纵向) 
 * - 前提是这些层的高度和内容是一样的且存在滚动条
 * @param {HTMLElement} mainLayer 主控层
 * @param  {...HTMLElement} layers 需要同步的层
 * @example
 * syncScroll(mainLayer, layer1, layer2, layer3);
 */
export function syncScroll(mainLayer, ...layers) {
    if (!mainLayer || !(mainLayer instanceof HTMLElement)) {
        throw new Error("mainLayer must be a valid HTMLElement.");
    }

    const validLayers = layers.filter(layer => layer instanceof HTMLElement);

    // 监听主层滚动事件
    mainLayer.addEventListener('scroll', () => {
        const scrollTop = mainLayer.scrollTop;
        validLayers.forEach(layer => {
            if (layer.scrollTop !== scrollTop) {
                layer.scrollTop = scrollTop;
            }
        });
    });

    // // 监听其他层的滚动事件，反向同步主层
    // validLayers.forEach(layer => {
    //     layer.addEventListener('scroll', () => {
    //         const scrollTop = layer.scrollTop;
    //         if (mainLayer.scrollTop !== scrollTop) {
    //             mainLayer.scrollTop = scrollTop;
    //         }
    //         // 让其他层与当前层保持一致
    //         validLayers.forEach(otherLayer => {
    //             if (otherLayer !== layer && otherLayer.scrollTop !== scrollTop) {
    //                 otherLayer.scrollTop = scrollTop;
    //             }
    //         });
    //     });
    // });
}

export function pasteAsPlainText(element) {
    element.addEventListener('paste', (event) => {
        event.preventDefault();

        // 获取粘贴的纯文本
        const text = event.clipboardData.getData('text/plain');
        const sanitizedText = sanitizePaste(text);

        // 使用 execCommand 插入文本
        if (document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, sanitizedText);
        } else {
            // 如果不支持 execCommand，回退到更原始的插入方式
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(sanitizedText));
                range.collapse(false);
            }
        }

        // 触发 input 事件
        element.dispatchEvent(new Event('input'));
    });
}

// // 判断某个元素是否有焦点
// export function isElementFocused(element) {
//     return element === document.activeElement;
// }

// 在 contenteditable 元素中屏蔽原生 Tab 事件并插入指定数量的空格
export function handleTabKey(element, tabSize = 2) {
    if (!(element instanceof HTMLElement) || !element.isContentEditable) {
        throw new Error('The provided element must be a contenteditable HTMLElement.');
    }

    element.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();

            // 获取当前光标位置
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const tabSpaces = ' '.repeat(tabSize);

            // 插入空格
            const textNode = document.createTextNode(tabSpaces);
            range.deleteContents(); // 删除选区内容（如果有）
            range.insertNode(textNode);

            // 移动光标到插入空格后
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);

            // 手动触发 input 事件（如果需要监听）
            element.dispatchEvent(new Event('input'));
        }
    });
}



  