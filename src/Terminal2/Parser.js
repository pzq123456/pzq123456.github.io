class Parser{
    /**
     * parsing a string to a AST(Abstract Syntax Tree)
     */
    parse(string){
        this._string = string; // the string to parse

        // parse recursively starting from the main entry point
        return this.program();
    }

    /**
     * main entry point
     * 
     * program -> statement*
     * 
     */
    program(){

    }

    /**
     * statement -> expression | declaration
     */
    statement(){

    }
    
}

/**
 * Tokenizer
 */
class Tokenizer{
    /**
     * 
     * @param {string} string 
     */
    constructor(string){
        this._string = string;
    }
}