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
      js_output_file: string;
      debug?: boolean;
    });

    run(
      callback: (exitCode: number, stdOut: string, stdErr: string) => void
    ): void;
  }
}
