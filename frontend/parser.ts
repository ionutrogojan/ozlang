// deno-lint-ignore-file no-explicit-any
import { Statement, Program, Expression, BinaryExpression, NumericLiteral, NullLiteral, Identifier, VariableDeclaration, AssignmentExpression, Property, ObjectLiteral, CallExpression, MemberExpression } from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
	
	private tokens: Token[] = [];

	private not_eof(): boolean { return this.tokens[0].type != TokenType.EOF }

	private at() { return this.tokens[0] as Token }

	private eat() { return this.tokens.shift() as Token }

	private expect(type: TokenType, err: any) {
		const prev = this.tokens.shift() as Token;
		if (!prev || prev.type != type) {
			console.error("Parser Error:\n", err, prev, " - Expecting: ", type)
			Deno.exit(1);
		}

		return prev;
	}

	public produceAST (sourceCode: string): Program {
		this.tokens = tokenize(sourceCode);

		const program: Program = {
			kind: "Program",
			body: [],
		}

		// parse until end of file
		while (this.not_eof()) {
			program.body.push(this.parse_statement())
		}

		return program;
	}

	private parse_statement(): Statement {
		switch (this.at().type) {
			case TokenType.Let:
			case TokenType.Const:
				return this.parse_variable_declaration();
			default:
				return this.parse_expression();
		}
	}

	private parse_variable_declaration(): Statement {
		const isConstant = this.eat().type == TokenType.Const;
		const identifier = this.expect(TokenType.Identifier, "Expected identifier name following let | const keywords").value;

		if (this.at().type == TokenType.Semicolon) {
			this.eat(); //expect semicolon
			if (isConstant) throw "Must assigne value to constant expression. No value provided.";
			return { kind: "VariableDeclaration", identifier, constant: false } as VariableDeclaration;
		}

		this.expect(TokenType.Equals, "Expected equals token following identifier in variable declaration.");
		const declaration = {
			kind: "VariableDeclaration",
			value: this.parse_expression(),
			identifier,
			constant: isConstant
		} as VariableDeclaration;

		this.expect(TokenType.Semicolon, "Expected semicolon after variable declaration");

		return declaration;
	}

	private parse_expression(): Expression { return this.parse_assignment_expression() }

	private parse_assignment_expression(): Expression {
		const left = this.parse_object_expression();

		if (this.at().type == TokenType.Equals) {
			this.eat(); // advance past equals
			const value = this.parse_assignment_expression();
			return {
				value,
				assigne: left,
				kind: "AssignmentExpression",
			} as AssignmentExpression;
		}
		// else
		return left;
	}

	private parse_object_expression(): Expression {
		if (this.at().type !== TokenType.OpenBrace) { return this.parse_additive_expression() }
		// else
		this.eat(); // skip open brace
		const properties = new Array<Property>();

		while (this.not_eof() && this.at().type != TokenType.CloseBrace) {
			const key = this.expect(TokenType.Identifier, "Object literal key expected, found none").value;
			
			// Allows shorthand key: pair -> key,
			if (this.at().type == TokenType.Comma) {
				this.eat(); // advance past comma
				properties.push({ key, kind: "Property" } as Property);
				continue;
			} else if (this.at().type == TokenType.CloseBrace) {
				properties.push({ key, kind: "Property" });
				continue;
			}
			this.expect(TokenType.Colon, "Expected colon in key: value expression. Invalid key: value pair.");
			const value = this.parse_expression();

			properties.push({ kind: "Property", value, key });

			if (this.at().type != TokenType.CloseBrace) {
				this.expect(TokenType.Comma, "Missing comma or closing brace following property in object array.");
			}
		}

		this.expect(TokenType.CloseBrace, "Expected closing brace on object literal, found none.");
		return { kind: "ObjectLiteral", properties } as ObjectLiteral;
	}

	private parse_additive_expression(): Expression {
		let left = this.parse_multiplicative_expression();

		while (this.at().value == "+" || this.at().value == "-") {
			const operator = this.eat().value;
			const right = this.parse_multiplicative_expression();
			left = {
				kind: "BinaryExpression",
				left,
				right,
				operator,
			} as BinaryExpression;
		}

		return left;
	}

	private parse_multiplicative_expression(): Expression {
		let left = this.parse_call_member_expression();

		while (this.at().value == "*" || this.at().value == "/") {
			const operator = this.eat().value;
			const right = this.parse_call_member_expression();
			left = {
				kind: "BinaryExpression",
				left,
				right,
				operator,
			} as BinaryExpression;
		}

		return left;
	}

	private parse_call_member_expression(): Expression {
		const member = this.parse_member_expression();
		// call expression if we find open paren
		if (this.at().type == TokenType.OpenParen) { return this.parse_call_expression(member) }
		// else
		return member;
	}

	private parse_call_expression(caller: Expression): Expression {
		let call_expression: Expression = {
			kind: "CallExpression",
			caller,
			args: this.parse_args(),
		} as CallExpression;

		if (this.at().type == TokenType.OpenParen) { call_expression = this.parse_call_expression(call_expression) }

		return call_expression;
	}

	private parse_args(): Expression[] {
		this.expect(TokenType.OpenParen, "Expected open parenthesis");
		
		const args = this.at().type == TokenType.CloseParen ? [] : this.parse_args_list();
		
		this.expect(TokenType.CloseParen, "Expected closing parenthesis inside arguments list");
		
		return args;
	}

	private parse_args_list(): Expression[] {
		const args = [this.parse_expression()];

		while (this.at().type == TokenType.Comma && this.eat()) { args.push(this.parse_assignment_expression()) }

		return args;
	}

	private parse_member_expression(): Expression {
		let object = this.parse_primary_expression();

		while (this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket) {
			const operator = this.eat();
			let property: Expression;
			let computed: boolean;

			// handle non-computed values object.expressions
			if (operator.type == TokenType.Dot) {
				computed = false;
				property = this.parse_primary_expression();

				if (property.kind != "Identifier") throw `Cannot use dot operator outside identifiers`;
			} else {
				computed = true;
				property = this.parse_expression();
				this.expect(TokenType.CloseBracket, "Missing closing bracket in computed value.");
			}

			object = {
				kind: "MemberExpression",
				object,
				property,
				computed,
			} as MemberExpression;
		}
		return object;
	}

	// Parse Literal values & Grouping Expressions
	private parse_primary_expression(): Expression {
		const tk = this.at().type;

		// Determine which token we are currently at and return literal value
		switch (tk) {
			// User defined values
			case TokenType.Identifier:
				return { kind: "Identifier", symbol: this.eat().value } as Identifier;
			
			// Null keyword
			case TokenType.Null:
				this.eat(); // advance past null keyword
				return { kind: "NullLiteral", value: "null" } as NullLiteral;

			// Constants & Numeric Constants
			case TokenType.Number:
				return { kind: "NumericLiteral", value: parseFloat(this.eat().value) } as NumericLiteral;

			// Grouping Expressions
			case TokenType.OpenParen: {
				this.eat(); // eat the opening paren
				const value = this.parse_expression();
				this.expect(TokenType.CloseParen, "Unexpected token found inside parenthesised expression. Expected closing parenthesis."); // eat the closing paren
				return value;
			}
			default:
				console.error("Unexpected token found during parsing!", this.at());
				Deno.exit(1);
		}
	}
}

	/*
	-- Order of Prescidence --
	
	AssignmentExpression *
	MemberExpression *
	FunctionCall *
	LogicalExpression
	ComparisonExpression
	AdditiveExpression *
	MultiplicativeExpression *
	UnaryExpression
	PrimaryExpression *
	
	*/