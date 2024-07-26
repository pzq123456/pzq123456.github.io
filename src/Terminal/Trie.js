class TrieNode{
    // TrieNode constructor
    constructor(){
        // Map of children
        this.children = new Map(); // Key: character, Value: TrieNode
        // Is it the end of the word?
        this.endOfWorld = false;
    }
}

export class Trie{
    /**
     * Trie constructor
     */
    constructor(){
        this.root = new TrieNode(); // Root node
    }


    // Insert word into Trie
    insert(word){
        let node = this.root;
        for(let i = 0; i < word.length; i++){
            // If the character is not in the map, add it
            if(!node.children.has(word[i])){
                node.children.set(word[i], new TrieNode());
            }
            // Move to the next node
            node = node.children.get(word[i]);
        }
        // Mark the end of the word
        node.endOfWorld = true;
    }

    insertArray(array){
        for(let i = 0; i < array.length; i++){
            this.insert(array[i]);
        }
    }

    insertText(text){
        this.insertArray(this.extractUniqueWords(text));
    }

    // Search for a word in the Trie
    search(word){
        let node = this.root;
        for(let i = 0; i < word.length; i++){
            // If the character is not in the map, return false
            if(!node.children.has(word[i])){
                return false;
            }
            // Move to the next node
            node = node.children.get(word[i]);
        }
        // Return true if the word is in the Trie
        return node.endOfWorld;
    }

    // Check if a word is a prefix
    startsWith(prefix){
        let node = this.root;
        for(let i = 0; i < prefix.length; i++){
            // If the character is not in the map, return false
            if(!node.children.has(prefix[i])){
                return false;
            }
            // Move to the next node
            node = node.children.get(prefix[i]);
        }
        // Return true if the prefix is in the Trie
        return true;
    }

    // Delete a word from the Trie
    delete(word){
        // If the word is not in the Trie, return
        if(!this.search(word)){
            return;
        }
        let node = this.root;
        for(let i = 0; i < word.length; i++){
            // Move to the next node
            node = node.children.get(word[i]);
        }
        // Mark the end of the word
        node.endOfWorld = false;
    }

    /**
     * 动态输入提示：从当前前缀开始继续向后访问，直到遇到词尾，将所有字母输出
     * @param {string} prefix
     * @return {string[]}
     */
    autoComplete(prefix){
        if(prefix == null || prefix.length == 0){
            return [];
        }
        let node = this.root;
        let word = "";
        for(let i = 0; i < prefix.length; i++){
            // If the character is not in the map, return false
            if(!node.children.has(prefix[i])){
                return [];
            }
            // Move to the next node
            node = node.children.get(prefix[i]);
        }
        // Recursively call the autoCompleteHelper function
        return this.autoCompleteHelper(node, word);
    }

    // autoComplete helper function
    autoCompleteHelper(node, word){
        let result = [];
        // If the node is null, return
        if(node == null){
            return result;
        }
        // If the end of the word is reached, push the word into the result array
        if(node.endOfWorld){
            result.push(word);
        }
        // Iterate through the children
        for(let [key, value] of node.children){
            // Recursively call the autoCompleteHelper function
            result = result.concat(this.autoCompleteHelper(value, word + key));
        }
        return result;
    }

    // Print the Trie
    print(){
        let node = this.root;
        let word = "";
        this.printHelper(node, word);
    }

    // Print helper function
    printHelper(node, word){
        // If the node is null, return
        if(node == null){
            return;
        }
        // If the end of the word is reached, print the word
        if(node.endOfWorld){
            console.log(word);
        }
        // Iterate through the children
        for(let [key, value] of node.children){
            // Recursively call the printHelper function
            this.printHelper(value, word + key);
        }
    }

    /**
     * 从数组构建Trie
     * @param {*} array - ex. ['apple', 'app', 'application', 'orange', 'banana', 'cat']
     * @returns {Trie}
     */
    static from(array){ // from ['apple', 'app', 'application', 'orange', 'banana', 'cat']
        let trie = new Trie();
        for(let i = 0; i < array.length; i++){
            trie.insert(array[i]);
        }
        return trie;
    }

    /**
     * 分词：从(多行)文本中提取唯一单词列表
     * @example
     * ```js
     *  extractUniqueWords('Hi! My name is John. I am a software engineer.');
     * // ['hi', 'my', 'name', 'is', 'john', 'i', 'am', 'a', 'software', 'engineer']
     *  extractUniqueWords('Hi! My name is John. I am a software engineer.',2); // minLength = 2
     * // ['name', 'john', 'software', 'engineer']
     * ```
     * @param {string} text 
     * @param {number} minLength - 去除小于等于 minLength 的单词
     * @returns 
     */
    extractUniqueWords(text, minLength = 1) {
        // text 为字符串 将其转换为数组
        text = text.split('\n');
        const wordSet = new Set();
        const punctuation = /[.,:;!?()'"-]/g;

        // 剔除小于等于 minLength 的单词
        text.forEach(item => {
            let words = item.split(/\s+/);  // 按空格分割，支持多个空格
            words.forEach(word => {
                let cleanWord = word.replace(punctuation, '');  // 去除标点符号
                if (cleanWord && cleanWord.length > minLength) {
                    wordSet.add(cleanWord.toLowerCase());  // 转换为小写并添加到Set中
                }
            });
        });
    
        return Array.from(wordSet);
    }
}

// // test code
// let trie = new Trie();
// trie.insert("apple");
// trie.insert("app");
// trie.insert("application");
// trie.insert("orange");
// trie.insert("banana");
// trie.insert("cat");

// // test autoComplete
// console.log("AutoComplete: ");
// // trie.autoComplete("ap");
// console.log(trie.autoComplete("ap"));
// console.log(trie.autoComplete("w"));

