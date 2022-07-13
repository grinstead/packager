/**
 * This file defines a script for packaging javascript files together (and
 * minifying them) with Google's Closure Compiler.
 */

import * as acorn from "acorn";
import { compiler as ClosureCompiler } from "google-closure-compiler";
import * as fs from "fs/promises";
import { constants as FS } from "fs";
import { z, ZodSchema } from "zod";

async function main(rawArgs: Args) {
  const args = validateArgsAndPrintErrors(
    z.object({
      topLevel: z.array(z.string()).min(1),
      options: z.object({
        output: z.string(),
      }),
    }),
    rawArgs
  );

  // it will have already printed the errors
  if (!args) throw new Error("Invalid Command Line Args");

  fs.copyFile("hi", "yo");

  const compiled = await new Promise((resolve, reject) => {
    const compiler = new ClosureCompiler({
      js: args.topLevel,
      compilation_level: "ADVANCED",
      assume_function_wrapper: true,
      process_closure_primitives: false,
      rewrite_polyfills: false,
      inject_libraries: false,
    });

    compiler.run((code, out, err) => {
      if (code === 0) {
        resolve(out);
      } else {
        out && console.log(out);
        err && console.error(err);
        reject(new Error(`ClosureError: ${code}`));
      }
    });
  });

  console.log(compiled);

  // const parsed = acorn.parse(contents, { ecmaVersion: "latest" });
  // console.log(parsed);
}

/////////////////////////////////////////////////////////////////////////////
// Utilities
/////////////////////////////////////////////////////////////////////////////

type Args = {
  topLevel: string[];
  options: Record<string, true | string>;
};

type ArgParseOptions = {
  /**
   * Any flags that can be written with one character
   */
  shorthand?: Record<string, string>;
};

/**
 * Parses command line args into a more useful format
 *
 * @param args The raw command line args passed in
 * @param parseOptions The
 * @returns An args object
 */
function parseArgs(args: string[], parseOptions?: ArgParseOptions): Args {
  const shorthand = parseOptions?.shorthand;

  const topLevel: string[] = [];
  const options: Record<string, true | string> = {};

  let openName: void | string;
  const handleArg = (name: string, value?: string | true) => {
    if (openName !== undefined) {
      options[openName] = true;
    }

    if (value !== undefined) {
      options[name] = value;
    } else {
      openName = name;
    }
  };

  const handleValue = (value: string) => {
    if (openName) {
      options[openName] = value;
      openName = undefined;
    } else {
      topLevel.push(value);
    }
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--")) {
      const equalsIndex = arg.indexOf("=");
      if (equalsIndex < 0) {
        // there is no equals sign, so this is an open parameter
        handleArg(arg.substring(2));
      } else {
        handleArg(arg.substring(2, equalsIndex));

        // if there is content after the equals sign, then it is the value
        if (equalsIndex < arg.length - 1) {
          handleValue(arg.substring(equalsIndex + 1));
        }
      }
    } else if (arg.length >= 2 && arg.startsWith("-")) {
      const trailingIndex = arg.length - 1;
      for (let j = 1; j < trailingIndex; j++) {
        const letter = arg[j];
        handleArg(shorthand?.[letter] ?? letter, true);
      }

      const trailingLetter = arg[trailingIndex];
      handleArg(shorthand?.[trailingLetter] ?? trailingLetter);
    } else {
      handleValue(arg);
    }
  }

  return { topLevel, options };
}

function validateArgsAndPrintErrors<T>(
  schema: ZodSchema<T, any, Args>,
  args: Args
): void | T {
  console.log(args);

  const parse = schema.safeParse(args);

  if (parse.success) {
    return parse.data;
  }

  // we failed the parse

  parse.error.issues.forEach((issue) => {
    if (issue.path[0] === "options" && issue.path.length > 1) {
      console.error(
        `InvalidParam ${JSON.stringify(issue.path.slice(1).join("."))}: ${
          issue.message
        }`
      );
    } else if (issue.path[0] === "topLevel") {
      console.error(`InvalidArg: ${issue.message}`);
    } else {
      console.error(issue.message);
    }
  });
}

/////////////////////////////////////////////////////////////////////////////
// Run the Script
/////////////////////////////////////////////////////////////////////////////

// the array looks like ["node", "closure_shim", ...args], so strip out those leadins
main(parseArgs(process.argv.slice(2), { shorthand: { o: "output" } }));
