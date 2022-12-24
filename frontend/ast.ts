// deno-lint-ignore-file no-empty-interface
export type NodeType = 
	// STATEMENTS
	| "Program"
	| "VariableDeclaration"
	// EXPRESSIONS
	| "AssignmentExpression"
    | "MemberExpression"
    | "CallExpression"
	// LITERAL
	| "Property"
	| "ObjectLiteral"
	| "NumericLiteral"
	| "NullLiteral"
	| "Identifier"
	| "BinaryExpression";

export interface Statement {
	kind: NodeType,
}

export interface Program extends Statement {
	kind: "Program",
	body: Statement[],
}

export interface VariableDeclaration extends Statement {
	kind: "VariableDeclaration",
	constant: boolean,
	identifier: string,
	value?: Expression,
}

export interface Expression extends Statement { }

export interface AssignmentExpression extends Expression {
	kind: "AssignmentExpression",
	assigne: Expression,
	value: Expression,
}

export interface MemberExpression extends Expression {
	kind: "MemberExpression",
	object: Expression,
	property: Expression,
	computed: boolean,
}

export interface CallExpression extends Expression {
	kind: "CallExpression",
	args: Expression[],
	caller: Expression,
}

export interface Property extends Expression {
	kind: "Property",
	key: string,
	value?: Expression,
}

export interface ObjectLiteral extends Expression {
	kind: "ObjectLiteral",
	properties: Property[],
}

export interface NumericLiteral extends Expression {
	kind: "NumericLiteral",
	value: number,
}

export interface NullLiteral extends Expression {
	kind: "NullLiteral",
	value: "null",
}

export interface Identifier extends Expression {
	kind: "Identifier",
	symbol: string,
}

export interface BinaryExpression extends Expression {
	kind: "BinaryExpression",
	left: Expression,
	right: Expression,
	operator: string,
}