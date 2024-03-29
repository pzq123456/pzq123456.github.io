/**
 * 用于动态生成导航栏
 */
import { parseStyle } from './utils.js';
/**
 * fill a existing element with a nav bar
 * @param {HTMLElement} element 
 * @param {*} list 
 * @param {*} style 
 */
export function fillNavBar(
    element,
    list,
    style
) {
    let btns = [];
    const btnStyle = {
        'font-size': '14px',
        'padding': '10px',
        'border': '1px solid #ddd',
        'margin': '5px',
        'border-radius': '5px',
        'cursor': 'pointer',
        'transition': 'all 1s',
        'background-color': 'rgba(255, 255, 255, 0.5)',
        // 鼠标悬停样式
    };
    list.forEach(item => {
        btns.push(createBtn(item.text, item.action, btnStyle, item.info));
    });

    element.appendChild(createBtnGroup(btns,style));
}

/**
 * create a customized button
 * @param {string} text 
 * @param {function} action 
 * @param {object} style 
 * @returns 
 */
export function createBtn(
    text,
    action,
    style,
    info,
) {
    let btn = document.createElement('button');
    btn.innerHTML = text;
    if (style){
        btn.setAttribute('style', parseStyle(style));
    }
    btn.onclick = action;

    if(info){
        // 设置鼠标悬停提示
        btn.setAttribute('title', info);
    }

    return btn;
}

/**
 * create a group of buttons
 * @param {any[]} btns - array of buttons
 * @param {object} style - style of the button group
 * @returns 
 */
export function createBtnGroup(
    btns,
    style,
) {
    let btnGroup = document.createElement('div');
    if(style){
        btnGroup.setAttribute('style', parseStyle(style));
    }
    
    btns.forEach(btn => {
        btnGroup.appendChild(btn);
    });
    return btnGroup;
}