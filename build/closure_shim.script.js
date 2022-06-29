"use strict";
/**
 * This file defines a script for packaging javascript files together (and
 * minifying them) with Google's Closure Compiler.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs/promises"));
const zod_1 = require("zod");
function main(rawArgs) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = validateArgsAndPrintErrors(zod_1.z.object({
            topLevel: zod_1.z.array(zod_1.z.string()).min(1),
            options: zod_1.z.object({}),
        }), rawArgs);
        // it will have already printed the errors
        if (!args)
            throw new Error("Invalid Command Line Args");
        const [filename] = args.topLevel;
        const contents = yield fs.readFile(filename, { encoding: "utf-8" });
        console.log(contents);
    });
}
/**
 * Parses command line args into a more useful format
 *
 * @param args The raw command line args passed in
 * @param parseOptions The
 * @returns An args object
 */
function parseArgs(args, parseOptions) {
    var _a;
    const shorthand = parseOptions === null || parseOptions === void 0 ? void 0 : parseOptions.shorthand;
    const topLevel = [];
    const options = {};
    let openName;
    const handleArg = (name, value) => {
        if (openName !== undefined) {
            options[openName] = true;
        }
        if (value !== undefined) {
            options[name] = value;
        }
        else {
            openName = name;
        }
    };
    const handleValue = (value) => {
        if (openName) {
            options[openName] = value;
            openName = undefined;
        }
        else {
            topLevel.push(value);
        }
    };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith("--")) {
            const equalsIndex = arg.indexOf("=");
            if (equalsIndex < 0) {
                // there is no equals sign, so this is an open parameter
                handleArg(arg);
            }
            else {
                handleArg(arg.substring(2, equalsIndex));
                // if there is content after the equals sign, then it is the value
                if (equalsIndex < arg.length - 1) {
                    handleValue(arg.substring(equalsIndex + 1));
                }
            }
        }
        else if (arg.length >= 2 && arg.startsWith("-")) {
            for (let j = i; j < arg.length; j++) {
                const letter = arg[j];
                handleArg((_a = shorthand === null || shorthand === void 0 ? void 0 : shorthand[letter]) !== null && _a !== void 0 ? _a : letter, true);
            }
        }
        else {
            handleValue(arg);
        }
    }
    return { topLevel, options };
}
function validateArgsAndPrintErrors(schema, args) {
    const parse = schema.safeParse(args);
    if (parse.success) {
        return parse.data;
    }
    // we failed the parse
    parse.error.issues.forEach((issue) => {
        if (issue.path[0] === "options" && issue.path.length > 1) {
            console.error(`InvalidParam ${JSON.stringify(issue.path.slice(1).join("."))}: ${issue.message}`);
        }
        else if (issue.path[0] === "topLevel") {
            console.error(`InvalidArg: ${issue.message}`);
        }
        else {
            console.error(issue.message);
        }
    });
}
/////////////////////////////////////////////////////////////////////////////
// Run the Script
/////////////////////////////////////////////////////////////////////////////
// the array looks like ["node", "closure_shim", ...args], so strip out those leadins
main(parseArgs(process.argv.slice(2)));
