"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AssignmentNode: () => AssignmentNode,
  BaseNode: () => BaseNode,
  BehaviorNode: () => BehaviorNode,
  BinaryExpression: () => BinaryExpression,
  BlockNode: () => BlockNode,
  CallExpression: () => CallExpression,
  DeclarationNode: () => DeclarationNode,
  DirectiveExpression: () => DirectiveExpression,
  Engine: () => Engine,
  IdentifierExpression: () => IdentifierExpression,
  Lexer: () => Lexer,
  LiteralExpression: () => LiteralExpression,
  OnBlockNode: () => OnBlockNode,
  Parser: () => Parser,
  ProgramNode: () => ProgramNode,
  QueryExpression: () => QueryExpression,
  SelectorNode: () => SelectorNode,
  StateBlockNode: () => StateBlockNode,
  StateEntryNode: () => StateEntryNode,
  TokenType: () => TokenType,
  UnaryExpression: () => UnaryExpression,
  UseNode: () => UseNode,
  VERSION: () => VERSION,
  autoMount: () => autoMount,
  parseCFS: () => parseCFS
});
module.exports = __toCommonJS(index_exports);

// src/parser/token.ts
var TokenType = /* @__PURE__ */ ((TokenType2) => {
  TokenType2["Whitespace"] = "Whitespace";
  TokenType2["Identifier"] = "Identifier";
  TokenType2["Number"] = "Number";
  TokenType2["String"] = "String";
  TokenType2["Boolean"] = "Boolean";
  TokenType2["Null"] = "Null";
  TokenType2["Behavior"] = "Behavior";
  TokenType2["Use"] = "Use";
  TokenType2["State"] = "State";
  TokenType2["On"] = "On";
  TokenType2["Construct"] = "Construct";
  TokenType2["Destruct"] = "Destruct";
  TokenType2["LBrace"] = "LBrace";
  TokenType2["RBrace"] = "RBrace";
  TokenType2["LParen"] = "LParen";
  TokenType2["RParen"] = "RParen";
  TokenType2["LBracket"] = "LBracket";
  TokenType2["RBracket"] = "RBracket";
  TokenType2["Colon"] = "Colon";
  TokenType2["Semicolon"] = "Semicolon";
  TokenType2["Comma"] = "Comma";
  TokenType2["Dot"] = "Dot";
  TokenType2["Hash"] = "Hash";
  TokenType2["Greater"] = "Greater";
  TokenType2["Less"] = "Less";
  TokenType2["Plus"] = "Plus";
  TokenType2["Minus"] = "Minus";
  TokenType2["Tilde"] = "Tilde";
  TokenType2["Star"] = "Star";
  TokenType2["Equals"] = "Equals";
  TokenType2["DoubleEquals"] = "DoubleEquals";
  TokenType2["NotEquals"] = "NotEquals";
  TokenType2["LessEqual"] = "LessEqual";
  TokenType2["GreaterEqual"] = "GreaterEqual";
  TokenType2["And"] = "And";
  TokenType2["Or"] = "Or";
  TokenType2["Bang"] = "Bang";
  TokenType2["At"] = "At";
  TokenType2["Dollar"] = "Dollar";
  TokenType2["Question"] = "Question";
  return TokenType2;
})(TokenType || {});

// src/parser/lexer.ts
var KEYWORDS = {
  behavior: "Behavior" /* Behavior */,
  use: "Use" /* Use */,
  state: "State" /* State */,
  on: "On" /* On */,
  construct: "Construct" /* Construct */,
  destruct: "Destruct" /* Destruct */,
  true: "Boolean" /* Boolean */,
  false: "Boolean" /* Boolean */,
  null: "Null" /* Null */
};
var Lexer = class {
  constructor(input) {
    this.input = input;
  }
  index = 0;
  line = 1;
  column = 1;
  tokenize() {
    const tokens = [];
    while (!this.eof()) {
      const ch = this.peek();
      if (this.isWhitespace(ch)) {
        tokens.push(this.readWhitespace());
        continue;
      }
      if (ch === "/" && this.peek(1) === "/") {
        this.readLineComment();
        continue;
      }
      if (ch === "/" && this.peek(1) === "*") {
        this.readBlockComment();
        continue;
      }
      if (this.isAlpha(ch) || ch === "_") {
        tokens.push(this.readIdentifier());
        continue;
      }
      if (this.isDigit(ch) || ch === "-" && this.isDigit(this.peek(1))) {
        tokens.push(this.readNumber());
        continue;
      }
      if (ch === '"' || ch === "'") {
        tokens.push(this.readString());
        continue;
      }
      const punct = this.readPunctuator();
      if (punct) {
        tokens.push(punct);
        continue;
      }
      throw new Error(`Unexpected character '${ch}' at ${this.line}:${this.column}`);
    }
    return tokens;
  }
  readWhitespace() {
    const start = this.position();
    let value = "";
    while (!this.eof() && this.isWhitespace(this.peek())) {
      value += this.next();
    }
    return this.token("Whitespace" /* Whitespace */, value, start);
  }
  readLineComment() {
    this.next();
    this.next();
    while (!this.eof() && this.peek() !== "\n") {
      this.next();
    }
  }
  readBlockComment() {
    this.next();
    this.next();
    while (!this.eof()) {
      if (this.peek() === "*" && this.peek(1) === "/") {
        this.next();
        this.next();
        return;
      }
      this.next();
    }
  }
  readIdentifier() {
    const start = this.position();
    let value = "";
    while (!this.eof() && (this.isAlphaNumeric(this.peek()) || this.peek() === "_" || this.peek() === "-")) {
      value += this.next();
    }
    const keywordType = KEYWORDS[value];
    if (keywordType) {
      return this.token(keywordType, value, start);
    }
    return this.token("Identifier" /* Identifier */, value, start);
  }
  readNumber() {
    const start = this.position();
    let value = "";
    if (this.peek() === "-") {
      value += this.next();
    }
    while (!this.eof() && this.isDigit(this.peek())) {
      value += this.next();
    }
    if (this.peek() === ".") {
      value += this.next();
      while (!this.eof() && this.isDigit(this.peek())) {
        value += this.next();
      }
    }
    return this.token("Number" /* Number */, value, start);
  }
  readString() {
    const quote = this.next();
    const start = this.position();
    let value = "";
    while (!this.eof()) {
      const ch = this.next();
      if (ch === "\\") {
        const escaped = this.next();
        value += escaped;
        continue;
      }
      if (ch === quote) {
        return this.token("String" /* String */, value, start);
      }
      value += ch;
    }
    throw new Error(`Unterminated string at ${start.line}:${start.column}`);
  }
  readPunctuator() {
    const start = this.position();
    const ch = this.peek();
    const next = this.peek(1);
    if (ch === "=" && next === "=") {
      this.next();
      this.next();
      return this.token("DoubleEquals" /* DoubleEquals */, "==", start);
    }
    if (ch === "!" && next === "=") {
      this.next();
      this.next();
      return this.token("NotEquals" /* NotEquals */, "!=", start);
    }
    if (ch === "<" && next === "=") {
      this.next();
      this.next();
      return this.token("LessEqual" /* LessEqual */, "<=", start);
    }
    if (ch === ">" && next === "=") {
      this.next();
      this.next();
      return this.token("GreaterEqual" /* GreaterEqual */, ">=", start);
    }
    if (ch === "&" && next === "&") {
      this.next();
      this.next();
      return this.token("And" /* And */, "&&", start);
    }
    if (ch === "|" && next === "|") {
      this.next();
      this.next();
      return this.token("Or" /* Or */, "||", start);
    }
    const punctMap = {
      "{": "LBrace" /* LBrace */,
      "}": "RBrace" /* RBrace */,
      "(": "LParen" /* LParen */,
      ")": "RParen" /* RParen */,
      "[": "LBracket" /* LBracket */,
      "]": "RBracket" /* RBracket */,
      ":": "Colon" /* Colon */,
      ";": "Semicolon" /* Semicolon */,
      ",": "Comma" /* Comma */,
      ".": "Dot" /* Dot */,
      "#": "Hash" /* Hash */,
      ">": "Greater" /* Greater */,
      "<": "Less" /* Less */,
      "+": "Plus" /* Plus */,
      "-": "Minus" /* Minus */,
      "~": "Tilde" /* Tilde */,
      "*": "Star" /* Star */,
      "=": "Equals" /* Equals */,
      "!": "Bang" /* Bang */,
      "@": "At" /* At */,
      "$": "Dollar" /* Dollar */,
      "?": "Question" /* Question */
    };
    const type = punctMap[ch];
    if (!type) {
      return null;
    }
    this.next();
    return this.token(type, ch, start);
  }
  token(type, value, start) {
    return {
      type,
      value,
      start,
      end: this.position()
    };
  }
  position() {
    return { index: this.index, line: this.line, column: this.column };
  }
  peek(offset = 0) {
    return this.input[this.index + offset] ?? "";
  }
  next() {
    const ch = this.input[this.index++] ?? "";
    if (ch === "\n") {
      this.line += 1;
      this.column = 1;
    } else {
      this.column += 1;
    }
    return ch;
  }
  eof() {
    return this.index >= this.input.length;
  }
  isWhitespace(ch) {
    return ch === " " || ch === "	" || ch === "\n" || ch === "\r";
  }
  isAlpha(ch) {
    return ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z";
  }
  isDigit(ch) {
    return ch >= "0" && ch <= "9";
  }
  isAlphaNumeric(ch) {
    return this.isAlpha(ch) || this.isDigit(ch);
  }
};

