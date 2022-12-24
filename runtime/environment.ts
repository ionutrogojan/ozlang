import { MK_BOOL, MK_NULL, RuntimeValue } from "./values.ts";

export function create_global_environment () {
    const env = new Environment();
	// variable declaration
	env.declareVariable("true", MK_BOOL(true), true);
	env.declareVariable("false", MK_BOOL(false), true);
	env.declareVariable("null", MK_NULL(), true);

    return env;
}

export default class Environment {
	private parent?: Environment;
	private variables: Map<string, RuntimeValue>;
	private constants: Set<string>;

	constructor (parentENV?: Environment) {
		// const global = parentENV ? true : false;
		this.parent = parentENV;
		this.variables = new Map();
		this.constants = new Set();
	}

	public declareVariable (var_name: string, value: RuntimeValue, constant: boolean): RuntimeValue {
		if (this.variables.has(var_name)) throw `Cannot declare variable ${var_name}. As it is already defined.`;
		if (constant) { this.constants.add(var_name) }
		this.variables.set(var_name, value);
		return value;
	}

	public assignVariable (var_name: string, value: RuntimeValue): RuntimeValue {
		const env = this.resolve(var_name);
		if (env.constants.has(var_name)) throw `Cannot reassign constant variable '${var_name}'. Use 'let' keyword instead, when first assigning.`;
		env.variables.set(var_name, value);
		return value;
	}

	public lookupVariable (var_name: string): RuntimeValue {
		const env = this.resolve(var_name);
		return env.variables.get(var_name) as RuntimeValue;
	}

	public resolve (var_name: string): Environment {
		if (this.variables.has(var_name)) return this;

		if (this.parent == undefined) throw `Cannot resolve '${var_name}' as it does not exist.`;

		return this.parent.resolve(var_name);
	}
}