/**
 * @fileoverview
 * Declares just the parts of the types that we use in this project
 */

declare module "google-closure-compiler" {
  declare class compiler {
    static readonly COMPILER_PATH: string;
    static readonly CONTRIB_PATH: string;

    constructor(args: {
      js: string | string[];
      compilation_level: "ADVANCED";
      js_output_file?: string;
      debug?: boolean;
      assume_function_wrapper?: boolean;
      process_closure_primitives?: boolean;
      rewrite_polyfills?: boolean;
      inject_libraries?: boolean;
      variable_renaming_report?: string;
    });

    run(
      callback: (exitCode: number, stdOut: string, stdErr: string) => void
    ): void;
  }
}
