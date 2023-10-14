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

    let btns = [];
    const btnStyle = {
        'font-size': '14px',
        'padding': '10px',
        'border': '1px solid #ddd',
        'background-color': '#0d1117',
        'margin': '5px',
        'border-radius': '5px',
        'cursor': 'pointer',
        'color': 'white',
    };
    list.forEach(item => {
        btns.push(createBtn(item.text, item.action, btnStyle));
    });



    element.appendChild(createBtnGroup(btns,
        {
            'width': '100%',
            'background-color': '#010409',
            'height': '100%',
            'display': 'flex',
            'flex-direction': 'row',
            'align-items': 'center',
            'border-bottom': '1px solid #8b949e',
        }
        ));

    if (style){
        element.setAttribute('style', parseStyle(style));
    }
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
    if(style){
        btnGroup.setAttribute('style', parseStyle(style));
    }
    
    btns.forEach(btn => {
        btnGroup.appendChild(btn);
    });
    return btnGroup;
}
