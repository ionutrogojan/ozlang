import { AssignmentExpression, BinaryExpression, Identifier, ObjectLiteral } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { NumberValue, RuntimeValue, MK_NULL, ObjectValue } from "../values.ts";

function evaluate_numeric_binary_expression(left: NumberValue, right: NumberValue, operator: string): NumberValue {
	let result = 0;
	switch (operator) {
		case "+":
			result = left.value + right.value;
			break;
		case "-":
			result = left.value - right.value;
			break;
		case "*":
			result = left.value * right.value;
			break;
		case "/":
			result = left.value / right.value;
			break;
	}
	return { value: result, type: "number" }
}

export function evaluate_binary_expression (binop: BinaryExpression, env: Environment): RuntimeValue {
	const leftSide = evaluate(binop.left, env);
	const rightSide = evaluate(binop.right, env);

	if (leftSide.type == "number" && rightSide.type == "number") {
		return evaluate_numeric_binary_expression(leftSide as NumberValue, rightSide as NumberValue, binop.operator);
	}

	return MK_NULL();
}

export function evaluate_identifier (identity: Identifier, env: Environment): RuntimeValue {
	const value = env.lookupVariable(identity.symbol);
	return value;
}

export function evaluate_assignment (node: AssignmentExpression, env: Environment): RuntimeValue {
    if (node.assigne.kind !== "Identifier") throw `Cannot assign expression ${JSON.stringify(node.assigne)}. Invalid left hand side`;

    const var_name = (node.assigne as Identifier).symbol;
    return env.assignVariable(var_name, evaluate(node.value, env));
}

export function evaluate_object_expression (obj: ObjectLiteral, env: Environment): RuntimeValue {
    const object = {
        type: "object",
        properties: new Map(),
    } as ObjectValue;
    for (const { key, value } of obj.properties) {

        // handle valid key: pair
        const runtime_value = (value == undefined) ? env.lookupVariable(key) : evaluate(value, env);

        object.properties.set(key, runtime_value);
    }
    return object;
}