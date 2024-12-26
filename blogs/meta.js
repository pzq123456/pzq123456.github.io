export const metalist = [
    {
        "title" : "README",
        "path" : "/README.md",
        "date" : "2024-11-5",
        "tag" : "info",
        "command": "cd"
    },
    {
        "title" : "CV",
        "path" : "../CV/CV.md",
        "date" : "2023-12-29",
        "tag" : "info",
        "command": "cd"
    },
    {
        "title": "MLE",
        "path": "blogs/MLE.md",
        "date": "2023-12-14",
        "tag": "info",
        "command": "cd"
    },
    {
        "title" : "Blog0",
        "path" : "blogs/Blog0.md",
        "date" : "2023-10-14",
        "tag" : "info",
        "command": "cd"
    },
    {
        "title" : "Blog1",
        "path" : "blogs/Blog1.md",
        "date" : "2024-3-15",
        "tag" : "front-end",
        "command": "cd"
    },
    {
        "title" : "tips",
        "path" : "blogs/Blog2.md",
        "date" : "2024-4-29",
        "tag" : "info",
        "command": "cd"
    },
    {
        "title" : "Blog3",
        "path" : "blogs/Blog3.md",
        "date" : "2024-12-26",
        "tag" : "info",
        "command": "cd"
    },
]

const tag = [
    "info",
    "front-end",
    "back-end",
    "algorithm",
    "data-structure",
    "machine-learning",
    "math",
    "3d",
    "tmp",
    "*toy",
]

// 编写函数 将 metalist 中的所有值转化为不重复的字符串数组
export function metalist2str(){
    let set = new Set();
    metalist.forEach((obj) => {
        for(let key in obj){
            set.add(obj[key].toString());
        }
    })
    return Array.from(set);
}