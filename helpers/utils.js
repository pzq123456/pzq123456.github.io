/**
 * 将style转换为html的style
 * @param {*} style - JSON
 * @returns - html style
 */
export function parseStyle(style) {
    let styleStr = '';
    for (let key in style) {
        styleStr += `${key}:${style[key]};`;
    }
    return styleStr;
}