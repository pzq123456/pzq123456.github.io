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
}