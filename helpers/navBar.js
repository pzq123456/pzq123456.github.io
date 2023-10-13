/**
 * 用于动态生成导航栏
 */
import { parseStyle } from './utils.js';
/**
 * fill a existing element with a nav bar
 * @param {HTMLElement} elementId 
 * @param {*} list 
 * @param {*} style 
 */
export function fillNavBar(
    element,
    list,
    style
) {
    /**
     * list = [
     * {
     *      text: 'text',
     *      action: function(){},
     *      style: {...}
     * }
     * ...
     * ]
     */


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
) {
    let btn = document.createElement('button');
    btn.innerHTML = text;
    if (style){
        btn.setAttribute('style', parseStyle(style));
    }
    btn.onclick = action;
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
    btnGroup.setAttribute('style', parseStyle(style));
    btns.forEach(btn => {
        btnGroup.appendChild(btn);
    });
    return btnGroup;
}
