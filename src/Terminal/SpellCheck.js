function lev(a, b) {
    const m = a.length;
    const n = b.length;

    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(dp[i - 1][j] + 1,   // 删除a的一个字符
                                    dp[i][j - 1] + 1,   // 插入b的一个字符
                                    dp[i - 1][j - 1] + 1); // 替换a的一个字符
            }
        }
    }

    return dp[m][n];
}

export class BKTree {
    constructor(distanceFn = lev, tree = null) {
        this.distanceFn = distanceFn;
        this.tree = tree;
    }

    add(word) {
        if (this.tree === null) {
            this.tree = new Node(word);
        } else {
            this._addRecursive(this.tree, word);
        }
    }

    _addRecursive(node, word) {
        const distance = this.distanceFn(word, node.word);
        if (distance in node.children) {
            this._addRecursive(node.children[distance], word);
        } else {
            node.children[distance] = new Node(word);
        }
    }

    search(word, maxDistance) {
        if (this.tree === null) {
            return [];
        }
        return this._searchRecursive(this.tree, word, maxDistance);
    }

    _searchRecursive(node, word, maxDistance) {
        const distance = this.distanceFn(word, node.word);
        const results = [];
        if (distance <= maxDistance) {
            results.push(node.word);
        }
        for (let d = Math.max(0, distance - maxDistance); d <= distance + maxDistance; d++) {
            if (d in node.children) {
                results.push(...this._searchRecursive(node.children[d], word, maxDistance));
            }
        }
        return results;
    }

    toJSON() {
        return JSON.stringify(this.tree);
    }

    static fromJSON(json) {
        const tree = JSON.parse(json);
        return new BKTree(lev, tree);
    }

    static async fromURL(url) {
        const response = await fetch(url);
        const json = await response.text();
        let tree = this.fromJSON(json);
        return tree;
    }
}

class Node {
    constructor(word) {
        this.word = word;
        this.children = {};
    }
}

export function createBKTree(words) {
    const bktree = new BKTree(lev);
    for (const word of words) {
        bktree.add(word);
    }
    return bktree;
}


// 异步函数 只有当所有的单词都被添加到树中后，才会返回树
export async function createBKTreeFromURL(url) {
    const bktree = new BKTree(lev);
    const response = await fetch(url);
    const text = await response.text();
    const words = text.split('\n').map(word => word.trim()).filter(word => word.length > 0);
    for (const word of words) {
        bktree.add(word);
    }
    return bktree;
}

export function checkSpelling(word, bkTree, maxDistance = 1){
    // 更具查询的返回结果判断该单词是否拼写错误 若返回的结果为空则说明该单词拼写错误
    // boolean
    return bkTree.search(word, maxDistance).length > 0;
}

