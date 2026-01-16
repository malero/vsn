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
  ArrayExpression: () => ArrayExpression,
  AssignmentNode: () => AssignmentNode,
  AwaitExpression: () => AwaitExpression,
  BaseNode: () => BaseNode,
  BehaviorNode: () => BehaviorNode,
  BinaryExpression: () => BinaryExpression,
  BlockNode: () => BlockNode,
  CallExpression: () => CallExpression,
  DeclarationNode: () => DeclarationNode,
  DirectiveExpression: () => DirectiveExpression,
  Engine: () => Engine,
  FunctionDeclarationNode: () => FunctionDeclarationNode,
  FunctionExpression: () => FunctionExpression,
  IdentifierExpression: () => IdentifierExpression,
  IndexExpression: () => IndexExpression,
  Lexer: () => Lexer,
  LiteralExpression: () => LiteralExpression,
  MemberExpression: () => MemberExpression,
  OnBlockNode: () => OnBlockNode,
  Parser: () => Parser,
  ProgramNode: () => ProgramNode,
  QueryExpression: () => QueryExpression,
  ReturnNode: () => ReturnNode,
  SelectorNode: () => SelectorNode,
  StateBlockNode: () => StateBlockNode,
  StateEntryNode: () => StateEntryNode,
  TernaryExpression: () => TernaryExpression,
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
  TokenType2["Return"] = "Return";
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
  TokenType2["Arrow"] = "Arrow";
  TokenType2["DoubleEquals"] = "DoubleEquals";
  TokenType2["NotEquals"] = "NotEquals";
  TokenType2["LessEqual"] = "LessEqual";
  TokenType2["GreaterEqual"] = "GreaterEqual";
  TokenType2["And"] = "And";
  TokenType2["Or"] = "Or";
  TokenType2["Pipe"] = "Pipe";
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
  return: "Return" /* Return */,
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
    if (ch === "=" && next === ">") {
      this.next();
      this.next();
      return this.token("Arrow" /* Arrow */, "=>", start);
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
    if (ch === "|" && next === ">") {
      this.next();
      this.next();
      return this.token("Pipe" /* Pipe */, "|>", start);
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
      if (context.returning) {
        break;
      }
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
  constructor(eventName, args, body, modifiers = []) {
    super("OnBlock");
    this.eventName = eventName;
    this.args = args;
    this.body = body;
    this.modifiers = modifiers;
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
var ReturnNode = class extends BaseNode {
  constructor(value) {
    super("Return");
    this.value = value;
  }
  async evaluate(context) {
    if (context.returning) {
      return context.returnValue;
    }
    context.returnValue = this.value ? await this.value.evaluate(context) : void 0;
    context.returning = true;
    return context.returnValue;
  }
};
var FunctionDeclarationNode = class extends BaseNode {
  constructor(name, params, body, isAsync = false) {
    super("FunctionDeclaration");
    this.name = name;
    this.params = params;
    this.body = body;
    this.isAsync = isAsync;
  }
};
var FunctionExpression = class extends BaseNode {
  constructor(params, body, isAsync = false) {
    super("FunctionExpression");
    this.params = params;
    this.body = body;
    this.isAsync = isAsync;
  }
  async evaluate(context) {
    const scope = context.scope;
    const globals = context.globals;
    const element = context.element;
    return async (...args) => {
      const inner = {
        ...scope ? { scope } : {},
        ...globals ? { globals } : {},
        ...element ? { element } : {},
        returnValue: void 0,
        returning: false
      };
      if (scope) {
        const previousValues = /* @__PURE__ */ new Map();
        for (let i = 0; i < this.params.length; i += 1) {
          const name = this.params[i];
          if (!name) {
            continue;
          }
          previousValues.set(name, scope.getPath(name));
          if (scope.setPath) {
            scope.setPath(name, args[i]);
          }
        }
        await this.body.evaluate(inner);
        for (const name of this.params) {
          if (!name || !scope.setPath) {
            continue;
          }
          scope.setPath(name, previousValues.get(name));
        }
      } else {
        await this.body.evaluate(inner);
      }
      return inner.returnValue;
    };
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
    if (context.scope) {
      const value = context.scope.getPath(this.name);
      const root = this.name.split(".")[0];
      const explicit = this.name.startsWith("parent.") || this.name.startsWith("root.") || this.name.startsWith("self.");
      if (explicit || value !== void 0 || root && context.scope.hasKey?.(root)) {
        return value;
      }
    }
    return context.globals ? context.globals[this.name] : void 0;
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
var TernaryExpression = class extends BaseNode {
  constructor(test, consequent, alternate) {
    super("TernaryExpression");
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
  async evaluate(context) {
    const condition = await this.test.evaluate(context);
    if (condition) {
      return this.consequent.evaluate(context);
    }
    return this.alternate.evaluate(context);
  }
};
var MemberExpression = class _MemberExpression extends BaseNode {
  constructor(target, property) {
    super("MemberExpression");
    this.target = target;
    this.property = property;
  }
  async evaluate(context) {
    const resolved = await this.resolve(context);
    return resolved?.value;
  }
  async resolve(context) {
    const path = this.getIdentifierPath();
    if (path) {
      const resolved = this.resolveFromScope(context, path);
      if (resolved) {
        return resolved;
      }
      const resolvedGlobal = this.resolveFromGlobals(context, path);
      if (resolvedGlobal) {
        return resolvedGlobal;
      }
    }
    const target = await this.target.evaluate(context);
    if (target == null) {
      return { value: void 0, target };
    }
    return { value: target[this.property], target };
  }
  getIdentifierPath() {
    const targetPath = this.getTargetIdentifierPath();
    if (!targetPath) {
      return void 0;
    }
    const path = `${targetPath.path}.${this.property}`;
    return { path, root: targetPath.root };
  }
  getTargetIdentifierPath() {
    if (this.target instanceof IdentifierExpression) {
      const name = this.target.name;
      const root = name.split(".")[0];
      if (!root) {
        return void 0;
      }
      return { path: name, root };
    }
    if (this.target instanceof _MemberExpression) {
      return this.target.getIdentifierPath();
    }
    return void 0;
  }
  resolveFromScope(context, path) {
    if (!context.scope) {
      return void 0;
    }
    const value = context.scope.getPath(path.path);
    const explicit = path.path.startsWith("parent.") || path.path.startsWith("root.") || path.path.startsWith("self.");
    if (!explicit && value === void 0 && !context.scope.hasKey?.(path.root)) {
      return void 0;
    }
    const targetPath = this.getTargetPath(path.path);
    const target = targetPath ? context.scope.getPath(targetPath) : void 0;
    return { value, target };
  }
  resolveFromGlobals(context, path) {
    const globals = context.globals ?? {};
    if (!path.root || !(path.root in globals)) {
      return void 0;
    }
    let value = globals[path.root];
    let parent = void 0;
    const parts = path.path.split(".");
    for (let i = 1; i < parts.length; i += 1) {
      parent = value;
      const part = parts[i];
      if (!part) {
        return { value: void 0, target: parent };
      }
      value = value?.[part];
    }
    return { value, target: parent };
  }
  getTargetPath(path) {
    const parts = path.split(".");
    if (parts.length <= 1) {
      return void 0;
    }
    return parts.slice(0, -1).join(".");
  }
};
var CallExpression = class extends BaseNode {
  constructor(callee, args) {
    super("CallExpression");
    this.callee = callee;
    this.args = args;
  }
  async evaluate(context) {
    const resolved = await this.resolveCallee(context);
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
  async resolveCallee(context) {
    if (this.callee instanceof MemberExpression) {
      const resolved = await this.callee.resolve(context);
      if (!resolved) {
        return void 0;
      }
      return { fn: resolved.value, thisArg: resolved.target };
    }
    if (!(this.callee instanceof IdentifierExpression)) {
      return void 0;
    }
    const name = this.callee.name;
    const globals = context.globals ?? {};
    const parts = name.split(".");
    const root = parts[0];
    if (!root || !(root in globals)) {
      if (parts.length > 1 && context.scope) {
        const parentPath = parts.slice(0, -1).join(".");
        const methodName = parts[parts.length - 1];
        if (!methodName) {
          return void 0;
        }
        const parentValue = context.scope.getPath(parentPath);
        if (parentValue == null) {
          return void 0;
        }
        return { fn: parentValue?.[methodName], thisArg: parentValue };
      }
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
var ArrayExpression = class extends BaseNode {
  constructor(elements) {
    super("ArrayExpression");
    this.elements = elements;
  }
  async evaluate(context) {
    const values = [];
    for (const element of this.elements) {
      values.push(await element.evaluate(context));
    }
    return values;
  }
};
var IndexExpression = class extends BaseNode {
  constructor(target, index) {
    super("IndexExpression");
    this.target = target;
    this.index = index;
  }
  async evaluate(context) {
    const target = await this.target.evaluate(context);
    if (target == null) {
      return void 0;
    }
    const index = await this.index.evaluate(context);
    if (index == null) {
      return void 0;
    }
    return target[index];
  }
};
var DirectiveExpression = class extends BaseNode {
  constructor(kind, name) {
    super("Directive");
    this.kind = kind;
    this.name = name;
  }
  async evaluate(context) {
    const element = context.element;
    if (!element) {
      return `${this.kind}:${this.name}`;
    }
    if (this.kind === "attr") {
      if (this.name === "value") {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          return element.value;
        }
        if (element instanceof HTMLSelectElement) {
          return element.value;
        }
      }
      if (this.name === "checked" && element instanceof HTMLInputElement) {
        return element.checked;
      }
      if (this.name === "html" && element instanceof HTMLElement) {
        return element.innerHTML;
      }
      return element.getAttribute(this.name) ?? void 0;
    }
    if (this.kind === "style" && element instanceof HTMLElement) {
      return element.style.getPropertyValue(this.name) ?? void 0;
    }
    return void 0;
  }
};
var AwaitExpression = class extends BaseNode {
  constructor(argument) {
    super("AwaitExpression");
    this.argument = argument;
  }
  async evaluate(context) {
    const value = await this.argument.evaluate(context);
    return await value;
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
  source;
  customFlags;
  allowImplicitSemicolon = false;
  awaitStack = [];
  constructor(input, options) {
    this.source = input;
    this.customFlags = options?.customFlags ?? /* @__PURE__ */ new Set();
    const lexer = new Lexer(input);
    this.stream = new TokenStream(lexer.tokenize());
  }
  static parseInline(code) {
    const parser = new _Parser(`{${code}}`);
    return parser.parseInlineBlock();
  }
  parseProgram() {
    return this.wrapErrors(() => {
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
    });
  }
  parseInlineBlock() {
    return this.wrapErrors(() => {
      this.stream.skipWhitespace();
      this.allowImplicitSemicolon = true;
      return this.parseBlock({ allowDeclarations: false });
    });
  }
  parseBehavior() {
    return this.wrapErrors(() => {
      this.stream.skipWhitespace();
      this.stream.expect("Behavior" /* Behavior */);
      const selector = this.parseSelector();
      const body = this.parseBlock({ allowDeclarations: true });
      return new BehaviorNode(selector, body);
    });
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
    return this.wrapErrors(() => {
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
    });
  }
  wrapErrors(fn) {
    try {
      return fn();
    } catch (error) {
      if (error instanceof Error && !/\(line\s+\d+, column\s+\d+\)/i.test(error.message)) {
        throw new Error(this.formatError(error.message));
      }
      throw error;
    }
  }
  formatError(message) {
    const token = this.stream.peek() ?? this.stream.peekNonWhitespace(0);
    if (!token) {
      return `Parse error: ${message}`;
    }
    const line = token.start.line;
    const column = token.start.column;
    const snippet = this.getLineSnippet(line, column);
    return `Parse error (line ${line}, column ${column}): ${message}
${snippet}`;
  }
  getLineSnippet(line, column) {
    const lines = this.source.split(/\r?\n/);
    const content = lines[line - 1] ?? "";
    const caret = `${" ".repeat(Math.max(column - 1, 0))}^`;
    return `${content}
${caret}`;
  }
  parseBlock(options) {
    const allowDeclarations = options?.allowDeclarations ?? false;
    this.stream.skipWhitespace();
    this.stream.expect("LBrace" /* LBrace */);
    const statements = [];
    let declarationsOpen = allowDeclarations;
    let sawConstruct = false;
    let sawFunctionOrOn = false;
    let sawNestedBehavior = false;
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
      if (allowDeclarations && next.type === "Behavior" /* Behavior */) {
        sawNestedBehavior = true;
      }
      if (allowDeclarations && sawNestedBehavior && next.type !== "Behavior" /* Behavior */) {
        throw new Error("Nested behaviors must appear after construct, function, and on blocks");
      }
      const isFunctionDeclaration = allowDeclarations && this.isFunctionDeclarationStart();
      if (isFunctionDeclaration) {
        if (!sawConstruct) {
          sawFunctionOrOn = true;
        }
        statements.push(this.parseFunctionDeclaration());
        continue;
      }
      const isFunctionExpressionAssignment = allowDeclarations && this.isFunctionExpressionAssignmentStart();
      if (isFunctionExpressionAssignment) {
        if (!declarationsOpen) {
          throw new Error("Declarations must appear before blocks");
        }
        statements.push(this.parseAssignment());
        continue;
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
        if (allowDeclarations && next.type === "On" /* On */ && !sawConstruct) {
          sawFunctionOrOn = true;
        }
        if (allowDeclarations && next.type === "Construct" /* Construct */) {
          if (sawFunctionOrOn) {
            throw new Error("Construct blocks must appear before functions and on blocks");
          }
          sawConstruct = true;
        }
        statements.push(this.parseStatement());
      }
    }
    return new BlockNode(statements);
  }
  parseStatement(options) {
    this.stream.skipWhitespace();
    const next = this.stream.peek();
    if (!next) {
      throw new Error("Unexpected end of input");
    }
    const allowBlocks = options?.allowBlocks ?? true;
    const allowReturn = options?.allowReturn ?? false;
    if (next.type === "Return" /* Return */) {
      if (!allowReturn) {
        throw new Error("Return is only allowed inside functions");
      }
      return this.parseReturnStatement();
    }
    if (allowBlocks && next.type === "On" /* On */) {
      return this.parseOnBlock();
    }
    if (allowBlocks && next.type === "Construct" /* Construct */) {
      return this.parseConstructBlock();
    }
    if (allowBlocks && next.type === "Destruct" /* Destruct */) {
      return this.parseDestructBlock();
    }
    if (allowBlocks && next.type === "Behavior" /* Behavior */) {
      return this.parseBehavior();
    }
    if (this.isAwaitAllowed() && next.type === "Identifier" /* Identifier */ && next.value === "await") {
      return this.parseExpressionStatement();
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
    const event = this.parseIdentifierPath();
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
    const modifiers = this.parseOnModifiers();
    const body = this.parseBlock({ allowDeclarations: false });
    return new OnBlockNode(event, args, body, modifiers);
  }
  parseOnModifiers() {
    const modifiers = [];
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== "Bang" /* Bang */) {
        break;
      }
      this.stream.next();
      const name = this.stream.expect("Identifier" /* Identifier */).value;
      modifiers.push(name);
    }
    return modifiers;
  }
  parseAssignment() {
    const target = this.parseAssignmentTarget();
    this.stream.skipWhitespace();
    this.stream.expect("Equals" /* Equals */);
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    this.consumeStatementTerminator();
    return new AssignmentNode(target, value);
  }
  parseExpression() {
    return this.parsePipeExpression();
  }
  parsePipeExpression() {
    let expr = this.parseTernaryExpression();
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== "Pipe" /* Pipe */) {
        break;
      }
      this.stream.next();
      this.stream.skipWhitespace();
      let awaitStage = false;
      const next = this.stream.peek();
      if (this.isAwaitAllowed() && next?.type === "Identifier" /* Identifier */ && next.value === "await") {
        this.stream.next();
        this.stream.skipWhitespace();
        awaitStage = true;
      }
      const stage = this.parseCallExpression();
      const call = this.buildPipeCall(expr, stage);
      expr = awaitStage ? new AwaitExpression(call) : call;
    }
    return expr;
  }
  buildPipeCall(input, stage) {
    if (stage instanceof CallExpression) {
      return new CallExpression(stage.callee, [input, ...stage.args]);
    }
    if (stage instanceof IdentifierExpression || stage instanceof MemberExpression) {
      return new CallExpression(stage, [input]);
    }
    throw new Error("Pipe operator requires a function call");
  }
  parseTernaryExpression() {
    let test = this.parseLogicalOrExpression();
    this.stream.skipWhitespace();
    if (this.stream.peek()?.type !== "Question" /* Question */) {
      return test;
    }
    this.stream.next();
    this.stream.skipWhitespace();
    const consequent = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect("Colon" /* Colon */);
    this.stream.skipWhitespace();
    const alternate = this.parseExpression();
    return new TernaryExpression(test, consequent, alternate);
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
    if (this.isAwaitAllowed() && token.type === "Identifier" /* Identifier */ && token.value === "await") {
      this.stream.next();
      const argument = this.parseUnaryExpression();
      return new AwaitExpression(argument);
    }
    return this.parseCallExpression();
  }
  parseCallExpression() {
    let expr = this.parsePrimaryExpression();
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        break;
      }
      if (next.type === "LParen" /* LParen */) {
        this.stream.next();
        const args = [];
        while (true) {
          this.stream.skipWhitespace();
          const argToken = this.stream.peek();
          if (!argToken) {
            throw new Error("Unterminated call expression");
          }
          if (argToken.type === "RParen" /* RParen */) {
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
        continue;
      }
      if (next.type === "Dot" /* Dot */) {
        this.stream.next();
        const name = this.stream.expect("Identifier" /* Identifier */);
        expr = new MemberExpression(expr, name.value);
        continue;
      }
      if (next.type === "LBracket" /* LBracket */) {
        this.stream.next();
        this.stream.skipWhitespace();
        const index = this.parseExpression();
        this.stream.skipWhitespace();
        this.stream.expect("RBracket" /* RBracket */);
        expr = new IndexExpression(expr, index);
        continue;
      }
      break;
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
    if (token.type === "LBracket" /* LBracket */) {
      return this.parseArrayExpression();
    }
    if (token.type === "LParen" /* LParen */) {
      if (this.isArrowFunctionStart()) {
        return this.parseArrowFunctionExpression();
      }
      this.stream.next();
      const value = this.parseExpression();
      this.stream.skipWhitespace();
      this.stream.expect("RParen" /* RParen */);
      return value;
    }
    if (token.type === "Identifier" /* Identifier */) {
      if (this.isAsyncToken(token) && this.isAsyncArrowFunctionStart()) {
        this.stream.next();
        this.stream.skipWhitespace();
        return this.parseArrowFunctionExpression(true);
      }
      return new IdentifierExpression(this.stream.next().value);
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
  parseArrayExpression() {
    this.stream.expect("LBracket" /* LBracket */);
    const elements = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated array literal");
      }
      if (next.type === "RBracket" /* RBracket */) {
        this.stream.next();
        break;
      }
      elements.push(this.parseExpression());
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === "Comma" /* Comma */) {
        this.stream.next();
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === "RBracket" /* RBracket */) {
          this.stream.next();
          break;
        }
        continue;
      }
      if (this.stream.peek()?.type === "RBracket" /* RBracket */) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or ']' in array literal");
    }
    return new ArrayExpression(elements);
  }
  consumeStatementTerminator() {
    this.stream.skipWhitespace();
    const next = this.stream.peek();
    if (next?.type === "Semicolon" /* Semicolon */) {
      this.stream.next();
      return;
    }
    if (this.allowImplicitSemicolon && next?.type === "RBrace" /* RBrace */) {
      return;
    }
    this.stream.expect("Semicolon" /* Semicolon */);
  }
  parseFunctionBlockWithAwait(allowAwait) {
    this.stream.expect("LBrace" /* LBrace */);
    const statements = [];
    this.awaitStack.push(allowAwait);
    try {
      while (true) {
        this.stream.skipWhitespace();
        const next = this.stream.peek();
        if (!next) {
          throw new Error("Unterminated function block");
        }
        if (next.type === "RBrace" /* RBrace */) {
          this.stream.next();
          break;
        }
        statements.push(this.parseStatement({ allowBlocks: false, allowReturn: true }));
      }
    } finally {
      this.awaitStack.pop();
    }
    return new BlockNode(statements);
  }
  isAsyncToken(token) {
    return token?.type === "Identifier" /* Identifier */ && token.value === "async";
  }
  isAwaitAllowed() {
    if (this.awaitStack.length === 0) {
      return false;
    }
    return this.awaitStack[this.awaitStack.length - 1] === true;
  }
  parseArrowExpressionBody(allowAwait) {
    this.awaitStack.push(allowAwait);
    try {
      const expression = this.parseExpression();
      return new BlockNode([new ReturnNode(expression)]);
    } finally {
      this.awaitStack.pop();
    }
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
      } else if (this.customFlags.has(name)) {
        flags[name] = true;
        const customArg = this.parseCustomFlagArg();
        if (customArg !== void 0) {
          flagArgs[name] = customArg;
        }
      } else {
        throw new Error(`Unknown flag ${name}`);
      }
    }
    return { flags, flagArgs };
  }
  parseCustomFlagArg() {
    if (this.stream.peek()?.type !== "LParen" /* LParen */) {
      return void 0;
    }
    this.stream.next();
    this.stream.skipWhitespace();
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Unterminated flag arguments");
    }
    let value;
    if (token.type === "Number" /* Number */) {
      value = Number(this.stream.next().value);
    } else if (token.type === "String" /* String */) {
      value = this.stream.next().value;
    } else if (token.type === "Boolean" /* Boolean */) {
      value = this.stream.next().value === "true";
    } else if (token.type === "Identifier" /* Identifier */) {
      value = this.stream.next().value;
    } else {
      throw new Error(`Unsupported flag argument ${token.type}`);
    }
    this.stream.skipWhitespace();
    this.stream.expect("RParen" /* RParen */);
    return value;
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
  isFunctionDeclarationStart() {
    const first = this.stream.peekNonWhitespace(0);
    if (!first) {
      return false;
    }
    let index = 0;
    if (this.isAsyncToken(first)) {
      const next = this.stream.peekNonWhitespace(1);
      if (!next || next.type !== "Identifier" /* Identifier */) {
        return false;
      }
      index = 1;
    } else if (first.type !== "Identifier" /* Identifier */) {
      return false;
    }
    index += 1;
    if (this.stream.peekNonWhitespace(index)?.type !== "LParen" /* LParen */) {
      return false;
    }
    index += 1;
    let depth = 1;
    while (true) {
      const token = this.stream.peekNonWhitespace(index);
      if (!token) {
        return false;
      }
      if (token.type === "LParen" /* LParen */) {
        depth += 1;
      } else if (token.type === "RParen" /* RParen */) {
        depth -= 1;
        if (depth === 0) {
          index += 1;
          break;
        }
      }
      index += 1;
    }
    return this.stream.peekNonWhitespace(index)?.type === "LBrace" /* LBrace */;
  }
  isArrowFunctionStart() {
    const first = this.stream.peekNonWhitespace(0);
    if (!first || first.type !== "LParen" /* LParen */) {
      return false;
    }
    let index = 1;
    let depth = 1;
    while (true) {
      const token = this.stream.peekNonWhitespace(index);
      if (!token) {
        return false;
      }
      if (token.type === "LParen" /* LParen */) {
        depth += 1;
      } else if (token.type === "RParen" /* RParen */) {
        depth -= 1;
        if (depth === 0) {
          index += 1;
          break;
        }
      }
      index += 1;
    }
    return this.stream.peekNonWhitespace(index)?.type === "Arrow" /* Arrow */;
  }
  isAsyncArrowFunctionStart() {
    const first = this.stream.peekNonWhitespace(0);
    if (!this.isAsyncToken(first)) {
      return false;
    }
    if (this.stream.peekNonWhitespace(1)?.type !== "LParen" /* LParen */) {
      return false;
    }
    let index = 2;
    let depth = 1;
    while (true) {
      const token = this.stream.peekNonWhitespace(index);
      if (!token) {
        return false;
      }
      if (token.type === "LParen" /* LParen */) {
        depth += 1;
      } else if (token.type === "RParen" /* RParen */) {
        depth -= 1;
        if (depth === 0) {
          index += 1;
          break;
        }
      }
      index += 1;
    }
    return this.stream.peekNonWhitespace(index)?.type === "Arrow" /* Arrow */;
  }
  isFunctionExpressionAssignmentStart() {
    const first = this.stream.peekNonWhitespace(0);
    if (!first || first.type !== "Identifier" /* Identifier */) {
      return false;
    }
    if (this.stream.peekNonWhitespace(1)?.type !== "Equals" /* Equals */) {
      return false;
    }
    let index = 2;
    if (this.isAsyncToken(this.stream.peekNonWhitespace(index))) {
      index += 1;
    }
    if (this.stream.peekNonWhitespace(index)?.type !== "LParen" /* LParen */) {
      return false;
    }
    index += 1;
    let depth = 1;
    while (true) {
      const token = this.stream.peekNonWhitespace(index);
      if (!token) {
        return false;
      }
      if (token.type === "LParen" /* LParen */) {
        depth += 1;
      } else if (token.type === "RParen" /* RParen */) {
        depth -= 1;
        if (depth === 0) {
          index += 1;
          break;
        }
      }
      index += 1;
    }
    return this.stream.peekNonWhitespace(index)?.type === "Arrow" /* Arrow */;
  }
  parseExpressionStatement() {
    const expr = this.parseExpression();
    this.consumeStatementTerminator();
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
  parseFunctionDeclaration() {
    let isAsync = false;
    const first = this.stream.peekNonWhitespace(0);
    if (this.isAsyncToken(first)) {
      this.stream.next();
      this.stream.skipWhitespace();
      isAsync = true;
    }
    const name = this.stream.expect("Identifier" /* Identifier */).value;
    this.stream.skipWhitespace();
    this.stream.expect("LParen" /* LParen */);
    const params = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated function parameters");
      }
      if (next.type === "RParen" /* RParen */) {
        this.stream.next();
        break;
      }
      const param = this.stream.expect("Identifier" /* Identifier */).value;
      params.push(param);
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === "Comma" /* Comma */) {
        this.stream.next();
        continue;
      }
      if (this.stream.peek()?.type === "RParen" /* RParen */) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or ')' in function parameters");
    }
    this.stream.skipWhitespace();
    const body = this.parseFunctionBlockWithAwait(isAsync);
    return new FunctionDeclarationNode(name, params, body, isAsync);
  }
  parseFunctionBlock() {
    return this.parseFunctionBlockWithAwait(false);
  }
  parseReturnStatement() {
    this.stream.expect("Return" /* Return */);
    this.stream.skipWhitespace();
    if (this.stream.peek()?.type === "Semicolon" /* Semicolon */) {
      this.stream.next();
      return new ReturnNode();
    }
    const value = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect("Semicolon" /* Semicolon */);
    return new ReturnNode(value);
  }
  parseArrowFunctionExpression(isAsync = false) {
    this.stream.expect("LParen" /* LParen */);
    const params = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated function parameters");
      }
      if (next.type === "RParen" /* RParen */) {
        this.stream.next();
        break;
      }
      const param = this.stream.expect("Identifier" /* Identifier */).value;
      params.push(param);
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === "Comma" /* Comma */) {
        this.stream.next();
        continue;
      }
      if (this.stream.peek()?.type === "RParen" /* RParen */) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or ')' in function parameters");
    }
    this.stream.skipWhitespace();
    this.stream.expect("Arrow" /* Arrow */);
    this.stream.skipWhitespace();
    if (this.stream.peek()?.type === "LBrace" /* LBrace */) {
      const body2 = this.parseFunctionBlockWithAwait(isAsync);
      return new FunctionExpression(params, body2, isAsync);
    }
    const body = this.parseArrowExpressionBody(isAsync);
    return new FunctionExpression(params, body, isAsync);
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
  anyListeners = /* @__PURE__ */ new Set();
  get(key) {
    return this.getPath(key);
  }
  set(key, value) {
    this.setPath(key, value);
  }
  hasKey(path) {
    const parts = path.split(".");
    const root = parts[0];
    if (!root) {
      return false;
    }
    return this.data.has(root);
  }
  getPath(path) {
    const explicit = path.startsWith("parent.") || path.startsWith("root.") || path.startsWith("self.");
    const { targetScope, targetPath } = this.resolveScope(path);
    if (!targetScope || !targetPath) {
      return void 0;
    }
    const localValue = this.getLocalPathValue(targetScope, targetPath);
    if (explicit || localValue !== void 0) {
      return localValue;
    }
    let cursor = targetScope.parent;
    while (cursor) {
      const value = this.getLocalPathValue(cursor, targetPath);
      if (value !== void 0) {
        return value;
      }
      cursor = cursor.parent;
    }
    return void 0;
  }
  setPath(path, value) {
    const explicit = path.startsWith("parent.") || path.startsWith("root.") || path.startsWith("self.");
    const { targetScope, targetPath } = this.resolveScope(path);
    if (!targetScope || !targetPath) {
      return;
    }
    const scopeForSet = explicit ? targetScope : this.findNearestScopeWithKey(targetScope, targetPath) ?? targetScope;
    const parts = targetPath.split(".");
    const root = parts[0];
    if (!root) {
      return;
    }
    if (parts.length === 1) {
      scopeForSet.data.set(root, value);
      scopeForSet.emitChange(targetPath);
      return;
    }
    let obj = scopeForSet.data.get(root);
    if (obj == null || typeof obj !== "object") {
      obj = {};
      scopeForSet.data.set(root, obj);
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
    scopeForSet.emitChange(targetPath);
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
  onAny(handler) {
    this.anyListeners.add(handler);
  }
  offAny(handler) {
    this.anyListeners.delete(handler);
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
    this.anyListeners.forEach((fn) => fn());
  }
  resolveScope(path) {
    let targetScope = this;
    let targetPath = path;
    while (targetPath.startsWith("parent.")) {
      targetScope = targetScope?.parent;
      targetPath = targetPath.slice("parent.".length);
    }
    if (targetPath.startsWith("root.")) {
      targetScope = targetScope?.root;
      targetPath = targetPath.slice("root.".length);
    }
    while (targetPath.startsWith("self.")) {
      targetScope = targetScope ?? this;
      targetPath = targetPath.slice("self.".length);
    }
    return { targetScope, targetPath };
  }
  getLocalPathValue(scope, path) {
    const parts = path.split(".");
    const root = parts[0];
    if (!root) {
      return void 0;
    }
    let value = scope.data.get(root);
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
  findNearestScopeWithKey(start, path) {
    const root = path.split(".")[0];
    if (!root) {
      return void 0;
    }
    let cursor = start;
    while (cursor) {
      if (cursor.data.has(root)) {
        return cursor;
      }
      cursor = cursor.parent;
    }
    return void 0;
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
  if (element instanceof HTMLElement && element.querySelector("*")) {
    return;
  }
  element.textContent = value;
}
function applyBindToScope(element, expression, scope) {
  const key = expression.trim();
  if (!key) {
    return;
  }
  const value = getElementValue(element);
  scope.set(key, value);
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
async function applyGet(element, config, scope, onHtmlApplied) {
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
      onHtmlApplied?.(replacement);
    }
    return;
  }
  applyHtml(target, "__html", { get: () => html }, config.trusted);
  onHtmlApplied?.(target);
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
var Engine = class _Engine {
  static activeEngines = /* @__PURE__ */ new WeakMap();
  scopes = /* @__PURE__ */ new WeakMap();
  bindBindings = /* @__PURE__ */ new WeakMap();
  ifBindings = /* @__PURE__ */ new WeakMap();
  showBindings = /* @__PURE__ */ new WeakMap();
  htmlBindings = /* @__PURE__ */ new WeakMap();
  getBindings = /* @__PURE__ */ new WeakMap();
  eachBindings = /* @__PURE__ */ new WeakMap();
  lifecycleBindings = /* @__PURE__ */ new WeakMap();
  behaviorRegistry = [];
  behaviorBindings = /* @__PURE__ */ new WeakMap();
  behaviorListeners = /* @__PURE__ */ new WeakMap();
  behaviorId = 0;
  codeCache = /* @__PURE__ */ new Map();
  behaviorCache = /* @__PURE__ */ new Map();
  observer;
  observerRoot;
  attributeHandlers = [];
  globals = {};
  importantFlags = /* @__PURE__ */ new WeakMap();
  inlineDeclarations = /* @__PURE__ */ new WeakMap();
  flagHandlers = /* @__PURE__ */ new Map();
  pendingAdded = /* @__PURE__ */ new Set();
  pendingRemoved = /* @__PURE__ */ new Set();
  pendingUpdated = /* @__PURE__ */ new Set();
  observerFlush;
  ignoredAdded = /* @__PURE__ */ new WeakMap();
  constructor() {
    this.registerGlobal("console", console);
    this.registerGlobal("list", {
      async map(items, fn) {
        if (!Array.isArray(items) || typeof fn !== "function") {
          return [];
        }
        const results = [];
        for (let i = 0; i < items.length; i += 1) {
          results.push(await fn(items[i], i));
        }
        return results;
      },
      async filter(items, fn) {
        if (!Array.isArray(items) || typeof fn !== "function") {
          return [];
        }
        const results = [];
        for (let i = 0; i < items.length; i += 1) {
          if (await fn(items[i], i)) {
            results.push(items[i]);
          }
        }
        return results;
      },
      async reduce(items, fn, initial) {
        if (!Array.isArray(items) || typeof fn !== "function") {
          return initial;
        }
        const hasInitial = arguments.length > 2;
        let acc = hasInitial ? initial : items[0];
        let start = hasInitial ? 0 : 1;
        for (let i = start; i < items.length; i += 1) {
          acc = await fn(acc, items[i], i);
        }
        return acc;
      }
    });
    this.registerDefaultAttributeHandlers();
  }
  async mount(root) {
    const documentRoot = root.ownerDocument;
    const active = _Engine.activeEngines.get(documentRoot);
    if (active && active !== this) {
      active.disconnectObserver();
    }
    _Engine.activeEngines.set(documentRoot, this);
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
    this.disconnectObserver();
  }
  registerBehaviors(source) {
    const program = new Parser(source, { customFlags: new Set(this.flagHandlers.keys()) }).parseProgram();
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
  registerFlag(name, handler = {}) {
    const reserved = /* @__PURE__ */ new Set(["important", "trusted", "debounce"]);
    if (reserved.has(name)) {
      throw new Error(`Flag '${name}' is reserved`);
    }
    this.flagHandlers.set(name, handler);
  }
  getRegistryStats() {
    return {
      behaviorCount: this.behaviorRegistry.length,
      behaviorCacheSize: this.behaviorCache.size
    };
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
      if (htmlBinding.trusted) {
        this.handleTrustedHtml(element);
      }
    }
  }
  attachObserver(root) {
    if (this.observer) {
      return;
    }
    this.observerRoot = root;
    this.observerFlush = debounce(() => this.flushObserverQueue(), 10);
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          this.pendingUpdated.add(mutation.target);
        }
        for (const node of Array.from(mutation.addedNodes)) {
          if (node && node.nodeType === 1) {
            const element = node;
            if (this.ignoredAdded.has(element)) {
              this.ignoredAdded.delete(element);
              continue;
            }
            this.pendingAdded.add(element);
          }
        }
        for (const node of Array.from(mutation.removedNodes)) {
          if (node && node.nodeType === 1) {
            this.pendingRemoved.add(node);
          }
        }
      }
      this.observerFlush?.();
    });
    this.observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
  disconnectObserver() {
    this.observer?.disconnect();
    this.observer = void 0;
    this.observerRoot = void 0;
    this.pendingAdded.clear();
    this.pendingRemoved.clear();
    this.pendingUpdated.clear();
  }
  flushObserverQueue() {
    const removed = Array.from(this.pendingRemoved);
    this.pendingRemoved.clear();
    for (const node of removed) {
      this.handleRemovedNode(node);
    }
    const updated = Array.from(this.pendingUpdated);
    this.pendingUpdated.clear();
    for (const node of updated) {
      this.handleUpdatedNode(node);
    }
    const added = Array.from(this.pendingAdded);
    this.pendingAdded.clear();
    for (const node of added) {
      this.handleAddedNode(node);
    }
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
  handleUpdatedNode(node) {
    const elements = [node, ...Array.from(node.querySelectorAll("*"))];
    for (const element of elements) {
      void this.reapplyBehaviorsForElement(element);
    }
  }
  async applyBehaviors(root) {
    if (this.behaviorRegistry.length === 0) {
      return;
    }
    const elements = [root, ...Array.from(root.querySelectorAll("*"))];
    for (const element of elements) {
      await this.reapplyBehaviorsForElement(element);
    }
  }
  async reapplyBehaviorsForElement(element) {
    if (this.behaviorRegistry.length === 0) {
      return;
    }
    const bound = this.behaviorBindings.get(element) ?? /* @__PURE__ */ new Set();
    const scope = this.getScope(element);
    const matched = this.behaviorRegistry.filter((behavior) => element.matches(behavior.selector)).sort((a, b) => {
      if (a.specificity !== b.specificity) {
        return a.specificity - b.specificity;
      }
      return a.order - b.order;
    });
    for (const behavior of matched) {
      if (!bound.has(behavior.id)) {
        await this.applyBehaviorForElement(behavior, element, scope, bound);
      }
    }
    const matchedIds = new Set(matched.map((behavior) => behavior.id));
    for (const behavior of this.behaviorRegistry) {
      if (bound.has(behavior.id) && !matchedIds.has(behavior.id)) {
        this.unbindBehaviorForElement(behavior, element, scope, bound);
      }
    }
    this.behaviorBindings.set(element, bound);
  }
  async applyBehaviorForElement(behavior, element, scope, bound) {
    bound.add(behavior.id);
    this.applyBehaviorFunctions(element, scope, behavior.functions);
    await this.applyBehaviorDeclarations(element, scope, behavior.declarations);
    if (behavior.construct) {
      await this.executeBlock(behavior.construct, scope, element);
    }
    for (const onBlock of behavior.onBlocks) {
      this.attachBehaviorOnHandler(element, onBlock.event, onBlock.body, onBlock.modifiers, behavior.id);
    }
  }
  unbindBehaviorForElement(behavior, element, scope, bound) {
    bound.delete(behavior.id);
    if (behavior.destruct) {
      void this.executeBlock(behavior.destruct, scope, element);
    }
    const listenerMap = this.behaviorListeners.get(element);
    const listeners = listenerMap?.get(behavior.id);
    if (listeners) {
      for (const listener of listeners) {
        element.removeEventListener(listener.event, listener.handler, listener.options);
      }
      listenerMap?.delete(behavior.id);
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
  parseEachExpression(value) {
    const [listPart, rest] = value.split(/\s+as\s+/);
    if (!listPart || !rest) {
      return null;
    }
    const listExpr = listPart.trim();
    const names = rest.split(",").map((entry) => entry.trim()).filter(Boolean);
    if (!listExpr || names.length === 0) {
      return null;
    }
    const itemName = names[0] ?? "";
    const indexName = names[1];
    return { listExpr, itemName, ...indexName ? { indexName } : {} };
  }
  renderEach(element) {
    const binding = this.eachBindings.get(element);
    if (!binding) {
      return;
    }
    if (!(element instanceof HTMLTemplateElement)) {
      return;
    }
    const parent = element.parentElement;
    if (!parent) {
      return;
    }
    for (const node of binding.rendered) {
      this.handleRemovedNode(node);
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
    binding.rendered = [];
    const scope = this.getScope(element);
    const list = scope.get(binding.listExpr);
    if (!Array.isArray(list)) {
      return;
    }
    const rendered = [];
    list.forEach((item, index) => {
      const fragment = element.content.cloneNode(true);
      const roots = Array.from(fragment.children);
      const itemScope = new Scope(scope);
      itemScope.setPath(`self.${binding.itemName}`, item);
      if (binding.indexName) {
        itemScope.setPath(`self.${binding.indexName}`, index);
      }
      for (const root of roots) {
        this.getScope(root, itemScope);
      }
      parent.insertBefore(fragment, element);
      for (const root of roots) {
        this.ignoredAdded.set(root, true);
        rendered.push(root);
        this.handleAddedNode(root);
        this.evaluate(root);
        for (const child of Array.from(root.querySelectorAll("*"))) {
          this.evaluate(child);
        }
      }
    });
    binding.rendered = rendered;
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
  markInlineDeclaration(element, key) {
    const set = this.inlineDeclarations.get(element) ?? /* @__PURE__ */ new Set();
    set.add(key);
    this.inlineDeclarations.set(element, set);
  }
  isInlineDeclaration(element, key) {
    const set = this.inlineDeclarations.get(element);
    return set ? set.has(key) : false;
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
    const root = key.split(".")[0];
    if (!root) {
      return;
    }
    let target = scope;
    while (target && !target.hasKey(root)) {
      target = target.parent;
    }
    if (target) {
      target.on(key, handler);
      return;
    }
    let cursor = scope;
    while (cursor) {
      cursor.on(key, handler);
      cursor = cursor.parent;
    }
  }
  watchWithDebounce(scope, expr, handler, debounceMs) {
    if (debounceMs) {
      this.watch(scope, expr, debounce(handler, debounceMs));
    } else {
      this.watch(scope, expr, handler);
    }
  }
  watchAllScopes(scope, handler, debounceMs) {
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    let cursor = scope;
    while (cursor) {
      cursor.onAny(effectiveHandler);
      cursor = cursor.parent;
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
    const descriptor = this.parseEventDescriptor(event);
    if (!descriptor.event) {
      return null;
    }
    let debounceMs;
    const modifiers = [];
    for (const flag of flags) {
      if (flag.startsWith("debounce")) {
        const match = flag.match(/debounce\((\d+)\)/);
        debounceMs = match ? Number(match[1]) : 200;
        continue;
      }
      modifiers.push(flag);
    }
    const config = {
      event: descriptor.event,
      code: value,
      ...debounceMs !== void 0 ? { debounceMs } : {},
      ...modifiers.length > 0 ? { modifiers } : {},
      ...descriptor.keyModifiers.length > 0 ? { keyModifiers: descriptor.keyModifiers } : {}
    };
    return config;
  }
  parseEventDescriptor(raw) {
    const parts = raw.split(".").map((part) => part.trim()).filter(Boolean);
    const event = parts.shift() ?? "";
    return { event, keyModifiers: parts };
  }
  matchesKeyModifiers(event, keyModifiers) {
    if (!keyModifiers || keyModifiers.length === 0) {
      return true;
    }
    if (!(event instanceof KeyboardEvent)) {
      return false;
    }
    const modifierChecks = {
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      control: event.ctrlKey,
      alt: event.altKey,
      meta: event.metaKey
    };
    const keyAliases = {
      esc: "escape",
      escape: "escape",
      enter: "enter",
      tab: "tab",
      space: "space",
      spacebar: "space",
      up: "arrowup",
      down: "arrowdown",
      left: "arrowleft",
      right: "arrowright",
      arrowup: "arrowup",
      arrowdown: "arrowdown",
      arrowleft: "arrowleft",
      arrowright: "arrowright",
      delete: "delete",
      backspace: "backspace"
    };
    let key = event.key?.toLowerCase() ?? "";
    if (key === " ") {
      key = "space";
    }
    for (const rawModifier of keyModifiers) {
      const modifier = rawModifier.toLowerCase();
      if (modifier in modifierChecks) {
        if (!modifierChecks[modifier]) {
          return false;
        }
        continue;
      }
      const expectedKey = keyAliases[modifier] ?? modifier;
      if (key !== expectedKey) {
        return false;
      }
    }
    return true;
  }
  attachOnHandler(element, config) {
    const handler = async (event) => {
      if (!this.matchesKeyModifiers(event, config.keyModifiers)) {
        return;
      }
      this.applyEventModifiers(event, config.modifiers);
      const scope = this.getScope(element);
      await this.execute(config.code, scope, element);
      this.evaluate(element);
    };
    const effectiveHandler = config.debounceMs ? debounce(handler, config.debounceMs) : handler;
    element.addEventListener(config.event, effectiveHandler, this.getListenerOptions(config.modifiers));
  }
  attachBehaviorOnHandler(element, event, body, modifiers, behaviorId) {
    const descriptor = this.parseEventDescriptor(event);
    const handler = async (evt) => {
      if (!this.matchesKeyModifiers(evt, descriptor.keyModifiers)) {
        return;
      }
      this.applyEventModifiers(evt, modifiers);
      const scope = this.getScope(element);
      await this.executeBlock(body, scope, element);
      this.evaluate(element);
    };
    const options = this.getListenerOptions(modifiers);
    element.addEventListener(descriptor.event, handler, options);
    const listenerMap = this.behaviorListeners.get(element) ?? /* @__PURE__ */ new Map();
    const listeners = listenerMap.get(behaviorId) ?? [];
    listeners.push({ event: descriptor.event, handler, options });
    listenerMap.set(behaviorId, listeners);
    this.behaviorListeners.set(element, listenerMap);
  }
  attachGetHandler(element, autoLoad = false) {
    const handler = async () => {
      const config = this.getBindings.get(element);
      if (!config) {
        return;
      }
      try {
        await applyGet(element, config, this.getScope(element), (target) => {
          if (config.trusted) {
            this.handleTrustedHtml(target);
          }
        });
      } catch (error) {
        console.warn("vsn:getError", error);
        element.dispatchEvent(new CustomEvent("vsn:getError", { detail: { error }, bubbles: true }));
      }
    };
    element.addEventListener("click", (event) => {
      if (event.target !== element) {
        return;
      }
      void handler();
    });
    if (autoLoad) {
      Promise.resolve().then(handler);
    }
  }
  applyEventModifiers(event, modifiers) {
    if (!event || !modifiers || modifiers.length === 0) {
      return;
    }
    for (const modifier of modifiers) {
      if (modifier === "prevent") {
        event.preventDefault();
      } else if (modifier === "stop") {
        event.stopPropagation();
      }
    }
  }
  getListenerOptions(modifiers) {
    if (!modifiers || modifiers.length === 0) {
      return void 0;
    }
    const options = {};
    if (modifiers.includes("once")) {
      options.once = true;
    }
    if (modifiers.includes("passive")) {
      options.passive = true;
    }
    if (modifiers.includes("capture")) {
      options.capture = true;
    }
    return Object.keys(options).length > 0 ? options : void 0;
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
    const cached = this.getCachedBehavior(behavior);
    this.behaviorRegistry.push({
      id: this.behaviorId += 1,
      selector,
      specificity: this.computeSpecificity(selector),
      order: this.behaviorRegistry.length,
      ...cached
    });
    this.collectNestedBehaviors(behavior.body, selector);
  }
  collectNestedBehaviors(block, parentSelector) {
    for (const statement of block.statements) {
      if (statement instanceof BehaviorNode) {
        this.collectBehavior(statement, parentSelector);
        continue;
      }
      if (statement instanceof OnBlockNode) {
        this.collectNestedBehaviors(statement.body, parentSelector);
        continue;
      }
      if (statement instanceof BlockNode) {
        this.collectNestedBehaviors(statement, parentSelector);
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
        blocks.push({ event: statement.eventName, body: statement.body, modifiers: statement.modifiers });
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
  extractFunctionDeclarations(body) {
    const functions = [];
    for (const statement of body.statements) {
      if (statement instanceof FunctionDeclarationNode) {
        functions.push({ name: statement.name, params: statement.params, body: statement.body });
        continue;
      }
      if (statement instanceof AssignmentNode) {
        if (statement.target instanceof IdentifierExpression && statement.value instanceof FunctionExpression) {
          functions.push({
            name: statement.target.name,
            params: statement.value.params,
            body: statement.value.body
          });
        }
      }
    }
    return functions;
  }
  getCachedBehavior(behavior) {
    const hash = this.hashBehavior(behavior);
    const cached = this.behaviorCache.get(hash);
    if (cached) {
      return cached;
    }
    const lifecycle = this.extractLifecycle(behavior.body);
    const fresh = {
      onBlocks: this.extractOnBlocks(behavior.body),
      declarations: this.extractDeclarations(behavior.body),
      functions: this.extractFunctionDeclarations(behavior.body),
      ...lifecycle
    };
    this.behaviorCache.set(hash, fresh);
    return fresh;
  }
  hashBehavior(behavior) {
    const normalized = this.normalizeNode(behavior);
    const json = JSON.stringify(normalized);
    return this.hashString(json);
  }
  normalizeNode(node) {
    if (!node || typeof node !== "object") {
      return node;
    }
    const type = node.type ?? "Unknown";
    if (type === "Behavior") {
      return {
        type,
        selector: node.selector?.selectorText ?? "",
        body: this.normalizeNode(node.body)
      };
    }
    if (type === "Selector") {
      return { type, selectorText: node.selectorText ?? "" };
    }
    if (type === "Block" || type === "Construct" || type === "Destruct") {
      return {
        type,
        statements: Array.isArray(node.statements) ? node.statements.map((statement) => this.normalizeNode(statement)) : []
      };
    }
    if (type === "OnBlock") {
      return {
        type,
        eventName: node.eventName ?? "",
        args: Array.isArray(node.args) ? node.args : [],
        body: this.normalizeNode(node.body)
      };
    }
    if (type === "Declaration") {
      return {
        type,
        target: this.normalizeNode(node.target),
        operator: node.operator ?? "",
        value: this.normalizeNode(node.value),
        flags: node.flags ?? {},
        flagArgs: node.flagArgs ?? {}
      };
    }
    if (type === "Assignment") {
      return {
        type,
        target: this.normalizeNode(node.target),
        value: this.normalizeNode(node.value)
      };
    }
    if (type === "StateBlock") {
      return {
        type,
        entries: Array.isArray(node.entries) ? node.entries.map((entry) => this.normalizeNode(entry)) : []
      };
    }
    if (type === "StateEntry") {
      return {
        type,
        name: node.name ?? "",
        value: this.normalizeNode(node.value),
        important: Boolean(node.important)
      };
    }
    if (type === "FunctionDeclaration") {
      return {
        type,
        name: node.name ?? "",
        params: Array.isArray(node.params) ? node.params : [],
        body: this.normalizeNode(node.body),
        isAsync: Boolean(node.isAsync)
      };
    }
    if (type === "FunctionExpression") {
      return {
        type,
        params: Array.isArray(node.params) ? node.params : [],
        body: this.normalizeNode(node.body),
        isAsync: Boolean(node.isAsync)
      };
    }
    if (type === "Return") {
      return {
        type,
        value: this.normalizeNode(node.value ?? null)
      };
    }
    if (type === "Identifier") {
      return { type, name: node.name ?? "" };
    }
    if (type === "Literal") {
      return { type, value: node.value };
    }
    if (type === "UnaryExpression") {
      return {
        type,
        operator: node.operator ?? "",
        argument: this.normalizeNode(node.argument)
      };
    }
    if (type === "BinaryExpression") {
      return {
        type,
        operator: node.operator ?? "",
        left: this.normalizeNode(node.left),
        right: this.normalizeNode(node.right)
      };
    }
    if (type === "TernaryExpression") {
      return {
        type,
        test: this.normalizeNode(node.test),
        consequent: this.normalizeNode(node.consequent),
        alternate: this.normalizeNode(node.alternate)
      };
    }
    if (type === "MemberExpression") {
      return {
        type,
        target: this.normalizeNode(node.target),
        property: node.property ?? ""
      };
    }
    if (type === "CallExpression") {
      return {
        type,
        callee: this.normalizeNode(node.callee),
        args: Array.isArray(node.args) ? node.args.map((arg) => this.normalizeNode(arg)) : []
      };
    }
    if (type === "AwaitExpression") {
      return {
        type,
        argument: this.normalizeNode(node.argument)
      };
    }
    if (type === "Directive") {
      return { type, kind: node.kind ?? "", name: node.name ?? "" };
    }
    if (type === "Query") {
      return { type, direction: node.direction ?? "", selector: node.selector ?? "" };
    }
    if (type === "ArrayExpression") {
      return {
        type,
        elements: Array.isArray(node.elements) ? node.elements.map((element) => this.normalizeNode(element)) : []
      };
    }
    if (type === "IndexExpression") {
      return {
        type,
        target: this.normalizeNode(node.target),
        index: this.normalizeNode(node.index)
      };
    }
    return { type };
  }
  hashString(value) {
    let hash = 5381;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) + hash + value.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0).toString(16);
  }
  applyBehaviorFunctions(element, scope, functions) {
    for (const declaration of functions) {
      this.applyBehaviorFunction(element, scope, declaration);
    }
  }
  applyBehaviorFunction(element, scope, declaration) {
    const existing = scope.getPath(declaration.name);
    if (existing !== void 0 && typeof existing !== "function") {
      throw new Error(`Cannot override non-function '${declaration.name}' with a function`);
    }
    const fn = async (...args) => {
      const context = {
        scope,
        globals: this.globals,
        element,
        returnValue: void 0,
        returning: false
      };
      const previousValues = /* @__PURE__ */ new Map();
      for (let i = 0; i < declaration.params.length; i += 1) {
        const name = declaration.params[i];
        if (!name) {
          continue;
        }
        previousValues.set(name, scope.getPath(name));
        scope.setPath(name, args[i]);
      }
      await declaration.body.evaluate(context);
      for (const name of declaration.params) {
        if (!name) {
          continue;
        }
        scope.setPath(name, previousValues.get(name));
      }
      return context.returnValue;
    };
    scope.setPath(declaration.name, fn);
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
    if (importantKey && this.isInlineDeclaration(element, importantKey)) {
      return;
    }
    this.applyCustomFlags(element, scope, declaration);
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
      const shouldWatch2 = operator === ":<" || operator === ":=";
      if (shouldWatch2) {
        this.applyDirectiveFromExpression(
          element,
          target,
          declaration.value,
          scope,
          declaration.flags.trusted,
          debounceMs
        );
      }
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
  applyCustomFlags(element, scope, declaration) {
    if (this.flagHandlers.size === 0) {
      return;
    }
    for (const [name, handler] of this.flagHandlers) {
      if (!declaration.flags[name]) {
        continue;
      }
      handler.onApply?.({
        name,
        args: declaration.flagArgs[name],
        element,
        scope,
        declaration
      });
    }
  }
  applyDirectiveFromScope(element, target, expr, scope, trusted, debounceMs, watch = true) {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      const handler2 = () => applyHtml(element, expr, scope, Boolean(trusted));
      handler2();
      if (trusted) {
        this.handleTrustedHtml(element);
      }
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
  applyDirectiveFromExpression(element, target, expr, scope, trusted, debounceMs) {
    const handler = async () => {
      const context = { scope, element };
      const value = await expr.evaluate(context);
      this.setDirectiveValue(element, target, value, trusted);
    };
    void handler();
    this.watchAllScopes(scope, () => {
      void handler();
    }, debounceMs);
  }
  applyDirectiveToScope(element, target, expr, scope, debounceMs) {
    if (target.kind === "attr" && target.name === "value") {
      this.applyValueBindingToScope(element, expr, debounceMs);
      return;
    }
    if (target.kind === "attr" && target.name === "checked") {
      this.applyCheckedBindingToScope(element, expr, debounceMs);
      return;
    }
    const value = this.getDirectiveValue(element, target);
    if (value != null) {
      scope.set(expr, value);
    }
  }
  applyCheckedBindingToScope(element, expr, debounceMs) {
    if (!(element instanceof HTMLInputElement)) {
      return;
    }
    const handler = () => {
      const scope = this.getScope(element);
      if (!scope) {
        return;
      }
      scope.set(expr, element.checked);
    };
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    effectiveHandler();
    element.addEventListener("change", effectiveHandler);
    element.addEventListener("input", effectiveHandler);
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
      if (trusted) {
        this.handleTrustedHtml(element);
      }
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
        const checked = value === true || value === "true" || value === 1 || value === "1";
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
        return element.checked;
      }
      return element.getAttribute(target.name) ?? void 0;
    }
    if (target.kind === "style" && element instanceof HTMLElement) {
      return element.style.getPropertyValue(target.name) ?? void 0;
    }
    return void 0;
  }
  handleTrustedHtml(root) {
    const scripts = Array.from(root.querySelectorAll('script[type="text/vsn"]'));
    if (scripts.length === 0) {
      return;
    }
    const source = scripts.map((script) => script.textContent ?? "").join("\n");
    if (!source.trim()) {
      return;
    }
    this.registerBehaviors(source);
    void this.applyBehaviors(root);
  }
  registerDefaultAttributeHandlers() {
    this.registerAttributeHandler({
      id: "vsn-bind",
      match: (name) => name.startsWith("vsn-bind"),
      handle: (element, name, value, scope) => {
        const direction = this.parseBindDirection(name);
        this.bindBindings.set(element, { expr: value, direction });
        if (direction === "to" || direction === "both") {
          this.markInlineDeclaration(element, `state:${value}`);
        }
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
        this.markInlineDeclaration(element, "attr:html");
        if (element instanceof HTMLElement) {
          applyHtml(element, value, scope, trusted);
          if (trusted) {
            this.handleTrustedHtml(element);
          }
        }
        this.watch(scope, value, () => this.evaluate(element));
      }
    });
    this.registerAttributeHandler({
      id: "vsn-each",
      match: (name) => name === "vsn-each",
      handle: (element, _name, value, scope) => {
        const config = this.parseEachExpression(value);
        if (!config) {
          return;
        }
        this.eachBindings.set(element, { ...config, rendered: [] });
        this.renderEach(element);
        this.watch(scope, config.listExpr, () => this.renderEach(element));
      }
    });
    this.registerAttributeHandler({
      id: "vsn-get",
      match: (name) => name.startsWith("vsn-get"),
      handle: (element, name) => {
        const trusted = name.includes("!trusted");
        const autoLoad = name.includes("!load");
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
        this.attachGetHandler(element, autoLoad);
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
  const startTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  const mount = () => {
    const target = root instanceof Document ? root.body : root;
    if (target) {
      const sources = Array.from(document.querySelectorAll('script[type="text/vsn"]')).map((script) => script.textContent ?? "").join("\n");
      if (sources.trim()) {
        engine.registerBehaviors(sources);
      }
      engine.mount(target);
      const endTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
      const elapsedMs = Math.round(endTime - startTime);
      console.log(`Took ${elapsedMs}ms to start up VSN.js. https://www.vsnjs.com/ v${VERSION}`);
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
  ArrayExpression,
  AssignmentNode,
  AwaitExpression,
  BaseNode,
  BehaviorNode,
  BinaryExpression,
  BlockNode,
  CallExpression,
  DeclarationNode,
  DirectiveExpression,
  Engine,
  FunctionDeclarationNode,
  FunctionExpression,
  IdentifierExpression,
  IndexExpression,
  Lexer,
  LiteralExpression,
  MemberExpression,
  OnBlockNode,
  Parser,
  ProgramNode,
  QueryExpression,
  ReturnNode,
  SelectorNode,
  StateBlockNode,
  StateEntryNode,
  TernaryExpression,
  TokenType,
  UnaryExpression,
  UseNode,
  VERSION,
  autoMount,
  parseCFS
});
//# sourceMappingURL=index.cjs.map