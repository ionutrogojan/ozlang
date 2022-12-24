// deno-lint-ignore-file no-unused-vars
import Parser from "./frontend/parser.ts";
import { create_global_environment } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

// repl();
run("./test.ozl");

async function run (file_name: string) {
    const parser = new Parser();
    const env = create_global_environment();

    const input = await Deno.readTextFile(file_name);
    const program = parser.produceAST(input);
    const result = evaluate(program, env);
    console.log(result);
}

function repl() {
    const parser = new Parser();
    const env = create_global_environment();

    console.log("\nRepl v0.1");

    while (true) {
        const input = prompt("> ");
        // check for no user input or exit
        if (!input || input.includes("exit")) { Deno.exit(1) }

        const program = parser.produceAST(input);
        
        const result = evaluate(program, env);
        console.log(result);
    }
}

// deno run -A main.ts