# 从 0 开始的基于 Canvas 标签的（简易）命令行窗口（Part 2）
> 任务：详见 Terminal2 文件夹
> - 重写渲染器实现鼠标交互与部分渲染
> - 实现 Shell 的抽象语法树及语法分析器
> - 创新： 使用拓展的 Shell 命令让用户自定义布局博客页面
> - 后端计划： 编写 Node 端脚本自动化打包部署（依旧是静态页面，使用 Node 自动处理博客内容，主要是自动抽取标题）
> - 会将所有代码以更加紧凑优雅的形式发布在开源社区

## 重写渲染器实现鼠标交互与部分渲染

## 智能补全与前缀树
A trie, also known as a prefix tree, is a data structure used to store associative arrays. It is a tree in which each node contains a key-value pair, and the values of the nodes are stored in the leaves of the tree. Tries are often used to store strings, as they allow for efficient lookup of strings by prefix.

The following is an example of a trie that stores the strings "apple", "banana", and "cherry":

```
                    root
                   / \
                  a   b
                 / \  / \
               p   p n   c
              / \  / \
             l   e r   r
            / \
           e   y
```

To find the string "apple" in this trie, we would start at the root node and follow the links for the letters "a", "p", and "p". This would take us to the leaf node that contains the value "apple".

Tries are a very efficient data structure for storing strings, as they allow for O(m) lookup of strings by prefix, where m is the length of the string. This is in contrast to other data structures such as hash tables, which have O(n) lookup time, where n is the number of elements in the hash table.

Tries are also very memory-efficient, as they only store the values of the leaves of the tree. This is in contrast to other data structures such as binary trees, which store the values of all of the nodes in the tree.

Tries are a powerful data structure that can be used to solve a variety of problems. They are particularly well-suited for problems that involve storing and searching for strings.


## References
- [Generating a parse tree from a shell grammar](https://dev.to/oyagci/generating-a-parse-tree-from-a-shell-grammar-f1)
- [POSIX.1-2017](https://pubs.opengroup.org/onlinepubs/9699919799/): POSIX.1-2017 is simultaneously IEEE Std 1003.1™-2017 and The Open Group Technical Standard Base Specifications, Issue 7.POSIX.1-2017 defines a standard operating system interface and environment, including a command interpreter (or “shell”), and common utility programs to support applications portability at the source code level. 
- [GNU Bash](https://www.gnu.org/software/bash/): Bash is the GNU Project's shell—the Bourne Again SHell. This is an sh-compatible shell that incorporates useful features from the Korn shell (ksh) and the C shell (csh). It is intended to conform to the IEEE POSIX P1003.2/ISO 9945.2 Shell and Tools standard. It offers functional improvements over sh for both programming and interactive use. In addition, most sh scripts can be run by Bash without modification.
- [BNF](https://en.wikipedia.org/wiki/Backus–Naur_form): Backus–Naur form
- [syntax](https://github.com/dmitrysoshnikov/syntax): Syntactic analysis toolkit, language-agnostic parser generator.Implements LR and LL parsing algorithms.
- [Syntax: language agnostic parser generator](https://dmitrysoshnikov.medium.com/syntax-language-agnostic-parser-generator-bd24468d7cfc)