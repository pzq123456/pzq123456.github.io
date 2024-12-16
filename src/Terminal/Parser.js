import { Trie } from "./Trie.js";
import { BKTree, checkSpelling } from "./SpellCheck.js";

const commands = ['cd', 'ls', 'echo', 'clear', 'help', 'chat', 'exit', 'style', 'about', 'mdr', 'cm', 'cache', 'load', 'nav'];
let bktree;
const spellCache = new Map();

// 初始化命令前缀树
function injectCommands() {
    const trie = new Trie();
    commands.forEach(command => trie.insert(command));
    return trie;
}

export const commandTrie = injectCommands();

// 加载拼写检查树
function loadBKTree() {
    const storedBKTree = localStorage.getItem('bktree');
    if (storedBKTree) {
        bktree = BKTree.fromJSON(storedBKTree);
    } else {
        fetch('/bktree.json')
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('bktree', JSON.stringify(data));
                bktree = BKTree.fromJSON(data);
            });
    }
}

// 加载拼写检查树
loadBKTree();

// Token化输入行
export function tokenization(line) {
    const tokens = splitWords(line);
    return tokens.map(token => classifyToken(token));
}

// 根据token的类型返回样式
export function tokenStyle(token) {
    const styles = {
        command: { color: '#ebbbff' },
        option: { color: '#ffc58f' },
        path: { color: '#bbdaff', dash: 'underline' },
        argument: { color: 'rgba(255,255,255,0.8)' },
        warning: { color: '#ff9da4', dash: 'wavyline' }
    };
    return styles[token.type] || {};
}

// Markdown Token化
export function mdTokenization(line) {
    const tokens = line.split(' ');
    let hasEscape = false;

    return tokens.map(token => {
        if (token.startsWith('//')) {
            hasEscape = true;
            return { type: 'escape', value: token };
        } else if (!hasEscape) {
            return classifyMarkdownToken(token);
        }
        return { type: 'text', value: token };
    });
}

// Markdown Token样式
export function mdTokenStyle(token) {
    const styles = {
        title: { color: '#ebbbff' },
        link: { color: '#bbdaff' },
        list: { color: '#99ffff' },
        quote: { color: '#ff9da4' },
        code: { color: '#d1f1a9' },
        hr: { color: '#ffeead' },
        text: { color: 'rgba(255,255,255,0.8)' },
        escape: { color: '#bbdaff' }
    };
    return styles[token.type] || {};
}

// 解析 token 用于后续执行命令
export function Parser(tokens) {
    const result = {
        command: '',
        options: [],
        path: '',
        arguments: [],
        others: ''
    };

    if (tokens[0]?.value === 'mdr' || tokens[0]?.value === 'echo') {
        result.command = tokens[0].value;
        result.others = parseOthers(tokens);
        return result;
    }

    tokens.forEach(token => {
        switch (token.type) {
            case 'command':
                result.command = token.value;
                break;
            case 'option':
                result.options.push(token.value);
                break;
            case 'path':
                result.path = token.value;
                break;
            case 'argument':
                result.arguments.push(token.value);
                break;
        }
    });

    return result;
}

// 辅助函数：解析mdr或echo命令后的参数
function parseOthers(tokens) {
    if (tokens[1]?.value === '-Response:') {
        return tokens.slice(2).map(token => token.value).join(' ');
    }
    return tokens.slice(1).map(token => token.value).join(' ');
}

// 辅助函数：分类token
function classifyToken(token) {
    if (commands.includes(token)) {
        return { type: 'command', value: token };
    }
    if (token.includes('/')) {
        return { type: 'path', value: token };
    }
    if (token.startsWith('-')) {
        return { type: 'option', value: token };
    }
    if (token.startsWith('!')) {
        return { type: 'warning', value: token };
    }

    return handleArgumentToken(token);
}

// 辅助函数：处理argument类型的token
function handleArgumentToken(token) {
    if (bktree && /^[A-Za-z]+$/.test(token)) {
        const cacheResult = spellCache.get(token);
        if (cacheResult !== undefined) {
            return { type: cacheResult ? 'argument' : 'warning', value: token };
        }

        const result = checkSpelling(token, bktree);
        spellCache.set(token, result);
        return { type: result ? 'argument' : 'warning', value: token };
    }

    return { type: 'argument', value: token };
}

// 辅助函数：分类Markdown token
function classifyMarkdownToken(token) {
    if (token.includes('#')) {
        return { type: 'title', value: token };
    } else if (token.includes('[') || token.includes(']') || token.includes('(') || token.includes(')')) {
        return { type: 'link', value: token };
    } else if (token.startsWith('---')) {
        return { type: 'hr', value: token };
    } else if (token.startsWith('>')) {
        return { type: 'quote', value: token };
    } else if (token.startsWith("```")) {
        return { type: 'code', value: token };
    }
    return { type: 'text', value: token };
}

// 根据空格分词
export function splitWords(line) {
    return line.trim().split(/\s+/);
}
