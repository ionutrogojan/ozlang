//  Parsing list of available tokens
export enum TokenType {
	// LITERAL TYPES
	Null,
	Number,
	Identifier,
	// KEYWORDS
	Let,
	Const,
	// GROUPING * OPERATORS
	BinaryOperator,
	Equals, //		 -> =
	Comma, //		 -> ,
	Dot, //			 -> .
	Colon, //		 -> :
	Semicolon, //	 -> ;
	OpenParen, //	 -> (
	CloseParen, //	 -> )
	OpenBrace, //	 -> {
	CloseBrace, //	 -> }
	OpenBracket, //	 -> [
	CloseBracket, // -> ]
	EOF, // End of file
}

/** Constant lookup for keywords and known identifiers + symbols */
const KEYWORDS: Record<string, TokenType> = {
	let: TokenType.Let,
	const: TokenType.Const,
	// null: TokenType.Null,
}

// Represents a single token from the source-code
export interface Token {
	value: string,
	type: TokenType,
}

/** Return a token of a given type and value */
function MK_TOKEN (value: string, type: TokenType): Token { return { value, type } }

/** Returns wether the character passed is skippable [\s, \t, \n, \r] */
function IS_SKIPPABLE (value: string) {
	return value == " " || value == "\n" || value == "\t" || value == "\r";
}

/** Return wether the character passed is alphabetic [a-zA-Z] */
function IS_ALPHABETIC (value: string) {
	return value.toUpperCase() != value.toLowerCase();
}

/** Return wether the character passed is a valid integer [0-9] */
function IS_INTEGER (value: string) {
	const c = value.charCodeAt(0);
	const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
	return (c >= bounds[0] && c <= bounds[1]);
}

/**
 * Given a string representing source code: Produce tokens and handles possible undefined characters
 * - Returns an array of tokens
 * - Does not modify the incoming string
 */
export function tokenize (sourceCode: string): Token[] {
	const tokens = new Array<Token>();
	const src = sourceCode.split("");
	
	// Build each token until end of file
	while (src.length > 0) {
		switch (src[0]) {
			// Parse one character tokens
			case "(":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.OpenParen));
			break;
			case ")":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.CloseParen));
			break;
			case "{":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.OpenBrace));
			break;
			case "}":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.CloseBrace));
			break;
			case "[":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.OpenBracket));
			break;
			case "]":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.CloseBracket));
			break;
			// Parse binary operators
			case "+":
			case "-":
			case "*":
			case "/":
			case "%":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.BinaryOperator));
			break;
			// Parse conditional and assignment tokens
			case "=":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.Equals));
			break;
			case ";":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.Semicolon));
			break;
			case ":":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.Colon));
			break;
			case ",":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.Comma));
			break;
			case ".":
				tokens.push(MK_TOKEN(src.shift() as string, TokenType.Dot));
			break;
			default:
				// Handle multicharacter keywords, tokens, identifiers, etc...
				    
				// Build numberic literal
				if (IS_INTEGER(src[0])) {
					let num = "";
					while (src.length > 0 && IS_INTEGER(src[0])) { num += src.shift() }
					// append new numeric token
					tokens.push(MK_TOKEN(num, TokenType.Number));
				
				// Build identifier and keword tokens
				} else if (IS_ALPHABETIC(src[0])) {
					let ident = "";
					while (src.length > 0 && IS_ALPHABETIC(src[0])) { ident += src.shift() }
					// check for reserved keywords
					const reserved = KEYWORDS[ident];
					// if the value is not undefined, then the identifier is a recognized keyword
					if (typeof reserved == "number") { tokens.push(MK_TOKEN(ident, reserved)) }
					// unrecognized names are user defined symbols
					else { tokens.push(MK_TOKEN(ident, TokenType.Identifier)) }
				
				// Skip unneeded characters
				} else if (IS_SKIPPABLE(src[0])) {
					// skip the current character
					src.shift();
				// Handle unrecognized characters
				} else {
					console.log("Unrecognized character found in source: ", src[0].charCodeAt(0), src[0]);
					Deno.exit(1);
				}
			break;
		}
	}

	// End of file token
	tokens.push({ type: TokenType.EOF, value: "EndOfFile"})
	return tokens;
}