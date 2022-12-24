import { RuntimeValue, MK_NULL, MK_NUMBER } from "./values.ts";
import { AssignmentExpression, BinaryExpression, Identifier, NumericLiteral, ObjectLiteral, Program, Statement, VariableDeclaration } from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { evaluate_identifier, evaluate_binary_expression, evaluate_assignment, evaluate_object_expression } from "./evaluate/expressions.ts";
import { evaluate_program, evaluate_variable_declaration } from "./evaluate/statements.ts";

export function evaluate (astNode: Statement, env: Environment): RuntimeValue {
	
	switch (astNode.kind) {
		// numeric value
		case "NumericLiteral":
            return MK_NUMBER((astNode as NumericLiteral).value);
		// null value
		case "NullLiteral":
			return MK_NULL();
		// identifier
        case "Identifier":
			return evaluate_identifier(astNode as Identifier, env);
        // object expression
        case "ObjectLiteral":
            return evaluate_object_expression(astNode as ObjectLiteral, env);
        // variable assignment
        case "AssignmentExpression":
            return evaluate_assignment(astNode as AssignmentExpression, env);
		// binary expression
		case "BinaryExpression":
			return evaluate_binary_expression(astNode as BinaryExpression, env);
		// program
		case "Program":
			return evaluate_program(astNode as Program, env);
		// statement
		case "VariableDeclaration":
			return evaluate_variable_declaration(astNode as VariableDeclaration, env);
		// unrecognized values
		default:
			console.error("AST Node not yet setup for interpretation.", astNode);
			Deno.exit(0);
	}
}
