// let img = new Image();
// img.src = '/me.png';
// img.onload = function(){
//     // convert the image into array of pixels
//     let canvas = document.createElement('canvas');
//     canvas.width = img.width;
//     canvas.height = img.height;
//     let ctx = canvas.getContext('2d');
//     ctx.drawImage(img,0,0);
//     let pixels = ctx.getImageData(0,0,img.width,img.height).data;
//     // Uint8ClampedArray 描述了一个一维数组，包含以 RGBA 顺序的数据，数据使用 0 至 255（包含）的整数表示。
//     // console.log(pixels);
//     let grayArray = getGrayArray(pixels,img.width,img.height);
//     console.log(grayArray);
// }

// get image from URL
function getImgFromURL(
    url = '',
){
    let img = new Image();
    img.src = url;
    return img;
}

// convert the image into array of pixels
function getPixels(
    img,
){
    // promise
    return new Promise((resolve,reject)=>{
        img.onload = function(){
            let canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0);
            let pixels = ctx.getImageData(0,0,img.width,img.height).data;
            resolve(pixels);
        }
    })
}

// 函数：接受 RGBA 四个通道的值，返回灰度值
function RGBA2Gray(
    r = 0,
    g = 0,
    b = 0,
    a = 255,
){
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

// 函数：接受 Uint8ClampedArray 一维数组，及图像的宽高，返回灰度图像的二维数组
function getGrayArray(
    pixels = [],
    width = 0,
    height = 0,
){
    let grayArray = [];
    for (let i = 0; i < height; i++){
        let row = [];
        for (let j = 0; j < width; j++){
            let index = (i * width + j) * 4;
            let gray = RGBA2Gray(pixels[index],pixels[index+1],pixels[index+2],pixels[index+3]);
            row.push(gray);
        }
        grayArray.push(row);
    }
    return grayArray;
}


function averageSample(
    grayArray = [],
    targetWidth = 1,
    targetHeight = 1,
){
// 将原图像的每个像素点映射到目标图像的每个像素点 平均采样
    let sampleArray = [];
    let height = grayArray.length;
    let width = grayArray[0].length;
    for (let i = 0; i < targetHeight; i++){
        let row = [];
        for (let j = 0; j < targetWidth; j++){
            let x = Math.floor(i * height / targetHeight);
            let y = Math.floor(j * width / targetWidth);
            row.push(grayArray[x][y]);
        }
        sampleArray.push(row);
    }
    return sampleArray;
}


export function getASCIIArt(
    url = '',
    targetWidth = 1,
    targetHeight = 1,
    invert = false,
    charSet = ['@','#','$','%','&','?','*','o','/','{','[','(','|','!','^','~','-','_',':',';',',','.','`',' '],
){
    if(!url){
        console.log('URL 为空');
        return '';
    }
    if(!targetWidth || !targetHeight || targetWidth < 1 || targetHeight < 1){
        console.log('目标尺寸不合法');
        return '';
    }
    if(!charSet || !charSet.length){
        console.log('字符集为空');
        return '';
    }
    let img = getImgFromURL(url);
    // get the promise of pixels
    let pixels = getPixels(img);
    // get the promise of grayArray
    let grayArray = pixels.then((pixels)=>{
        // console.log(pixels);
        return getGrayArray(pixels,img.width,img.height);
    })
    // get the promise of sampleArray
    let sampleArray = grayArray.then((grayArray)=>{
        // console.log(grayArray);
        return averageSample(grayArray,targetWidth,targetHeight);
    })
    // get the promise of asciiArt
    let asciiArt = sampleArray.then((sampleArray)=>{
        // console.log(sampleArray);
        let asciiArt = '';
        for (let i = 0; i < targetHeight; i++){
            for (let j = 0; j < targetWidth; j++){
                let gray = sampleArray[i][j];
                if(invert){
                    gray = Math.floor(255 - gray);
                    if(gray === 255){
                        gray = 254;
                    }
                }
                let index = Math.floor(gray / 255 * charSet.length);
                asciiArt += charSet[index];
            }
            asciiArt += '\n';
        }
        return asciiArt;
    })
    return asciiArt;
}