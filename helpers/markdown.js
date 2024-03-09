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
    openLoadingBar(); 
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
        closeLoadingBar();
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    });
}

/**
 * Render Markdown string to HTML
 * @param {*} string 
 * @param {*} element 
 * @param {*} style 
 */
export function stringToHtml(string, element, style) {
    // if no elementId, create one
    if (!element) {
        throw new Error('element is required');
    }
    // handle success
    element.innerHTML =
    marked.parse(string);
    // add style
    if (style) {
        element.setAttribute('style',parseStyle(style));
    }
}




/**
 * 获取文件内容
 * @param {*} filepath 
 * @param {*} callBack 
 */
export function manipulateFile(filepath,callBack){
    axios.get(filepath)
    .then(function (response) {
        // handle success
        callBack(response.data);
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    });
}

function closeLoadingBar(){
    document.getElementById("loading-bar").style.display = "none";
}

function openLoadingBar(){
    document.getElementById("loading-bar").style.display = "block";
}