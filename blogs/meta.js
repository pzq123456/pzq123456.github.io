export const metalist = [
    {
        "title" : "README",
        "path" : "/README.md",
        "date" : "2023-10-6",
        "tag" : "info",
        "command": "cd"
    },
    {
        "title": "MLE",
        "path": "/blogs/MLE.md",
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
        "date" : "2023-10-15",
        "tag" : "front-end",
        "command": "cd"
    },
    {
        "title" : "Blog2",
        "path" : "blogs/Blog2.md",
        "date" : "2023-10-23",
        "tag" : "info",
        "command": "cd"
    },
    {
        "title" : "Blog3",
        "path" : "blogs/Blog3.md",
        "date" : "2023-10-23",
        "tag" : "front-end",
        "command": "cd"
    },
    {
        "title" : "Blog4",
        "path" : "blogs/Blog4.md",
        "date" : "2023-10-24",
        "tag" : "front-end",
        "command": "cd"
    },
    {
        "title" : "Blog5",
        "path" : "blogs/Blog5.md",
        "date" : "2023-12-8",
        "tag" : "info",
        "command": "cd"
    },
    {
        "title" : "tmp0",
        "path" : "blogs/tmp0.md",
        "date" : "2023-10-26",
        "tag" : "tmp",
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
// 例如 [ 
//     {"title": "README", "path": "/README.md", "date": "2023-10-6", "tag": "info", "command": "cd" },]
// 转化为 [ "README", "/README.md", "2023-10-6", "info", "cd" ]

// 1. 遍历 metalist
// 2. 对于每一个对象
// 3. 遍历对象的所有属性
// 4. 将属性值转化为字符串
// 5. 将字符串存入 set 中
// 6. 将 set 转化为数组

export function metalist2str(){
    let set = new Set();
    metalist.forEach((obj) => {
        for(let key in obj){
            set.add(obj[key].toString());
        }
    })
    return Array.from(set);
}

