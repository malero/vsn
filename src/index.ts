export const VERSION = "0.1.0";

export { Lexer } from "./parser/lexer";
import { Parser } from "./parser/parser";
export { Parser };
export { TokenType } from "./parser/token";
export * from "./ast/nodes";

export function parseCFS(source: string) {
  const parser = new Parser(source);
  return parser.parseProgram();
}