// src/ast/nodes.ts
var BaseNode = class {
  constructor(type) {
    this.type = type;
  }
  async prepare(_context) {
    return;
  }
  async evaluate(_context) {
    return void 0;
  }
};
var ProgramNode = class extends BaseNode {
  constructor(behaviors, uses = []) {
    super("Program");
    this.behaviors = behaviors;
    this.uses = uses;
  }
};
var UseNode = class extends BaseNode {
  constructor(name, alias) {
    super("Use");
    this.name = name;
    this.alias = alias;
  }
};
var BlockNode = class extends BaseNode {
  constructor(statements) {
    super("Block");
    this.statements = statements;
  }
  async evaluate(context) {
    for (const statement of this.statements) {
      if (statement && typeof statement.evaluate === "function") {
        await statement.evaluate(context);
      }
    }
  }
};
var SelectorNode = class extends BaseNode {
  constructor(selectorText) {
    super("Selector");
    this.selectorText = selectorText;
  }
};
var BehaviorNode = class extends BaseNode {
  constructor(selector, body) {
    super("Behavior");
    this.selector = selector;
    this.body = body;
  }
};
var StateEntryNode = class extends BaseNode {
  constructor(name, value, important) {
    super("StateEntry");
    this.name = name;
    this.value = value;
    this.important = important;
  }
};
var StateBlockNode = class extends BaseNode {
  constructor(entries) {
    super("StateBlock");
    this.entries = entries;
  }
};
var OnBlockNode = class extends BaseNode {
  constructor(eventName, args, body) {
    super("OnBlock");
    this.eventName = eventName;
    this.args = args;
    this.body = body;
  }
};
var AssignmentNode = class extends BaseNode {
  constructor(target, value) {
    super("Assignment");
    this.target = target;
    this.value = value;
  }
  async evaluate(context) {
    if (!context.scope || !context.scope.setPath) {
      return void 0;
    }
    let targetPath;
    if (this.target instanceof IdentifierExpression) {
      targetPath = this.target.name;
    }
    if (!targetPath) {
      return void 0;
    }
    const value = await this.value.evaluate(context);
    context.scope.setPath(targetPath, value);
    return value;
  }
};
var DeclarationNode = class extends BaseNode {
  constructor(target, operator, value, flags, flagArgs) {
    super("Declaration");
    this.target = target;
    this.operator = operator;
    this.value = value;
    this.flags = flags;
    this.flagArgs = flagArgs;
  }
};
var IdentifierExpression = class extends BaseNode {
  constructor(name) {
    super("Identifier");
    this.name = name;
  }
  async evaluate(context) {
    if (!context.scope) {
      return void 0;
    }
    return context.scope.getPath(this.name);
  }
};
var LiteralExpression = class extends BaseNode {
  constructor(value) {
    super("Literal");
    this.value = value;
  }
  async evaluate() {
    return this.value;
  }
};
var UnaryExpression = class extends BaseNode {
  constructor(operator, argument) {
    super("UnaryExpression");
    this.operator = operator;
    this.argument = argument;
  }
  async evaluate(context) {
    const value = await this.argument.evaluate(context);
    if (this.operator === "!") {
      return !value;
    }
    if (this.operator === "-") {
      return -value;
    }
    return value;
  }
};
var BinaryExpression = class extends BaseNode {
  constructor(operator, left, right) {
    super("BinaryExpression");
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  async evaluate(context) {
    if (this.operator === "&&") {
      const leftValue = await this.left.evaluate(context);
      return leftValue && await this.right.evaluate(context);
    }
    if (this.operator === "||") {
      const leftValue = await this.left.evaluate(context);
      return leftValue || await this.right.evaluate(context);
    }
    const left = await this.left.evaluate(context);
    const right = await this.right.evaluate(context);
    if (this.operator === "+") {
      return left + right;
    }
    if (this.operator === "-") {
      return left - right;
    }
    if (this.operator === "==") {
      return left == right;
    }
    if (this.operator === "!=") {
      return left != right;
    }
    if (this.operator === "<") {
      return left < right;
    }
    if (this.operator === ">") {
      return left > right;
    }
    if (this.operator === "<=") {
      return left <= right;
    }
    if (this.operator === ">=") {
      return left >= right;
    }
    return void 0;
  }
};
var CallExpression = class extends BaseNode {
  constructor(callee, args) {
    super("CallExpression");
    this.callee = callee;
    this.args = args;
  }
  async evaluate(context) {
    const resolved = this.resolveCallee(context);
    const fn = resolved?.fn ?? await this.callee.evaluate(context);
    if (typeof fn !== "function") {
      return void 0;
    }
    const values = [];
    for (const arg of this.args) {
      values.push(await arg.evaluate(context));
    }
    return fn.apply(resolved?.thisArg, values);
  }
  resolveCallee(context) {
    if (!(this.callee instanceof IdentifierExpression)) {
      return void 0;
    }
    const name = this.callee.name;
    const globals = context.globals ?? {};
    const parts = name.split(".");
    const root = parts[0];
    if (!root || !(root in globals)) {
      return void 0;
    }
    let value = globals[root];
    let parent = void 0;
    for (let i = 1; i < parts.length; i += 1) {
      parent = value;
      const part = parts[i];
      if (!part) {
        return void 0;
      }
      value = value?.[part];
    }
    return { fn: value, thisArg: parent };
  }
};
var DirectiveExpression = class extends BaseNode {
  constructor(kind, name) {
    super("Directive");
    this.kind = kind;
    this.name = name;
  }
  async evaluate() {
    return `${this.kind}:${this.name}`;
  }
};
var QueryExpression = class extends BaseNode {
  constructor(direction, selector) {
    super("Query");
    this.direction = direction;
    this.selector = selector;
  }
  async evaluate(context) {
    const selector = this.selector.trim();
    if (!selector) {
      return [];
    }
    if (this.direction === "ancestor") {
      const results = [];
      let cursor = context.element?.parentElement;
      while (cursor) {
        if (cursor.matches(selector)) {
          results.push(cursor);
        }
        cursor = cursor.parentElement;
      }
      return results;
    }
    const root = this.direction === "descendant" ? context.element ?? (typeof document !== "undefined" ? document : void 0) : typeof document !== "undefined" ? document : void 0;
    if (!root || !("querySelectorAll" in root)) {
      return [];
    }
    return Array.from(root.querySelectorAll(selector));
  }
};

// src/parser/token-stream.ts
var TokenStream = class {
  constructor(tokens) {
    this.tokens = tokens;
  }
  index = 0;
  peek(offset = 0) {
    return this.tokens[this.index + offset] ?? null;
  }
  next() {
    const token = this.tokens[this.index++];
    if (!token) {
      throw new Error("Unexpected end of input");
    }
    return token;
  }
  eof() {
    return this.index >= this.tokens.length;
  }
  match(type) {
    if (this.peek()?.type === type) {
      this.next();
      return true;
    }
    return false;
  }
  expect(type) {
    const token = this.next();
    if (token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type}`);
    }
    return token;
  }
  skipWhitespace() {
    while (this.peek()?.type === "Whitespace" /* Whitespace */) {
      this.next();
    }
  }
  peekNonWhitespace(offset = 0) {
    let count = 0;
    for (let i = this.index; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      if (token.type === "Whitespace" /* Whitespace */) {
        continue;
      }
      if (count === offset) {
        return token;
      }
      count += 1;
    }
    return null;
  }
};

// src/parser/parser.ts
var Parser = class _Parser {
  stream;
  constructor(input) {
    const lexer = new Lexer(input);
    this.stream = new TokenStream(lexer.tokenize());
  }
  static parseInline(code) {
    const parser = new _Parser(`{${code}}`);
    return parser.parseInlineBlock();
  }
  parseProgram() {
    const behaviors = [];
    const uses = [];
    this.stream.skipWhitespace();
    while (!this.stream.eof()) {
      const next = this.stream.peek();
      if (!next) {
        break;
      }
      if (next.type === "Use" /* Use */) {
        uses.push(this.parseUseStatement());
      } else {
        behaviors.push(this.parseBehavior());
      }
      this.stream.skipWhitespace();
    }
    return new ProgramNode(behaviors, uses);
  }
  parseInlineBlock() {
    this.stream.skipWhitespace();
    return this.parseBlock({ allowDeclarations: false });
  }
  parseBehavior() {
    this.stream.skipWhitespace();
    this.stream.expect("Behavior" /* Behavior */);
    const selector = this.parseSelector();
    const body = this.parseBlock({ allowDeclarations: true });
    return new BehaviorNode(selector, body);
  }
  parseSelector() {
    let selectorText = "";
    let sawNonWhitespace = false;
    while (true) {
      const token = this.stream.peek();
      if (!token) {
        break;
      }
      if (token.type === "LBrace" /* LBrace */) {
        break;
      }
      if (token.type === "Whitespace" /* Whitespace */) {
        this.stream.next();
        if (sawNonWhitespace && selectorText[selectorText.length - 1] !== " ") {
          selectorText += " ";
        }
        continue;
      }
      sawNonWhitespace = true;
      selectorText += this.stream.next().value;
    }
    if (!selectorText.trim()) {
      throw new Error("Behavior selector is required");
    }
    return new SelectorNode(selectorText.trim());
  }
  parseUseStatement() {
    this.stream.expect("Use" /* Use */);
    this.stream.skipWhitespace();
    const name = this.parseIdentifierPath();
    this.stream.skipWhitespace();
    let alias = name;
    const next = this.stream.peek();
    if (next?.type === "Identifier" /* Identifier */ && next.value === "as") {
      this.stream.next();
      this.stream.skipWhitespace();
      alias = this.stream.expect("Identifier" /* Identifier */).value;
    }
    this.stream.skipWhitespace();
    this.stream.expect("Semicolon" /* Semicolon */);
    return new UseNode(name, alias);
  }
  parseBlock(options) {
    const allowDeclarations = options?.allowDeclarations ?? false;
    this.stream.skipWhitespace();
    this.stream.expect("LBrace" /* LBrace */);
    const statements = [];
    let declarationsOpen = allowDeclarations;
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated block");
      }
      if (next.type === "RBrace" /* RBrace */) {
        this.stream.next();
        break;
      }
      const isDeclaration = this.isDeclarationStart();
      if (isDeclaration) {
        if (!allowDeclarations) {
          throw new Error("Declarations are only allowed at the behavior root");
        }
        if (!declarationsOpen) {
          throw new Error("Declarations must appear before blocks");
        }
        statements.push(this.parseDeclaration());
      } else {
        if (declarationsOpen) {
          declarationsOpen = false;
        }
        statements.push(this.parseStatement());
      }
    }
    return new BlockNode(statements);
  }
  parseStatement() {
    this.stream.skipWhitespace();
    const next = this.stream.peek();
    if (!next) {
      throw new Error("Unexpected end of input");
    }
    if (next.type === "On" /* On */) {
      return this.parseOnBlock();
    }
    if (next.type === "Construct" /* Construct */) {
      return this.parseConstructBlock();
    }
    if (next.type === "Destruct" /* Destruct */) {
      return this.parseDestructBlock();
    }
    if (next.type === "Behavior" /* Behavior */) {
      return this.parseBehavior();
    }
    if (this.isCallStart()) {
      return this.parseExpressionStatement();
    }
    if (this.isAssignmentStart()) {
      return this.parseAssignment();
    }
    throw new Error(`Unexpected token ${next.type}`);
  }
  parseStateBlock() {
    this.stream.expect("State" /* State */);
    this.stream.skipWhitespace();
    this.stream.expect("LBrace" /* LBrace */);
    const entries = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated state block");
      }
      if (next.type === "RBrace" /* RBrace */) {
        this.stream.next();
        break;
      }
      const nameToken = this.stream.expect("Identifier" /* Identifier */);
      this.stream.skipWhitespace();
      this.stream.expect("Colon" /* Colon */);
      this.stream.skipWhitespace();
      const value = this.parseExpression();
      this.stream.skipWhitespace();
      let important = false;
      if (this.stream.peek()?.type === "Bang" /* Bang */) {
        this.stream.next();
        this.stream.skipWhitespace();
        const importantToken = this.stream.next();
        if (importantToken.type === "Identifier" /* Identifier */ && importantToken.value === "important") {
          important = true;
        } else {
          throw new Error("Expected 'important' after '!'");
        }
      }
      this.stream.skipWhitespace();
      this.stream.expect("Semicolon" /* Semicolon */);
      entries.push(new StateEntryNode(nameToken.value, value, important));
    }
    return new StateBlockNode(entries);
  }
  parseOnBlock() {
    this.stream.expect("On" /* On */);
    this.stream.skipWhitespace();
    const event = this.stream.expect("Identifier" /* Identifier */);
    this.stream.skipWhitespace();
    this.stream.expect("LParen" /* LParen */);
    const args = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated on() arguments");
      }
      if (next.type === "RParen" /* RParen */) {
        this.stream.next();
        break;
      }
      if (next.type === "Identifier" /* Identifier */) {
        args.push(this.stream.next().value);
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === "Comma" /* Comma */) {
          this.stream.next();
        }
        continue;
      }
      throw new Error(`Unexpected token in on() args: ${next.type}`);
    }
    const body = this.parseBlock({ allowDeclarations: false });
    return new OnBlockNode(event.value, args, body);
  }
  parseAssignment() {
    const target = this.parseAssignmentTarget();
    this.stream.skipWhitespace();
    this.stream.expect("Equals" /* Equals */);
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect("Semicolon" /* Semicolon */);
    return new AssignmentNode(target, value);
  }
  parseExpression() {
    return this.parseLogicalOrExpression();
  }
  parseLogicalOrExpression() {
    let left = this.parseLogicalAndExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next || next.type !== "Or" /* Or */) {
        break;
      }
      this.stream.skipWhitespace();
      this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseLogicalAndExpression();
      this.stream.skipWhitespace();
      left = new BinaryExpression("||", left, right);
    }
    return left;
  }
  parseLogicalAndExpression() {
    let left = this.parseEqualityExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next || next.type !== "And" /* And */) {
        break;
      }
      this.stream.skipWhitespace();
      this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseEqualityExpression();
      this.stream.skipWhitespace();
      left = new BinaryExpression("&&", left, right);
    }
    return left;
  }
  parseEqualityExpression() {
    let left = this.parseComparisonExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next || next.type !== "DoubleEquals" /* DoubleEquals */ && next.type !== "NotEquals" /* NotEquals */) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseComparisonExpression();
      this.stream.skipWhitespace();
      left = new BinaryExpression(op.type === "DoubleEquals" /* DoubleEquals */ ? "==" : "!=", left, right);
    }
    return left;
  }
  parseComparisonExpression() {
    let left = this.parseAdditiveExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next) {
        break;
      }
      if (next.type !== "Less" /* Less */ && next.type !== "Greater" /* Greater */ && next.type !== "LessEqual" /* LessEqual */ && next.type !== "GreaterEqual" /* GreaterEqual */) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseAdditiveExpression();
      this.stream.skipWhitespace();
      let operator = "<";
      if (op.type === "Greater" /* Greater */) {
        operator = ">";
      } else if (op.type === "LessEqual" /* LessEqual */) {
        operator = "<=";
      } else if (op.type === "GreaterEqual" /* GreaterEqual */) {
        operator = ">=";
      }
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  parseAdditiveExpression() {
    let left = this.parseUnaryExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next || next.type !== "Plus" /* Plus */ && next.type !== "Minus" /* Minus */) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseUnaryExpression();
      this.stream.skipWhitespace();
      left = new BinaryExpression(op.type === "Plus" /* Plus */ ? "+" : "-", left, right);
    }
    return left;
  }
  parseUnaryExpression() {
    this.stream.skipWhitespace();
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Expected expression");
    }
    if (token.type === "Bang" /* Bang */) {
      this.stream.next();
      const argument = this.parseUnaryExpression();
      return new UnaryExpression("!", argument);
    }
    if (token.type === "Minus" /* Minus */) {
      this.stream.next();
      const argument = this.parseUnaryExpression();
      return new UnaryExpression("-", argument);
    }
    return this.parseCallExpression();
  }
  parseCallExpression() {
    let expr = this.parsePrimaryExpression();
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== "LParen" /* LParen */) {
        break;
      }
      this.stream.next();
      const args = [];
      while (true) {
        this.stream.skipWhitespace();
        const next = this.stream.peek();
        if (!next) {
          throw new Error("Unterminated call expression");
        }
        if (next.type === "RParen" /* RParen */) {
          this.stream.next();
          break;
        }
        args.push(this.parseExpression());
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === "Comma" /* Comma */) {
          this.stream.next();
          continue;
        }
        if (this.stream.peek()?.type === "RParen" /* RParen */) {
          this.stream.next();
          break;
        }
        throw new Error("Expected ',' or ')' in call arguments");
      }
      expr = new CallExpression(expr, args);
    }
    return expr;
  }
  parsePrimaryExpression() {
    this.stream.skipWhitespace();
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Expected expression");
    }
    if (token.type === "At" /* At */ || token.type === "Dollar" /* Dollar */) {
      const kind = token.type === "At" /* At */ ? "attr" : "style";
      this.stream.next();
      const name = this.stream.expect("Identifier" /* Identifier */);
      return new DirectiveExpression(kind, name.value);
    }
    if (token.type === "Question" /* Question */) {
      return this.parseQueryExpression();
    }
    if (token.type === "LParen" /* LParen */) {
      this.stream.next();
      const value = this.parseExpression();
      this.stream.skipWhitespace();
      this.stream.expect("RParen" /* RParen */);
      return value;
    }
    if (token.type === "Identifier" /* Identifier */) {
      const name = this.parseIdentifierPath();
      return new IdentifierExpression(name);
    }
    if (token.type === "Boolean" /* Boolean */) {
      return new LiteralExpression(this.stream.next().value === "true");
    }
    if (token.type === "Null" /* Null */) {
      this.stream.next();
      return new LiteralExpression(null);
    }
    if (token.type === "Number" /* Number */) {
      return new LiteralExpression(Number(this.stream.next().value));
    }
    if (token.type === "String" /* String */) {
      return new LiteralExpression(this.stream.next().value);
    }
    throw new Error(`Unsupported expression token ${token.type}`);
  }
  parseAssignmentTarget() {
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Expected assignment target");
    }
    if (token.type === "At" /* At */ || token.type === "Dollar" /* Dollar */) {
      const kind = token.type === "At" /* At */ ? "attr" : "style";
      this.stream.next();
      const name = this.stream.expect("Identifier" /* Identifier */);
      return new DirectiveExpression(kind, name.value);
    }
    if (token.type === "Identifier" /* Identifier */) {
      return new IdentifierExpression(this.parseIdentifierPath());
    }
    throw new Error(`Invalid assignment target ${token.type}`);
  }
  parseDeclaration() {
    const target = this.parseDeclarationTarget();
    this.stream.skipWhitespace();
    const operator = this.parseDeclarationOperator();
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    const { flags, flagArgs } = this.parseFlags();
    this.stream.skipWhitespace();
    this.stream.expect("Semicolon" /* Semicolon */);
    return new DeclarationNode(target, operator, value, flags, flagArgs);
  }
  parseDeclarationTarget() {
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Expected declaration target");
    }
    if (token.type === "At" /* At */ || token.type === "Dollar" /* Dollar */) {
      const kind = token.type === "At" /* At */ ? "attr" : "style";
      this.stream.next();
      const name = this.stream.expect("Identifier" /* Identifier */);
      return new DirectiveExpression(kind, name.value);
    }
    if (token.type === "Identifier" /* Identifier */) {
      return new IdentifierExpression(this.stream.next().value);
    }
    throw new Error(`Invalid declaration target ${token.type}`);
  }
  parseDeclarationOperator() {
    this.stream.expect("Colon" /* Colon */);
    const next = this.stream.peek();
    if (!next) {
      return ":";
    }
    if (next.type === "Equals" /* Equals */) {
      this.stream.next();
      return ":=";
    }
    if (next.type === "Less" /* Less */) {
      this.stream.next();
      return ":<";
    }
    if (next.type === "Greater" /* Greater */) {
      this.stream.next();
      return ":>";
    }
    return ":";
  }
  parseFlags() {
    const flags = {};
    const flagArgs = {};
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== "Bang" /* Bang */) {
        break;
      }
      this.stream.next();
      const name = this.stream.expect("Identifier" /* Identifier */).value;
      if (name === "important") {
        flags.important = true;
      } else if (name === "trusted") {
        flags.trusted = true;
      } else if (name === "debounce") {
        flags.debounce = true;
        if (this.stream.peek()?.type === "LParen" /* LParen */) {
          this.stream.next();
          this.stream.skipWhitespace();
          const numberToken = this.stream.expect("Number" /* Number */);
          flagArgs.debounce = Number(numberToken.value);
          this.stream.skipWhitespace();
          this.stream.expect("RParen" /* RParen */);
        } else {
          flagArgs.debounce = 200;
        }
      } else {
        throw new Error(`Unknown flag ${name}`);
      }
    }
    return { flags, flagArgs };
  }
  isDeclarationStart() {
    const first = this.stream.peekNonWhitespace(0);
    if (!first) {
      return false;
    }
    if (first.type === "Identifier" /* Identifier */) {
      const second = this.stream.peekNonWhitespace(1);
      return second?.type === "Colon" /* Colon */;
    }
    if (first.type === "At" /* At */ || first.type === "Dollar" /* Dollar */) {
      const second = this.stream.peekNonWhitespace(1);
      const third = this.stream.peekNonWhitespace(2);
      return second?.type === "Identifier" /* Identifier */ && third?.type === "Colon" /* Colon */;
    }
    return false;
  }
  isAssignmentStart() {
    const first = this.stream.peekNonWhitespace(0);
    if (!first) {
      return false;
    }
    if (first.type === "Identifier" /* Identifier */) {
      let index = 1;
      while (this.stream.peekNonWhitespace(index)?.type === "Dot" /* Dot */ && this.stream.peekNonWhitespace(index + 1)?.type === "Identifier" /* Identifier */) {
        index += 2;
      }
      return this.stream.peekNonWhitespace(index)?.type === "Equals" /* Equals */;
    }
    if (first.type === "At" /* At */ || first.type === "Dollar" /* Dollar */) {
      const second = this.stream.peekNonWhitespace(1);
      const third = this.stream.peekNonWhitespace(2);
      return second?.type === "Identifier" /* Identifier */ && third?.type === "Equals" /* Equals */;
    }
    return false;
  }
  isCallStart() {
    const first = this.stream.peekNonWhitespace(0);
    if (!first || first.type !== "Identifier" /* Identifier */) {
      return false;
    }
    let index = 1;
    while (this.stream.peekNonWhitespace(index)?.type === "Dot" /* Dot */ && this.stream.peekNonWhitespace(index + 1)?.type === "Identifier" /* Identifier */) {
      index += 2;
    }
    return this.stream.peekNonWhitespace(index)?.type === "LParen" /* LParen */;
  }
  parseExpressionStatement() {
    const expr = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect("Semicolon" /* Semicolon */);
    return expr;
  }
  parseConstructBlock() {
    this.stream.expect("Construct" /* Construct */);
    const body = this.parseBlock({ allowDeclarations: false });
    body.type = "Construct";
    return body;
  }
  parseDestructBlock() {
    this.stream.expect("Destruct" /* Destruct */);
    const body = this.parseBlock({ allowDeclarations: false });
    body.type = "Destruct";
    return body;
  }
  parseQueryExpression() {
    this.stream.expect("Question" /* Question */);
    let direction = "self";
    if (this.stream.peek()?.type === "Greater" /* Greater */) {
      this.stream.next();
      direction = "descendant";
    } else if (this.stream.peek()?.type === "Less" /* Less */) {
      this.stream.next();
      direction = "ancestor";
    }
    this.stream.skipWhitespace();
    this.stream.expect("LParen" /* LParen */);
    const selector = this.readSelectorUntil("RParen" /* RParen */);
    return new QueryExpression(direction, selector);
  }
  readSelectorUntil(terminator) {
    let selectorText = "";
    let sawNonWhitespace = false;
    while (true) {
      const token = this.stream.peek();
      if (!token) {
        throw new Error("Unterminated selector");
      }
      if (token.type === terminator) {
        this.stream.next();
        break;
      }
      if (token.type === "Whitespace" /* Whitespace */) {
        this.stream.next();
        if (sawNonWhitespace && selectorText[selectorText.length - 1] !== " ") {
          selectorText += " ";
        }
        continue;
      }
      sawNonWhitespace = true;
      selectorText += this.stream.next().value;
    }
    return selectorText.trim();
  }
  parseIdentifierPath() {
    let value = this.stream.expect("Identifier" /* Identifier */).value;
    while (this.stream.peek()?.type === "Dot" /* Dot */) {
      this.stream.next();
      const part = this.stream.expect("Identifier" /* Identifier */).value;
      value = `${value}.${part}`;
    }
    return value;
  }
};

// src/runtime/scope.ts
var Scope = class {
  constructor(parent) {
    this.parent = parent;
    this.root = parent ? parent.root : this;
  }
  data = /* @__PURE__ */ new Map();
  root;
  listeners = /* @__PURE__ */ new Map();
  get(key) {
    return this.getPath(key);
  }
  set(key, value) {
    this.setPath(key, value);
  }
  getPath(path) {
    const { targetScope, targetPath } = this.resolveScope(path);
    if (!targetScope || !targetPath) {
      return void 0;
    }
    const parts = targetPath.split(".");
    const root = parts[0];
    if (!root) {
      return void 0;
    }
    let value = targetScope.data.get(root);
    for (let i = 1; i < parts.length; i += 1) {
      if (value == null) {
        return void 0;
      }
      const key = parts[i];
      if (!key) {
        return void 0;
      }
      value = value[key];
    }
    return value;
  }
  setPath(path, value) {
    const { targetScope, targetPath } = this.resolveScope(path);
    if (!targetScope || !targetPath) {
      return;
    }
    const parts = targetPath.split(".");
    const root = parts[0];
    if (!root) {
      return;
    }
    if (parts.length === 1) {
      targetScope.data.set(root, value);
      targetScope.emitChange(targetPath);
      return;
    }
    let obj = targetScope.data.get(root);
    if (obj == null || typeof obj !== "object") {
      obj = {};
      targetScope.data.set(root, obj);
    }
    let cursor = obj;
    for (let i = 1; i < parts.length - 1; i += 1) {
      const key = parts[i];
      if (!key) {
        return;
      }
      if (cursor[key] == null || typeof cursor[key] !== "object") {
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
    const lastKey = parts[parts.length - 1];
    if (!lastKey) {
      return;
    }
    cursor[lastKey] = value;
    this.emitChange(path);
  }
  on(path, handler) {
    const key = path.trim();
    if (!key) {
      return;
    }
    const set = this.listeners.get(key) ?? /* @__PURE__ */ new Set();
    set.add(handler);
    this.listeners.set(key, set);
  }
  off(path, handler) {
    const key = path.trim();
    const set = this.listeners.get(key);
    if (!set) {
      return;
    }
    set.delete(handler);
    if (set.size === 0) {
      this.listeners.delete(key);
    }
  }
  emitChange(path) {
    const key = path.trim();
    if (!key) {
      return;
    }
    this.listeners.get(key)?.forEach((fn) => fn());
    const rootKey = key.split(".")[0];
    if (rootKey && rootKey !== key) {
      this.listeners.get(rootKey)?.forEach((fn) => fn());
    }
  }
  resolveScope(path) {
    if (path.startsWith("parent.")) {
      return { targetScope: this.parent, targetPath: path.slice("parent.".length) };
    }
    if (path.startsWith("root.")) {
      return { targetScope: this.root, targetPath: path.slice("root.".length) };
    }
    if (path.startsWith("self.")) {
      return { targetScope: this, targetPath: path.slice("self.".length) };
    }
    return { targetScope: this, targetPath: path };
  }
};

// src/runtime/bindings.ts
function getElementValue(element) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  return element.textContent ?? "";
}
function setElementValue(element, value) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.value = value;
    element.setAttribute("value", value);
    return;
  }
  element.textContent = value;
}
function applyBindToScope(element, expression, scope) {
  const key = expression.trim();
  if (!key) {
    return;
  }
  const value = getElementValue(element).trim();
  if (value !== "") {
    scope.set(key, value);
  }
}
function applyBindToElement(element, expression, scope) {
  const key = expression.trim();
  if (!key) {
    return;
  }
  const value = scope.get(key);
  if (value == null) {
    return;
  }
  setElementValue(element, String(value));
}

// src/runtime/conditionals.ts
function readCondition(expression, scope) {
  const key = expression.trim();
  if (!key) {
    return false;
  }
  return !!scope.get(key);
}
function applyIf(element, expression, scope) {
  element.style.display = readCondition(expression, scope) ? "" : "none";
}
function applyShow(element, expression, scope) {
  element.style.display = readCondition(expression, scope) ? "" : "none";
}

// src/runtime/html.ts
function sanitizeHtml(value) {
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}
function applyHtml(element, expression, scope, trusted) {
  const key = expression.trim();
  if (!key) {
    return;
  }
  const value = scope.get(key);
  const html = value == null ? "" : String(value);
  element.innerHTML = trusted ? html : sanitizeHtml(html);
}

// src/runtime/http.ts
async function applyGet(element, config, scope) {
  if (!globalThis.fetch) {
    throw new Error("fetch is not available");
  }
  const response = await globalThis.fetch(config.url);
  if (!response || !response.ok) {
    return;
  }
  const html = await response.text();
  const target = resolveTarget(element, config.targetSelector);
  if (!target) {
    element.dispatchEvent(new CustomEvent("vsn:targetError", { detail: { selector: config.targetSelector } }));
    return;
  }
  if (config.swap === "outer") {
    const wrapper = document.createElement("div");
    applyHtml(wrapper, "__html", { get: () => html }, config.trusted);
    const replacement = wrapper.firstElementChild;
    if (replacement && target.parentNode) {
      target.parentNode.replaceChild(replacement, target);
    }
    return;
  }
  applyHtml(target, "__html", { get: () => html }, config.trusted);
}
function resolveTarget(element, selector) {
  if (!selector) {
    return element;
  }
  return element.ownerDocument.querySelector(selector);
}

// src/runtime/debounce.ts
function debounce(fn, waitMs) {
  let timer;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = void 0;
      fn(...args);
    }, waitMs);
  };
}

// src/runtime/engine.ts
var Engine = class {
  scopes = /* @__PURE__ */ new WeakMap();
  bindBindings = /* @__PURE__ */ new WeakMap();
  ifBindings = /* @__PURE__ */ new WeakMap();
  showBindings = /* @__PURE__ */ new WeakMap();
  htmlBindings = /* @__PURE__ */ new WeakMap();
  getBindings = /* @__PURE__ */ new WeakMap();
  lifecycleBindings = /* @__PURE__ */ new WeakMap();
  behaviorRegistry = [];
  behaviorBindings = /* @__PURE__ */ new WeakMap();
  behaviorId = 0;
  codeCache = /* @__PURE__ */ new Map();
  observer;
  attributeHandlers = [];
  globals = {};
  importantFlags = /* @__PURE__ */ new WeakMap();
  constructor() {
    this.registerGlobal("console", console);
    this.registerQueryHelpers();
    this.registerDefaultAttributeHandlers();
  }
  async mount(root) {
    const elements = [root, ...Array.from(root.querySelectorAll("*"))];
    for (const element of elements) {
      if (!this.hasVsnAttributes(element)) {
        continue;
      }
      const parentScope = this.findParentScope(element);
      this.getScope(element, parentScope);
      this.attachAttributes(element);
      this.runConstruct(element);
    }
    await this.applyBehaviors(root);
    this.attachObserver(root);
  }
  unmount(element) {
    this.runDestruct(element);
  }
  registerBehaviors(source) {
    const program = new Parser(source).parseProgram();
    for (const use of program.uses) {
      const value = this.resolveGlobalPath(use.name);
      if (value === void 0) {
        console.warn(`vsn: global '${use.name}' not found`);
        continue;
      }
      this.registerGlobal(use.alias, value);
    }
    for (const behavior of program.behaviors) {
      this.collectBehavior(behavior);
    }
  }
  registerGlobal(name, value) {
    this.globals[name] = value;
  }
  registerGlobals(values) {
    Object.assign(this.globals, values);
  }
  registerAttributeHandler(handler) {
    this.attributeHandlers.push(handler);
  }
  resolveGlobalPath(name) {
    const parts = name.split(".");
    const root = parts[0];
    if (!root) {
      return void 0;
    }
    let value = globalThis[root];
    for (let i = 1; i < parts.length; i += 1) {
      const part = parts[i];
      if (!part) {
        return void 0;
      }
      value = value?.[part];
    }
    return value;
  }
  getScope(element, parentScope) {
    const existing = this.scopes.get(element);
    if (existing) {
      return existing;
    }
    const scope = new Scope(parentScope ?? this.findParentScope(element));
    this.scopes.set(element, scope);
    return scope;
  }
  evaluate(element) {
    const scope = this.getScope(element);
    const bindConfig = this.bindBindings.get(element);
    if (bindConfig && (bindConfig.direction === "from" || bindConfig.direction === "both")) {
      applyBindToElement(element, bindConfig.expr, scope);
    }
    const ifExpr = this.ifBindings.get(element);
    if (ifExpr && element instanceof HTMLElement) {
      applyIf(element, ifExpr, scope);
    }
    const showExpr = this.showBindings.get(element);
    if (showExpr && element instanceof HTMLElement) {
      applyShow(element, showExpr, scope);
    }
    const htmlBinding = this.htmlBindings.get(element);
    if (htmlBinding && element instanceof HTMLElement) {
      applyHtml(element, htmlBinding.expr, scope, htmlBinding.trusted);
    }
  }
  attachObserver(root) {
    if (this.observer) {
      return;
    }
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node && node.nodeType === 1) {
            this.handleAddedNode(node);
          }
        }
        for (const node of Array.from(mutation.removedNodes)) {
          if (node && node.nodeType === 1) {
            this.handleRemovedNode(node);
          }
        }
      }
    });
    this.observer.observe(root, { childList: true, subtree: true });
  }
  handleRemovedNode(node) {
    if (this.lifecycleBindings.has(node)) {
      this.runDestruct(node);
    }
    if (this.behaviorBindings.has(node)) {
      this.runBehaviorDestruct(node);
    }
    for (const child of Array.from(node.querySelectorAll("*"))) {
      if (this.lifecycleBindings.has(child)) {
        this.runDestruct(child);
      }
      if (this.behaviorBindings.has(child)) {
        this.runBehaviorDestruct(child);
      }
    }
  }
  handleAddedNode(node) {
    const elements = [node, ...Array.from(node.querySelectorAll("*"))];
    for (const element of elements) {
      if (!this.hasVsnAttributes(element)) {
        continue;
      }
      const parentScope = this.findParentScope(element);
      this.getScope(element, parentScope);
      this.attachAttributes(element);
      this.runConstruct(element);
    }
    void this.applyBehaviors(node);
  }
  async applyBehaviors(root) {
    if (this.behaviorRegistry.length === 0) {
      return;
    }
    const elements = [root, ...Array.from(root.querySelectorAll("*"))];
    for (const element of elements) {
      const bound = this.behaviorBindings.get(element) ?? /* @__PURE__ */ new Set();
      const matches = this.behaviorRegistry.filter((behavior) => {
        if (bound.has(behavior.id)) {
          return false;
        }
        return element.matches(behavior.selector);
      });
      if (matches.length === 0) {
        continue;
      }
      matches.sort((a, b) => {
        if (a.specificity !== b.specificity) {
          return a.specificity - b.specificity;
        }
        return a.order - b.order;
      });
      const scope = this.getScope(element);
      for (const behavior of matches) {
        bound.add(behavior.id);
        await this.applyBehaviorDeclarations(element, scope, behavior.declarations);
        if (behavior.construct) {
          await this.executeBlock(behavior.construct, scope, element);
        }
        for (const onBlock of behavior.onBlocks) {
          this.attachBehaviorOnHandler(element, onBlock.event, onBlock.body);
        }
      }
      this.behaviorBindings.set(element, bound);
    }
  }
  runBehaviorDestruct(element) {
    const bound = this.behaviorBindings.get(element);
    if (!bound) {
      return;
    }
    const scope = this.getScope(element);
    for (const behavior of this.behaviorRegistry) {
      if (!bound.has(behavior.id) || !behavior.destruct) {
        continue;
      }
      void this.executeBlock(behavior.destruct, scope, element);
    }
  }
  attachAttributes(element) {
    const scope = this.getScope(element);
    for (const name of element.getAttributeNames()) {
      if (!name.startsWith("vsn-")) {
        continue;
      }
      const value = element.getAttribute(name) ?? "";
      for (const handler of this.attributeHandlers) {
        if (!handler.match(name)) {
          continue;
        }
        const handled = handler.handle(element, name, value, scope);
        if (handled !== false) {
          break;
        }
      }
    }
  }
  setLifecycle(element, patch) {
    const current = this.lifecycleBindings.get(element) ?? {};
    this.lifecycleBindings.set(element, { ...current, ...patch });
  }
  runConstruct(element) {
    const config = this.lifecycleBindings.get(element);
    if (!config?.construct) {
      return;
    }
    const scope = this.getScope(element);
    this.execute(config.construct, scope, element);
  }
  runDestruct(element) {
    const config = this.lifecycleBindings.get(element);
    if (!config?.destruct) {
      return;
    }
    const scope = this.getScope(element);
    this.execute(config.destruct, scope, element);
  }
  attachBindInputHandler(element, expr) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
      return;
    }
    const handler = () => {
      const scope = this.getScope(element);
      applyBindToScope(element, expr, scope);
    };
    element.addEventListener("input", handler);
    element.addEventListener("change", handler);
  }
  parseBindDirection(name) {
    if (name.includes(":from")) {
      return "from";
    }
    if (name.includes(":to")) {
      return "to";
    }
    return "both";
  }
  hasVsnAttributes(element) {
    return element.getAttributeNames().some((name) => name.startsWith("vsn-"));
  }
  findParentScope(element) {
    let parent = element.parentElement;
    while (parent) {
      const scope = this.scopes.get(parent);
      if (scope) {
        return scope;
      }
      parent = parent.parentElement;
    }
    return void 0;
  }
  watch(scope, expr, handler) {
    const key = expr.trim();
    if (!key) {
      return;
    }
    scope.on(key, handler);
  }
  watchWithDebounce(scope, expr, handler, debounceMs) {
    if (debounceMs) {
      this.watch(scope, expr, debounce(handler, debounceMs));
    } else {
      this.watch(scope, expr, handler);
    }
  }
  parseOnAttribute(name, value) {
    if (!name.startsWith("vsn-on:")) {
      return null;
    }
    const eventWithFlags = name.slice("vsn-on:".length);
    const [event, ...flags] = eventWithFlags.split("!");
    if (!event) {
      return null;
    }
    let debounceMs;
    for (const flag of flags) {
      if (!flag.startsWith("debounce")) {
        continue;
      }
      const match = flag.match(/debounce\((\d+)\)/);
      debounceMs = match ? Number(match[1]) : 200;
    }
    const config = {
      event,
      code: value,
      ...debounceMs !== void 0 ? { debounceMs } : {}
    };
    return config;
  }
  attachOnHandler(element, config) {
    const handler = async () => {
      const scope = this.getScope(element);
      await this.execute(config.code, scope, element);
      this.evaluate(element);
    };
    const effectiveHandler = config.debounceMs ? debounce(handler, config.debounceMs) : handler;
    element.addEventListener(config.event, effectiveHandler);
  }
  attachBehaviorOnHandler(element, event, body) {
    const handler = async () => {
      const scope = this.getScope(element);
      await this.executeBlock(body, scope, element);
      this.evaluate(element);
    };
    element.addEventListener(event, handler);
  }
  attachGetHandler(element) {
    element.addEventListener("click", async () => {
      const config = this.getBindings.get(element);
      if (!config) {
        return;
      }
      await applyGet(element, config, this.getScope(element));
    });
  }
  async execute(code, scope, element) {
    let block = this.codeCache.get(code);
    if (!block) {
      block = Parser.parseInline(code);
      this.codeCache.set(code, block);
    }
    const context = {
      scope,
      globals: this.globals,
      ...element ? { element } : {}
    };
    await block.evaluate(context);
  }
  async executeBlock(block, scope, element) {
    const context = {
      scope,
      globals: this.globals,
      ...element ? { element } : {}
    };
    await block.evaluate(context);
  }
  collectBehavior(behavior, parentSelector) {
    const selector = parentSelector ? `${parentSelector} ${behavior.selector.selectorText}` : behavior.selector.selectorText;
    const lifecycle = this.extractLifecycle(behavior.body);
    this.behaviorRegistry.push({
      id: this.behaviorId += 1,
      selector,
      specificity: this.computeSpecificity(selector),
      order: this.behaviorRegistry.length,
      onBlocks: this.extractOnBlocks(behavior.body),
      declarations: this.extractDeclarations(behavior.body),
      ...lifecycle
    });
    for (const statement of behavior.body.statements) {
      if (statement instanceof BehaviorNode) {
        this.collectBehavior(statement, selector);
      }
    }
  }
  computeSpecificity(selector) {
    const idMatches = selector.match(/#[\w-]+/g)?.length ?? 0;
    const classMatches = selector.match(/\.[\w-]+/g)?.length ?? 0;
    const attrMatches = selector.match(/\[[^\]]+\]/g)?.length ?? 0;
    const pseudoMatches = selector.match(/:[\w-]+/g)?.length ?? 0;
    const elementMatches = selector.match(/(^|[\s>+~])([a-zA-Z][\w-]*)/g)?.length ?? 0;
    return idMatches * 100 + (classMatches + attrMatches + pseudoMatches) * 10 + elementMatches;
  }
  registerQueryHelpers() {
    const queryDoc = (selector) => {
      if (typeof document === "undefined") {
        return [];
      }
      return Array.from(document.querySelectorAll(selector));
    };
    const queryWithin = (element, selector) => {
      if (!element) {
        return [];
      }
      return Array.from(element.querySelectorAll(selector));
    };
    const queryAncestors = (element, selector) => {
      const results = [];
      let cursor = element?.parentElement;
      while (cursor) {
        if (cursor.matches(selector)) {
          results.push(cursor);
        }
        cursor = cursor.parentElement;
      }
      return results;
    };
    this.registerGlobal("?", (selector) => queryDoc(selector));
    this.registerGlobal("?>", (selector, element) => {
      return queryWithin(element, selector);
    });
    this.registerGlobal("?<", (selector, element) => {
      return queryAncestors(element, selector);
    });
  }
  getImportantKey(declaration) {
    if (declaration.target instanceof IdentifierExpression) {
      return `state:${declaration.target.name}`;
    }
    if (declaration.target instanceof DirectiveExpression) {
      return `${declaration.target.kind}:${declaration.target.name}`;
    }
    return void 0;
  }
  isImportant(element, key) {
    const set = this.importantFlags.get(element);
    return set ? set.has(key) : false;
  }
  markImportant(element, key) {
    const set = this.importantFlags.get(element) ?? /* @__PURE__ */ new Set();
    set.add(key);
    this.importantFlags.set(element, set);
  }
  extractLifecycle(body) {
    let construct;
    let destruct;
    for (const statement of body.statements) {
      if (!(statement instanceof BlockNode)) {
        continue;
      }
      if (statement.type === "Construct") {
        construct = statement;
      } else if (statement.type === "Destruct") {
        destruct = statement;
      }
    }
    return {
      ...construct ? { construct } : {},
      ...destruct ? { destruct } : {}
    };
  }
  extractOnBlocks(body) {
    const blocks = [];
    for (const statement of body.statements) {
      if (statement instanceof OnBlockNode) {
        blocks.push({ event: statement.eventName, body: statement.body });
      }
    }
    return blocks;
  }
  extractDeclarations(body) {
    const declarations = [];
    for (const statement of body.statements) {
      if (statement instanceof DeclarationNode) {
        declarations.push(statement);
      }
    }
    return declarations;
  }
  async applyBehaviorDeclarations(element, scope, declarations) {
    for (const declaration of declarations) {
      await this.applyBehaviorDeclaration(element, scope, declaration);
    }
  }
  async applyBehaviorDeclaration(element, scope, declaration) {
    const context = { scope, element };
    const operator = declaration.operator;
    const debounceMs = declaration.flags.debounce ? declaration.flagArgs.debounce ?? 200 : void 0;
    const importantKey = this.getImportantKey(declaration);
    if (!declaration.flags.important && importantKey && this.isImportant(element, importantKey)) {
      return;
    }
    if (declaration.target instanceof IdentifierExpression) {
      const value = await declaration.value.evaluate(context);
      scope.setPath(declaration.target.name, value);
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }
    if (!(declaration.target instanceof DirectiveExpression)) {
      return;
    }
    const target = declaration.target;
    const exprIdentifier = declaration.value instanceof IdentifierExpression ? declaration.value.name : void 0;
    if (operator === ":>") {
      if (exprIdentifier) {
        this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs);
      }
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }
    if (operator === ":=" && exprIdentifier) {
      this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs);
    }
    if (!exprIdentifier) {
      const value = await declaration.value.evaluate(context);
      this.setDirectiveValue(element, target, value, declaration.flags.trusted);
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }
    const shouldWatch = operator === ":<" || operator === ":=";
    this.applyDirectiveFromScope(
      element,
      target,
      exprIdentifier,
      scope,
      declaration.flags.trusted,
      debounceMs,
      shouldWatch
    );
    if (declaration.flags.important && importantKey) {
      this.markImportant(element, importantKey);
    }
  }
  applyDirectiveFromScope(element, target, expr, scope, trusted, debounceMs, watch = true) {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      const handler2 = () => applyHtml(element, expr, scope, Boolean(trusted));
      handler2();
      if (watch) {
        this.watchWithDebounce(scope, expr, handler2, debounceMs);
      }
      return;
    }
    const handler = () => {
      const value = scope.get(expr);
      if (value == null) {
        return;
      }
      this.setDirectiveValue(element, target, value, trusted);
    };
    handler();
    if (watch) {
      this.watchWithDebounce(scope, expr, handler, debounceMs);
    }
  }
  applyDirectiveToScope(element, target, expr, scope, debounceMs) {
    if (target.kind === "attr" && target.name === "value") {
      this.applyValueBindingToScope(element, expr, debounceMs);
      return;
    }
    const value = this.getDirectiveValue(element, target);
    if (value != null) {
      scope.set(expr, value);
    }
  }
  applyValueBindingToScope(element, expr, debounceMs) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
      return;
    }
    const handler = () => {
      const scope = this.getScope(element);
      applyBindToScope(element, expr, scope);
    };
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    effectiveHandler();
    element.addEventListener("input", effectiveHandler);
    element.addEventListener("change", effectiveHandler);
  }
  setDirectiveValue(element, target, value, trusted) {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      const html = value == null ? "" : String(value);
      element.innerHTML = trusted ? html : html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
      return;
    }
    if (target.kind === "attr") {
      if (target.name === "value") {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          element.value = value == null ? "" : String(value);
          element.setAttribute("value", element.value);
          return;
        }
        if (element instanceof HTMLSelectElement) {
          element.value = value == null ? "" : String(value);
          return;
        }
      }
      if (target.name === "checked" && element instanceof HTMLInputElement) {
        const checked = Boolean(value);
        element.checked = checked;
        if (checked) {
          element.setAttribute("checked", "");
        } else {
          element.removeAttribute("checked");
        }
        return;
      }
      element.setAttribute(target.name, value == null ? "" : String(value));
      return;
    }
    if (target.kind === "style" && element instanceof HTMLElement) {
      element.style.setProperty(target.name, value == null ? "" : String(value));
    }
  }
  getDirectiveValue(element, target) {
    if (target.kind === "attr") {
      if (target.name === "value") {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          return element.value;
        }
        if (element instanceof HTMLSelectElement) {
          return element.value;
        }
      }
      if (target.name === "checked" && element instanceof HTMLInputElement) {
        return element.checked ? "true" : "false";
      }
      return element.getAttribute(target.name) ?? void 0;
    }
    if (target.kind === "style" && element instanceof HTMLElement) {
      return element.style.getPropertyValue(target.name) ?? void 0;
    }
    return void 0;
  }
  registerDefaultAttributeHandlers() {
    this.registerAttributeHandler({
      id: "vsn-bind",
      match: (name) => name.startsWith("vsn-bind"),
      handle: (element, name, value, scope) => {
        const direction = this.parseBindDirection(name);
        this.bindBindings.set(element, { expr: value, direction });
        if (direction === "to" || direction === "both") {
          applyBindToScope(element, value, scope);
          this.attachBindInputHandler(element, value);
        }
        if (direction === "from" || direction === "both") {
          this.watch(scope, value, () => applyBindToElement(element, value, scope));
        }
      }
    });
    this.registerAttributeHandler({
      id: "vsn-if",
      match: (name) => name === "vsn-if",
      handle: (element, _name, value, scope) => {
        this.ifBindings.set(element, value);
        if (element instanceof HTMLElement) {
          applyIf(element, value, scope);
        }
        this.watch(scope, value, () => this.evaluate(element));
      }
    });
    this.registerAttributeHandler({
      id: "vsn-show",
      match: (name) => name === "vsn-show",
      handle: (element, _name, value, scope) => {
        this.showBindings.set(element, value);
        if (element instanceof HTMLElement) {
          applyShow(element, value, scope);
        }
        this.watch(scope, value, () => this.evaluate(element));
      }
    });
    this.registerAttributeHandler({
      id: "vsn-html",
      match: (name) => name.startsWith("vsn-html"),
      handle: (element, name, value, scope) => {
        const trusted = name.includes("!trusted");
        this.htmlBindings.set(element, { expr: value, trusted });
        if (element instanceof HTMLElement) {
          applyHtml(element, value, scope, trusted);
        }
        this.watch(scope, value, () => this.evaluate(element));
      }
    });
    this.registerAttributeHandler({
      id: "vsn-get",
      match: (name) => name.startsWith("vsn-get"),
      handle: (element, name) => {
        const trusted = name.includes("!trusted");
        const url = element.getAttribute(name) ?? "";
        const target = element.getAttribute("vsn-target") ?? void 0;
        const swap = element.getAttribute("vsn-swap") ?? "inner";
        const config = {
          url,
          swap,
          trusted,
          ...target ? { targetSelector: target } : {}
        };
        this.getBindings.set(element, config);
        this.attachGetHandler(element);
      }
    });
    this.registerAttributeHandler({
      id: "vsn-construct",
      match: (name) => name === "vsn-construct",
      handle: (element, _name, value) => {
        this.setLifecycle(element, { construct: value });
      }
    });
    this.registerAttributeHandler({
      id: "vsn-destruct",
      match: (name) => name === "vsn-destruct",
      handle: (element, _name, value) => {
        this.setLifecycle(element, { destruct: value });
      }
    });
    this.registerAttributeHandler({
      id: "vsn-on",
      match: (name) => name.startsWith("vsn-on:"),
      handle: (element, name, value) => {
        const onConfig = this.parseOnAttribute(name, value);
        if (onConfig) {
          this.attachOnHandler(element, onConfig);
        }
      }
    });
  }
};

// src/index.ts
var VERSION = "0.1.0";
function parseCFS(source) {
  const parser = new Parser(source);
  return parser.parseProgram();
}
function autoMount(root = document) {
  if (typeof document === "undefined") {
    return null;
  }
  const engine = new Engine();
  const mount = () => {
    const target = root instanceof Document ? root.body : root;
    if (target) {
      const sources = Array.from(document.querySelectorAll('script[type="text/vsn"]')).map((script) => script.textContent ?? "").join("\n");
      if (sources.trim()) {
        engine.registerBehaviors(sources);
      }
      engine.mount(target);
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
  return engine;
}
if (typeof document !== "undefined") {
  const scriptTag = document.querySelector("script[auto-mount]");
  if (scriptTag) {
    autoMount();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AssignmentNode,
  BaseNode,
  BehaviorNode,
  BinaryExpression,
  BlockNode,
  CallExpression,
  DeclarationNode,
  DirectiveExpression,
  Engine,
  IdentifierExpression,
  Lexer,
  LiteralExpression,
  OnBlockNode,
  Parser,
  ProgramNode,
  QueryExpression,
  SelectorNode,
  StateBlockNode,
  StateEntryNode,
  TokenType,
  UnaryExpression,
  UseNode,
  VERSION,
  autoMount,
  parseCFS
});
//# sourceMappingURL=index.cjs.map