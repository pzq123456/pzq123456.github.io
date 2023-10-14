// using marked.js to convert markdown to html
// fetch the md file using axios

/**
 * Generate UUID
 * @returns - UUID
 */
function UUID() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * 将style转换为html的style
 * @param {*} style - JSON
 * @returns - html style
 */
function parseStyle(style) {
    let styleStr = '';
    for (let key in style) {
        styleStr += `${key}:${style[key]};`;
    }
    return styleStr;
}

/**
 * Render Markdown file to HTML
 * @param {*} filePath 
 * @param {*} elementId 
 * @param {JSON} style - optional
 */
export function fileToHtml(filePath, element, style) {      
    axios.get(filePath)
    .then(function (response) {
        // if no elementId, create one
        if (!element) {
            throw new Error('element is required');
        }
        // handle success
        element.innerHTML =
        marked.parse(response.data);
        // add style
        if (style) {
            element.setAttribute('style',parseStyle(style));
        }
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    });

}

