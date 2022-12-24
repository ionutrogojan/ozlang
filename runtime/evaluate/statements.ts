import { Program, VariableDeclaration } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { RuntimeValue, MK_NULL } from "../values.ts";

export function evaluate_program (program: Program, env: Environment): RuntimeValue {
	let lastEvaluated: RuntimeValue = MK_NULL();

	for (const statement of program.body) { lastEvaluated = evaluate(statement, env) }

	return lastEvaluated;
}

export function evaluate_variable_declaration(declaration: VariableDeclaration, env: Environment): RuntimeValue {
    const value = declaration.value ? evaluate(declaration.value, env) : MK_NULL();
    return env.declareVariable(declaration.identifier, value, declaration.constant);
}