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
  ArrayPattern: () => ArrayPattern,
  AssertError: () => AssertError,
  AssertNode: () => AssertNode,
  AssignmentNode: () => AssignmentNode,
  AwaitExpression: () => AwaitExpression,
  BaseNode: () => BaseNode,
  BehaviorNode: () => BehaviorNode,
  BinaryExpression: () => BinaryExpression,
  BlockNode: () => BlockNode,
  BreakNode: () => BreakNode,
  CallExpression: () => CallExpression,
  ContinueNode: () => ContinueNode,
  DeclarationNode: () => DeclarationNode,
  DirectiveExpression: () => DirectiveExpression,
  ElementDirectiveExpression: () => ElementDirectiveExpression,
  ElementPropertyExpression: () => ElementPropertyExpression,
  ElementRefExpression: () => ElementRefExpression,
  Engine: () => Engine,
  ForEachNode: () => ForEachNode,
  ForNode: () => ForNode,
  FunctionDeclarationNode: () => FunctionDeclarationNode,
  FunctionExpression: () => FunctionExpression,
  IdentifierExpression: () => IdentifierExpression,
  IfNode: () => IfNode,
  IndexExpression: () => IndexExpression,
  Lexer: () => Lexer,
  Lifetime: () => Lifetime,
  LiteralExpression: () => LiteralExpression,
  MemberExpression: () => MemberExpression,
  ObjectExpression: () => ObjectExpression,
  ObjectPattern: () => ObjectPattern,
  OnBlockNode: () => OnBlockNode,
  Parser: () => Parser,
  ProgramNode: () => ProgramNode,
  QueryExpression: () => QueryExpression,
  RestElement: () => RestElement,
  ReturnNode: () => ReturnNode,
  Scope: () => Scope,
  SelectorNode: () => SelectorNode,
  SpreadElement: () => SpreadElement,
  TaggedTemplateExpression: () => TaggedTemplateExpression,
  TemplateExpression: () => TemplateExpression,
  TernaryExpression: () => TernaryExpression,
  TokenType: () => TokenType,
  TryNode: () => TryNode,
  UnaryExpression: () => UnaryExpression,
  UseNode: () => UseNode,
  VERSION: () => VERSION,
  WhileNode: () => WhileNode,
  autoMount: () => autoMount,
  batch: () => batch,
  computed: () => computed,
  effect: () => effect,
  isAbortError: () => isAbortError,
  parseCFS: () => parseCFS,
  throwIfAborted: () => throwIfAborted
});
module.exports = __toCommonJS(index_exports);

// src/parser/token.ts
var TokenType = /* @__PURE__ */ ((TokenType2) => {
  TokenType2["Whitespace"] = "Whitespace";
  TokenType2["Identifier"] = "Identifier";
  TokenType2["Number"] = "Number";
  TokenType2["String"] = "String";
  TokenType2["Template"] = "Template";
  TokenType2["Boolean"] = "Boolean";
  TokenType2["Null"] = "Null";
  TokenType2["Behavior"] = "Behavior";
  TokenType2["Use"] = "Use";
  TokenType2["State"] = "State";
  TokenType2["On"] = "On";
  TokenType2["Construct"] = "Construct";
  TokenType2["Destruct"] = "Destruct";
  TokenType2["Return"] = "Return";
  TokenType2["If"] = "If";
  TokenType2["Else"] = "Else";
  TokenType2["For"] = "For";
  TokenType2["While"] = "While";
  TokenType2["Try"] = "Try";
  TokenType2["Catch"] = "Catch";
  TokenType2["Assert"] = "Assert";
  TokenType2["Break"] = "Break";
  TokenType2["Continue"] = "Continue";
  TokenType2["LBrace"] = "LBrace";
  TokenType2["RBrace"] = "RBrace";
  TokenType2["LParen"] = "LParen";
  TokenType2["RParen"] = "RParen";
  TokenType2["LBracket"] = "LBracket";
  TokenType2["RBracket"] = "RBracket";
  TokenType2["Colon"] = "Colon";
  TokenType2["Semicolon"] = "Semicolon";
  TokenType2["Comma"] = "Comma";
  TokenType2["Ellipsis"] = "Ellipsis";
  TokenType2["Dot"] = "Dot";
  TokenType2["Hash"] = "Hash";
  TokenType2["Greater"] = "Greater";
  TokenType2["Less"] = "Less";
  TokenType2["Plus"] = "Plus";
  TokenType2["PlusPlus"] = "PlusPlus";
  TokenType2["Minus"] = "Minus";
  TokenType2["MinusMinus"] = "MinusMinus";
  TokenType2["Tilde"] = "Tilde";
  TokenType2["Star"] = "Star";
  TokenType2["Slash"] = "Slash";
  TokenType2["Percent"] = "Percent";
  TokenType2["Equals"] = "Equals";
  TokenType2["Arrow"] = "Arrow";
  TokenType2["DoubleEquals"] = "DoubleEquals";
  TokenType2["TripleEquals"] = "TripleEquals";
  TokenType2["NotEquals"] = "NotEquals";
  TokenType2["StrictNotEquals"] = "StrictNotEquals";
  TokenType2["LessEqual"] = "LessEqual";
  TokenType2["GreaterEqual"] = "GreaterEqual";
  TokenType2["And"] = "And";
  TokenType2["Or"] = "Or";
  TokenType2["Pipe"] = "Pipe";
  TokenType2["NullishCoalesce"] = "NullishCoalesce";
  TokenType2["OptionalChain"] = "OptionalChain";
  TokenType2["Bang"] = "Bang";
  TokenType2["Ampersand"] = "Ampersand";
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
  if: "If" /* If */,
  else: "Else" /* Else */,
  for: "For" /* For */,
  while: "While" /* While */,
  try: "Try" /* Try */,
  catch: "Catch" /* Catch */,
  assert: "Assert" /* Assert */,
  break: "Break" /* Break */,
  continue: "Continue" /* Continue */,
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
  pendingTokens = [];
  templateMode = false;
  templateExpressionMode = false;
  templateBraceDepth = 0;
  tokenize() {
    const tokens = [];
    while (!this.eof()) {
      if (this.pendingTokens.length > 0) {
        const pending = this.pendingTokens.shift();
        if (pending) {
          tokens.push(pending);
          this.trackTemplateBrace(pending);
          continue;
        }
      }
      if (this.templateMode) {
        const chunk = this.readTemplateChunk();
        tokens.push(chunk);
        continue;
      }
      const ch = this.peek();
      if (this.isWhitespace(ch)) {
        tokens.push(this.readWhitespace());
        continue;
      }
      if (ch === "`") {
        this.next();
        this.templateMode = true;
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
        this.trackTemplateBrace(punct);
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
    const start = this.position();
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
    throw new Error(`Unterminated block comment at ${start.line}:${start.column}`);
  }
  readIdentifier() {
    const start = this.position();
    let value = "";
    while (!this.eof()) {
      const ch = this.peek();
      if (this.isAlphaNumeric(ch) || ch === "_") {
        value += this.next();
        continue;
      }
      if (ch === "-") {
        if (this.peek(1) === "-") {
          break;
        }
        value += this.next();
        continue;
      }
      break;
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
    const start = this.position();
    const quote = this.next();
    let value = "";
    let raw = quote;
    while (!this.eof()) {
      const ch = this.next();
      raw += ch;
      if (ch === "\\") {
        const escaped = this.next();
        raw += escaped;
        value += escaped;
        continue;
      }
      if (ch === quote) {
        return this.token("String" /* String */, value, start, raw);
      }
      value += ch;
    }
    throw new Error(`Unterminated string at ${start.line}:${start.column}`);
  }
  readTemplateChunk() {
    const start = this.position();
    let value = "";
    while (!this.eof()) {
      const ch = this.peek();
      if (ch === "`") {
        this.next();
        this.templateMode = false;
        return this.token("Template" /* Template */, value, start);
      }
      if (ch === "$" && this.peek(1) === "{") {
        const dollarStart = this.position();
        this.next();
        const braceStart = this.position();
        this.next();
        this.templateMode = false;
        this.templateExpressionMode = true;
        this.templateBraceDepth = 0;
        this.pendingTokens.push(this.token("Dollar" /* Dollar */, "$", dollarStart));
        this.pendingTokens.push(this.token("LBrace" /* LBrace */, "{", braceStart));
        return this.token("Template" /* Template */, value, start);
      }
      if (ch === "\\") {
        this.next();
        const escaped = this.next();
        value += escaped;
        continue;
      }
      value += this.next();
    }
    throw new Error(`Unterminated template literal at ${start.line}:${start.column}`);
  }
  readPunctuator() {
    const start = this.position();
    const ch = this.peek();
    const next = this.peek(1);
    if (ch === "=" && next === "=" && this.peek(2) === "=") {
      this.next();
      this.next();
      this.next();
      return this.token("TripleEquals" /* TripleEquals */, "===", start);
    }
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
    if (ch === "!" && next === "=" && this.peek(2) === "=") {
      this.next();
      this.next();
      this.next();
      return this.token("StrictNotEquals" /* StrictNotEquals */, "!==", start);
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
    if (ch === "?" && next === "?") {
      this.next();
      this.next();
      return this.token("NullishCoalesce" /* NullishCoalesce */, "??", start);
    }
    if (ch === "?" && next === ".") {
      this.next();
      this.next();
      return this.token("OptionalChain" /* OptionalChain */, "?.", start);
    }
    if (ch === "|" && next === ">") {
      this.next();
      this.next();
      return this.token("Pipe" /* Pipe */, "|>", start);
    }
    if (ch === "+" && next === "+") {
      this.next();
      this.next();
      return this.token("PlusPlus" /* PlusPlus */, "++", start);
    }
    if (ch === "-" && next === "-") {
      this.next();
      this.next();
      return this.token("MinusMinus" /* MinusMinus */, "--", start);
    }
    if (ch === "." && next === "." && this.peek(2) === ".") {
      this.next();
      this.next();
      this.next();
      return this.token("Ellipsis" /* Ellipsis */, "...", start);
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
      "/": "Slash" /* Slash */,
      "%": "Percent" /* Percent */,
      "=": "Equals" /* Equals */,
      "!": "Bang" /* Bang */,
      "@": "At" /* At */,
      "$": "Dollar" /* Dollar */,
      "?": "Question" /* Question */,
      "&": "Ampersand" /* Ampersand */
    };
    const type = punctMap[ch];
    if (!type) {
      return null;
    }
    this.next();
    return this.token(type, ch, start);
  }
  trackTemplateBrace(token) {
    if (!this.templateExpressionMode) {
      return;
    }
    if (token.type === "LBrace" /* LBrace */) {
      this.templateBraceDepth += 1;
    } else if (token.type === "RBrace" /* RBrace */) {
      this.templateBraceDepth -= 1;
      if (this.templateBraceDepth <= 0) {
        this.templateExpressionMode = false;
        this.templateMode = true;
      }
    }
  }
  token(type, value, start, raw) {
    return {
      type,
      value,
      ...raw !== void 0 ? { raw } : {},
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

// src/runtime/lifetime.ts
function isAbortError(error) {
  return Boolean(
    error && typeof error === "object" && "name" in error && error.name === "AbortError"
  );
}
function throwIfAborted(signal) {
  if (!signal?.aborted) {
    return;
  }
  if (signal.reason) {
    throw signal.reason;
  }
  const error = new Error("The operation was aborted");
  error.name = "AbortError";
  throw error;
}
var Lifetime = class _Lifetime {
  entries = /* @__PURE__ */ new Set();
  disposed = false;
  disposing = false;
  controller = new AbortController();
  get isDisposed() {
    return this.disposed;
  }
  get signal() {
    return this.controller.signal;
  }
  /** True while registered cleanup callbacks are being invoked. */
  get isDisposing() {
    return this.disposing;
  }
  add(disposer) {
    if (typeof disposer !== "function") {
      throw new TypeError("Lifetime disposers must be functions");
    }
    if (this.disposed) {
      disposer();
      return () => void 0;
    }
    const entry = { disposer, active: true };
    this.entries.add(entry);
    return () => {
      if (!entry.active) {
        return;
      }
      entry.active = false;
      this.entries.delete(entry);
    };
  }
  onCleanup(disposer) {
    return this.add(disposer);
  }
  child() {
    const child = new _Lifetime();
    const removeChild = this.add(() => child.dispose());
    child.add(removeChild);
    return child;
  }
  dispose() {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.controller.abort();
    this.disposing = true;
    const errors = [];
    const entries = Array.from(this.entries).reverse();
    this.entries.clear();
    try {
      for (const entry of entries) {
        if (!entry.active) {
          continue;
        }
        entry.active = false;
        try {
          entry.disposer();
        } catch (error) {
          errors.push(error);
        }
      }
    } finally {
      this.disposing = false;
    }
    if (errors.length === 1) {
      throw errors[0];
    }
    if (errors.length > 1) {
      throw new AggregateError(errors, "One or more lifetime disposers failed");
    }
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
  evaluate(_context) {
    return void 0;
  }
};
function isPromiseLike(value) {
  return Boolean(value) && typeof value.then === "function";
}
function resolveMaybe(value, next, signal) {
  throwIfAborted(signal);
  if (isPromiseLike(value)) {
    return value.then((resolved) => {
      throwIfAborted(signal);
      return next(resolved);
    });
  }
  return next(value);
}
function evaluateWithChildScope(context, block) {
  const scope = context.scope;
  if (!scope || !scope.createChild) {
    return block.evaluate(context);
  }
  throwIfAborted(context.signal);
  const previousScope = context.scope;
  context.scope = scope.createChild();
  let result;
  try {
    result = block.evaluate(context);
  } catch (error) {
    context.scope = previousScope;
    throw error;
  }
  if (isPromiseLike(result)) {
    return result.finally(() => {
      context.scope = previousScope;
    });
  }
  context.scope = previousScope;
  return result;
}
var ProgramNode = class extends BaseNode {
  constructor(behaviors, uses = []) {
    super("Program");
    this.behaviors = behaviors;
    this.uses = uses;
  }
};
var UseNode = class extends BaseNode {
  constructor(name, alias, flags = {}, flagArgs = {}) {
    super("Use");
    this.name = name;
    this.alias = alias;
    this.flags = flags;
    this.flagArgs = flagArgs;
  }
};
var BlockNode = class extends BaseNode {
  constructor(statements) {
    super("Block");
    this.statements = statements;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    let index = 0;
    const run = () => {
      throwIfAborted(context.signal);
      while (index < this.statements.length) {
        throwIfAborted(context.signal);
        if (context.returning || context.breaking || context.continuing) {
          break;
        }
        const statement = this.statements[index];
        index += 1;
        if (statement && typeof statement.evaluate === "function") {
          const result = statement.evaluate(context);
          if (isPromiseLike(result)) {
            return result.then(() => {
              throwIfAborted(context.signal);
              return run();
            });
          }
        }
      }
      return void 0;
    };
    return run();
  }
};
var SelectorNode = class extends BaseNode {
  constructor(selectorText) {
    super("Selector");
    this.selectorText = selectorText;
  }
};
var BehaviorNode = class extends BaseNode {
  constructor(selector, body, flags = {}, flagArgs = {}) {
    super("Behavior");
    this.selector = selector;
    this.body = body;
    this.flags = flags;
    this.flagArgs = flagArgs;
  }
};
var OnBlockNode = class extends BaseNode {
  constructor(eventName, args, body, flags = {}, flagArgs = {}) {
    super("OnBlock");
    this.eventName = eventName;
    this.args = args;
    this.body = body;
    this.flags = flags;
    this.flagArgs = flagArgs;
  }
};
var AssignmentNode = class extends BaseNode {
  constructor(target, value, operator = "=", prefix = false) {
    super("Assignment");
    this.target = target;
    this.value = value;
    this.operator = operator;
    this.prefix = prefix;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const target = this.target;
    if (target instanceof DirectiveExpression) {
      const value2 = this.value.evaluate(context);
      return resolveMaybe(value2, (resolvedValue) => {
        throwIfAborted(context.signal);
        this.assignDirectiveTarget(context, target, resolvedValue, this.operator);
        return resolvedValue;
      }, context.signal);
    }
    if (target instanceof ElementDirectiveExpression) {
      const elementValue = target.element.evaluate(context);
      return resolveMaybe(elementValue, (resolvedElement) => {
        throwIfAborted(context.signal);
        const element = resolveElementFromReference(resolvedElement);
        if (!element) {
          return void 0;
        }
        const value2 = this.value.evaluate(context);
        return resolveMaybe(value2, (resolvedValue) => {
          throwIfAborted(context.signal);
          this.assignDirectiveTarget(
            { ...context, element },
            target.directive,
            resolvedValue,
            this.operator
          );
          return resolvedValue;
        }, context.signal);
      }, context.signal);
    }
    if (!context.scope || !context.scope.setPath) {
      return void 0;
    }
    if (this.operator === "++" || this.operator === "--") {
      return this.applyIncrement(context);
    }
    const value = this.value.evaluate(context);
    return resolveMaybe(value, (resolvedValue) => {
      throwIfAborted(context.signal);
      if (this.operator !== "=") {
        return this.applyCompoundAssignment(context, resolvedValue);
      }
      if (this.target instanceof IdentifierExpression && this.target.name.startsWith("root.") && context.rootScope) {
        const path = this.target.name.slice("root.".length);
        context.rootScope.setPath?.(`self.${path}`, resolvedValue);
        return resolvedValue;
      }
      if (this.target instanceof MemberExpression || this.target instanceof IndexExpression) {
        const resolved = this.resolveAssignmentTarget(context);
        return resolveMaybe(resolved, (resolvedTarget) => {
          throwIfAborted(context.signal);
          if (resolvedTarget?.scope?.setPath) {
            resolvedTarget.scope.setPath(resolvedTarget.path, resolvedValue);
            return resolvedValue;
          }
          this.assignTarget(context, this.target, resolvedValue);
          return resolvedValue;
        }, context.signal);
      }
      this.assignTarget(context, this.target, resolvedValue, this.operator);
      return resolvedValue;
    }, context.signal);
  }
  applyCompoundAssignment(context, value) {
    if (!context.scope || !context.scope.setPath) {
      return void 0;
    }
    const resolved = this.resolveAssignmentTarget(context);
    return resolveMaybe(resolved, (resolvedTarget) => {
      throwIfAborted(context.signal);
      if (!resolvedTarget) {
        throw new Error("Compound assignment requires a simple identifier or member path");
      }
      const { scope, path } = resolvedTarget;
      const current = scope?.getPath ? scope.getPath(path) : void 0;
      let result;
      if (this.operator === "+=") {
        result = current + value;
      } else if (this.operator === "-=") {
        result = current - value;
      } else if (this.operator === "*=") {
        result = current * value;
      } else {
        result = current / value;
      }
      scope?.setPath?.(path, result);
      return result;
    }, context.signal);
  }
  applyIncrement(context) {
    if (!context.scope || !context.scope.setPath) {
      return void 0;
    }
    const resolved = this.resolveAssignmentTarget(context);
    return resolveMaybe(resolved, (resolvedTarget) => {
      throwIfAborted(context.signal);
      if (!resolvedTarget) {
        throw new Error("Increment/decrement requires a simple identifier or member path");
      }
      const { scope, path } = resolvedTarget;
      const current = scope?.getPath ? scope.getPath(path) : void 0;
      const numeric = typeof current === "number" ? current : Number(current);
      const delta = this.operator === "++" ? 1 : -1;
      const next = (Number.isNaN(numeric) ? 0 : numeric) + delta;
      scope?.setPath?.(path, next);
      return this.prefix ? next : numeric;
    }, context.signal);
  }
  resolveAssignmentTarget(context) {
    if (this.target instanceof IdentifierExpression) {
      const isRoot = this.target.name.startsWith("root.");
      const rawPath = isRoot ? this.target.name.slice("root.".length) : this.target.name;
      if (isRoot) {
        if (context.rootScope) {
          return { scope: context.rootScope, path: `self.${rawPath}` };
        }
        return { scope: context.scope, path: `root.${rawPath}` };
      }
      return { scope: context.scope, path: rawPath };
    }
    if (this.target instanceof MemberExpression) {
      const resolvedPath = this.target.getIdentifierPath();
      if (resolvedPath) {
        const path = resolvedPath.path;
        const isRoot = path.startsWith("root.");
        const rawPath = isRoot ? path.slice("root.".length) : path;
        if (isRoot) {
          if (context.rootScope) {
            return { scope: context.rootScope, path: `self.${rawPath}` };
          }
          return { scope: context.scope, path: `root.${rawPath}` };
        }
        return { scope: context.scope, path: rawPath };
      }
      const targetExpr = this.target;
      const basePath = this.resolveTargetPath(context, targetExpr.target);
      return resolveMaybe(basePath, (resolvedBase) => {
        throwIfAborted(context.signal);
        if (!resolvedBase) {
          return null;
        }
        const path = `${resolvedBase}.${targetExpr.property}`;
        const isRoot = path.startsWith("root.");
        const rawPath = isRoot ? path.slice("root.".length) : path;
        if (isRoot) {
          if (context.rootScope) {
            return { scope: context.rootScope, path: `self.${rawPath}` };
          }
          return { scope: context.scope, path: `root.${rawPath}` };
        }
        return { scope: context.scope, path: rawPath };
      }, context.signal);
    }
    if (this.target instanceof IndexExpression) {
      const path = this.resolveIndexPath(context, this.target);
      return resolveMaybe(path, (resolvedPath) => {
        throwIfAborted(context.signal);
        if (!resolvedPath) {
          return null;
        }
        const isRoot = resolvedPath.startsWith("root.");
        const rawPath = isRoot ? resolvedPath.slice("root.".length) : resolvedPath;
        if (isRoot) {
          if (context.rootScope) {
            return { scope: context.rootScope, path: `self.${rawPath}` };
          }
          return { scope: context.scope, path: `root.${rawPath}` };
        }
        return { scope: context.scope, path: rawPath };
      }, context.signal);
    }
    return null;
  }
  resolveIndexPath(context, expr) {
    const base = this.resolveTargetPath(context, expr.target);
    return resolveMaybe(base, (resolvedBase) => {
      throwIfAborted(context.signal);
      if (!resolvedBase) {
        return null;
      }
      const indexValue = expr.index.evaluate(context);
      return resolveMaybe(indexValue, (resolvedIndex) => {
        throwIfAborted(context.signal);
        if (resolvedIndex == null) {
          return null;
        }
        return `${resolvedBase}.${resolvedIndex}`;
      }, context.signal);
    }, context.signal);
  }
  resolveTargetPath(context, target) {
    if (target instanceof IdentifierExpression) {
      return target.name;
    }
    if (target instanceof MemberExpression) {
      return target.getIdentifierPath()?.path ?? null;
    }
    if (target instanceof IndexExpression) {
      return this.resolveIndexPath(context, target);
    }
    return null;
  }
  assignTarget(context, target, value, operator = "=") {
    if (!context.scope || !context.scope.setPath) {
      return;
    }
    throwIfAborted(context.signal);
    if (target instanceof DirectiveExpression) {
      this.assignDirectiveTarget(context, target, value, operator);
      return;
    }
    if (target instanceof ElementDirectiveExpression) {
      const elementValue = target.element.evaluate(context);
      const next = resolveMaybe(elementValue, (resolvedElement) => {
        throwIfAborted(context.signal);
        const element = resolveElementFromReference(resolvedElement);
        if (!element) {
          return;
        }
        this.assignDirectiveTarget(
          { ...context, element },
          target.directive,
          value,
          operator
        );
      }, context.signal);
      if (isPromiseLike(next)) {
        void next;
      }
      return;
    }
    if (target instanceof ElementPropertyExpression) {
      const elementValue = target.element.evaluate(context);
      const next = resolveMaybe(elementValue, (resolvedElement) => {
        throwIfAborted(context.signal);
        if (resolvedElement && typeof resolvedElement === "object" && resolvedElement.__scope) {
          resolvedElement.__scope.setPath?.(target.property, value);
          return;
        }
        const element = resolveElementFromReference(resolvedElement);
        if (!element) {
          return;
        }
        element[target.property] = value;
      }, context.signal);
      if (isPromiseLike(next)) {
        void next;
      }
      return;
    }
    if (target instanceof IdentifierExpression) {
      throwIfAborted(context.signal);
      context.scope.setPath(target.name, value);
      return;
    }
    if (target instanceof ArrayPattern) {
      const source = Array.isArray(value) ? value : [];
      let index = 0;
      for (const element of target.elements) {
        if (element instanceof RestElement) {
          context.scope.setPath(element.target.name, source.slice(index));
          return;
        }
        if (element === null) {
          index += 1;
          continue;
        }
        this.assignTarget(context, element, source[index], operator);
        index += 1;
      }
      return;
    }
    if (target instanceof ObjectPattern) {
      const source = value && typeof value === "object" ? value : {};
      const usedKeys = /* @__PURE__ */ new Set();
      for (const entry of target.entries) {
        if ("rest" in entry) {
          const rest = {};
          for (const key of Object.keys(source)) {
            if (!usedKeys.has(key)) {
              rest[key] = source[key];
            }
          }
          context.scope.setPath(entry.rest.name, rest);
          continue;
        }
        usedKeys.add(entry.key);
        this.assignTarget(context, entry.target, source[entry.key], operator);
      }
      return;
    }
  }
  assignDirectiveTarget(context, target, value, operator = "=") {
    throwIfAborted(context.signal);
    const element = context.element;
    if (!element) {
      return;
    }
    if (target.kind === "attr") {
      if (target.name === "class" && "classList" in element && operator !== "=") {
        const classes = normalizeClassList(value);
        if (classes.length === 0) {
          return;
        }
        if (operator === "+=") {
          element.classList.add(...classes);
          return;
        }
        if (operator === "-=") {
          element.classList.remove(...classes);
          return;
        }
        if (operator === "~=") {
          for (const name of classes) {
            element.classList.toggle(name);
          }
          return;
        }
      }
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
      if (target.name === "html" && element instanceof HTMLElement) {
        if (context.engine?.setHtml) {
          context.engine.setHtml(element, value);
          return;
        }
        element.innerHTML = value == null ? "" : String(value);
        return;
      }
      element.setAttribute(target.name, value == null ? "" : String(value));
      return;
    }
    if (target.kind === "style" && element instanceof HTMLElement) {
      element.style.setProperty(target.name, value == null ? "" : String(value));
    }
  }
};
function normalizeClassList(value) {
  if (value == null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => String(entry).split(/\s+/)).map((entry) => entry.trim()).filter(Boolean);
  }
  return String(value).split(/\s+/).map((entry) => entry.trim()).filter(Boolean);
}
var ReturnNode = class extends BaseNode {
  constructor(value) {
    super("Return");
    this.value = value;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    if (context.returning) {
      return context.returnValue;
    }
    const nextValue = this.value ? this.value.evaluate(context) : void 0;
    return resolveMaybe(nextValue, (resolved) => {
      throwIfAborted(context.signal);
      context.returnValue = resolved;
      context.returning = true;
      return context.returnValue;
    }, context.signal);
  }
};
var BreakNode = class extends BaseNode {
  constructor() {
    super("Break");
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    context.breaking = true;
    return void 0;
  }
};
var ContinueNode = class extends BaseNode {
  constructor() {
    super("Continue");
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    context.continuing = true;
    return void 0;
  }
};
var AssertError = class extends Error {
  constructor(message = "Assertion failed") {
    super(message);
    this.name = "AssertError";
  }
};
var AssertNode = class extends BaseNode {
  constructor(test) {
    super("Assert");
    this.test = test;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const value = this.test.evaluate(context);
    return resolveMaybe(value, (resolved) => {
      throwIfAborted(context.signal);
      if (!resolved) {
        throw new AssertError();
      }
      return resolved;
    }, context.signal);
  }
};
var IfNode = class extends BaseNode {
  constructor(test, consequent, alternate) {
    super("If");
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const condition = this.test.evaluate(context);
    return resolveMaybe(condition, (resolved) => {
      throwIfAborted(context.signal);
      if (resolved) {
        return evaluateWithChildScope(context, this.consequent);
      }
      if (this.alternate) {
        return evaluateWithChildScope(context, this.alternate);
      }
      return void 0;
    }, context.signal);
  }
};
var WhileNode = class extends BaseNode {
  constructor(test, body) {
    super("While");
    this.test = test;
    this.body = body;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const previousScope = context.scope;
    if (context.scope?.createChild) {
      context.scope = context.scope.createChild();
    }
    const run = () => {
      throwIfAborted(context.signal);
      const condition = this.test.evaluate(context);
      return resolveMaybe(condition, (resolved) => {
        throwIfAborted(context.signal);
        if (!resolved || context.returning) {
          return void 0;
        }
        const bodyResult = this.body.evaluate(context);
        return resolveMaybe(bodyResult, () => {
          throwIfAborted(context.signal);
          if (context.breaking) {
            context.breaking = false;
            return void 0;
          }
          if (context.continuing) {
            context.continuing = false;
          }
          return run();
        }, context.signal);
      }, context.signal);
    };
    const result = run();
    if (isPromiseLike(result)) {
      return result.finally(() => {
        context.scope = previousScope;
      });
    }
    context.scope = previousScope;
    return result;
  }
};
var ForEachNode = class extends BaseNode {
  constructor(target, iterable, kind, body) {
    super("ForEach");
    this.target = target;
    this.iterable = iterable;
    this.kind = kind;
    this.body = body;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const iterableValue = this.iterable.evaluate(context);
    return resolveMaybe(iterableValue, (resolved) => {
      throwIfAborted(context.signal);
      const entries = this.getEntries(resolved);
      const previousScope = context.scope;
      let bodyScope = context.scope;
      if (context.scope?.createChild) {
        bodyScope = context.scope.createChild();
      }
      let index = 0;
      const loop = () => {
        throwIfAborted(context.signal);
        if (index >= entries.length || context.returning) {
          context.scope = previousScope;
          return void 0;
        }
        const value = entries[index];
        index += 1;
        context.scope = bodyScope;
        context.scope?.setPath?.(this.target.name, value);
        const bodyResult = this.body.evaluate(context);
        return resolveMaybe(bodyResult, () => {
          throwIfAborted(context.signal);
          if (context.breaking) {
            context.breaking = false;
            context.scope = previousScope;
            return void 0;
          }
          if (context.continuing) {
            context.continuing = false;
          }
          context.scope = previousScope;
          return loop();
        }, context.signal);
      };
      return loop();
    }, context.signal);
  }
  getEntries(value) {
    if (value == null) {
      return [];
    }
    if (this.kind === "in") {
      if (typeof value === "object") {
        return Object.keys(value);
      }
      return [];
    }
    if (typeof value === "string") {
      return Array.from(value);
    }
    if (typeof value[Symbol.iterator] === "function") {
      return Array.from(value);
    }
    if (typeof value === "object") {
      return Object.values(value);
    }
    return [];
  }
};
var ForNode = class extends BaseNode {
  constructor(init, test, update, body) {
    super("For");
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const initResult = this.init ? this.init.evaluate(context) : void 0;
    const run = () => {
      throwIfAborted(context.signal);
      const previousScope = context.scope;
      let bodyScope = context.scope;
      if (context.scope?.createChild) {
        bodyScope = context.scope.createChild();
      }
      const loop = () => {
        throwIfAborted(context.signal);
        const testResult = this.test ? this.test.evaluate(context) : true;
        return resolveMaybe(testResult, (passed) => {
          throwIfAborted(context.signal);
          if (!passed || context.returning) {
            context.scope = previousScope;
            return void 0;
          }
          context.scope = bodyScope;
          const bodyResult = this.body.evaluate(context);
          return resolveMaybe(bodyResult, () => {
            throwIfAborted(context.signal);
            if (context.returning) {
              context.scope = previousScope;
              return void 0;
            }
            if (context.breaking) {
              context.breaking = false;
              context.scope = previousScope;
              return void 0;
            }
            context.scope = previousScope;
            if (context.continuing) {
              context.continuing = false;
            }
            const updateResult = this.update ? this.update.evaluate(context) : void 0;
            return resolveMaybe(updateResult, () => loop(), context.signal);
          }, context.signal);
        }, context.signal);
      };
      return loop();
    };
    return resolveMaybe(initResult, () => run(), context.signal);
  }
};
var TryNode = class extends BaseNode {
  constructor(body, errorName, handler) {
    super("Try");
    this.body = body;
    this.errorName = errorName;
    this.handler = handler;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const handleError = (error) => {
      throwIfAborted(context.signal);
      if (context.returning) {
        return context.returnValue;
      }
      const previousScope = context.scope;
      let handlerScope = context.scope;
      if (context.scope?.createChild) {
        handlerScope = context.scope.createChild();
      }
      context.scope = handlerScope;
      const scope = context.scope;
      let previous = void 0;
      if (scope) {
        previous = scope.getPath(this.errorName);
        if (scope.setPath) {
          scope.setPath(`self.${this.errorName}`, error);
        }
      }
      const handlerResult = this.handler.evaluate(context);
      return resolveMaybe(handlerResult, () => {
        throwIfAborted(context.signal);
        if (scope && scope.setPath && handlerScope === previousScope) {
          scope.setPath(this.errorName, previous);
        }
        context.scope = previousScope;
        return void 0;
      }, context.signal);
    };
    try {
      const bodyResult = evaluateWithChildScope(context, this.body);
      if (isPromiseLike(bodyResult)) {
        return bodyResult.catch((error) => handleError(error));
      }
      return bodyResult;
    } catch (error) {
      return handleError(error);
    }
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
  evaluate(context) {
    throwIfAborted(context.signal);
    const scope = context.scope;
    const globals = context.globals;
    const element = context.element;
    const lifetime = context.lifetime;
    if (this.isAsync) {
      return (...args) => {
        const activeScope = scope?.createChild ? scope.createChild() : scope;
        const invoke = () => {
          const signal = lifetime?.isDisposing ? void 0 : context.signal;
          const inner = {
            scope: activeScope,
            rootScope: context.rootScope,
            ...globals ? { globals } : {},
            ...context.engine ? { engine: context.engine } : {},
            ...element ? { element } : {},
            ...context.self ? { self: context.self } : {},
            ...lifetime ? { lifetime } : {},
            ...signal ? { signal } : {},
            returnValue: void 0,
            returning: false,
            breaking: false,
            continuing: false
          };
          const previousValues = /* @__PURE__ */ new Map();
          const applyResult = activeScope ? this.applyParams(activeScope, previousValues, inner, args) : void 0;
          const bodyResult = resolveMaybe(applyResult, () => this.body.evaluate(inner), inner.signal);
          const finalResult = resolveMaybe(bodyResult, () => inner.returnValue, inner.signal);
          return Promise.resolve(finalResult).finally(() => {
            if (activeScope && activeScope === scope) {
              this.restoreParams(activeScope, previousValues);
            }
          });
        };
        const run = context.engine?.withExecutionContext ? () => context.engine.withExecutionContext(element, lifetime, invoke, activeScope) : invoke;
        return context.engine?.batch ? context.engine.batch(run) : run();
      };
    }
    return (...args) => {
      const activeScope = scope?.createChild ? scope.createChild() : scope;
      const invoke = () => {
        const signal = lifetime?.isDisposing ? void 0 : context.signal;
        const inner = {
          scope: activeScope,
          rootScope: context.rootScope,
          ...globals ? { globals } : {},
          ...context.engine ? { engine: context.engine } : {},
          ...element ? { element } : {},
          ...context.self ? { self: context.self } : {},
          ...lifetime ? { lifetime } : {},
          ...signal ? { signal } : {},
          returnValue: void 0,
          returning: false,
          breaking: false,
          continuing: false
        };
        const previousValues = /* @__PURE__ */ new Map();
        const applyResult = activeScope ? this.applyParams(activeScope, previousValues, inner, args) : void 0;
        const bodyResult = resolveMaybe(applyResult, () => this.body.evaluate(inner), inner.signal);
        const finalResult = resolveMaybe(bodyResult, () => inner.returnValue, inner.signal);
        if (isPromiseLike(finalResult)) {
          return finalResult.finally(() => {
            if (activeScope && activeScope === scope) {
              this.restoreParams(activeScope, previousValues);
            }
          });
        }
        if (activeScope && activeScope === scope) {
          this.restoreParams(activeScope, previousValues);
        }
        return finalResult;
      };
      const run = context.engine?.withExecutionContext ? () => context.engine.withExecutionContext(element, lifetime, invoke, activeScope) : invoke;
      return context.engine?.batch ? context.engine.batch(run) : run();
    };
  }
  applyParams(scope, previousValues, context, args) {
    throwIfAborted(context.signal);
    if (!scope) {
      return;
    }
    const setPath = scope.setPath?.bind(scope);
    if (!setPath) {
      return;
    }
    const params = this.params;
    const applyAt = (paramIndex, argIndex) => {
      for (let i = paramIndex; i < params.length; i += 1) {
        const param = params[i];
        const name = param.name;
        if (!name) {
          continue;
        }
        previousValues.set(name, scope.getPath(name));
        if (param.rest) {
          setPath(`self.${name}`, args.slice(argIndex));
          return;
        }
        let value = args[argIndex];
        if (value === void 0 && param.defaultValue) {
          const defaultValue = param.defaultValue.evaluate(context);
          return resolveMaybe(defaultValue, (resolvedDefault) => {
            throwIfAborted(context.signal);
            setPath(`self.${name}`, resolvedDefault);
            return applyAt(i + 1, argIndex + 1);
          }, context.signal);
        }
        throwIfAborted(context.signal);
        setPath(`self.${name}`, value);
        argIndex += 1;
      }
      return;
    };
    return applyAt(0, 0);
  }
  restoreParams(scope, previousValues) {
    if (!scope) {
      return;
    }
    const setPath = scope.setPath?.bind(scope);
    if (!setPath) {
      return;
    }
    for (const param of this.params) {
      const name = param.name;
      if (!name) {
        continue;
      }
      setPath(name, previousValues.get(name));
    }
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
  evaluate(context) {
    if (this.name === "self") {
      return context.self ?? context.element ?? context.scope;
    }
    if (this.name.startsWith("root.") && context.rootScope) {
      const path = this.name.slice("root.".length);
      return context.rootScope.getPath(`self.${path}`);
    }
    if (context.scope) {
      const value = context.scope.getPath(this.name);
      const root = this.name.split(".")[0];
      const explicit = this.name.startsWith("parent.") || this.name.startsWith("root.") || this.name.startsWith("self.");
      if (explicit || value !== void 0 || root && context.scope.hasKey?.(root)) {
        return value;
      }
    }
    if (this.name === "signal" && context.signal) {
      return context.signal;
    }
    return context.globals ? context.globals[this.name] : void 0;
  }
};
var ElementRefExpression = class extends BaseNode {
  constructor(id) {
    super("ElementRef");
    this.id = id;
  }
  evaluate(context) {
    const doc = context.element?.ownerDocument ?? (typeof document !== "undefined" ? document : void 0);
    if (!doc) {
      return void 0;
    }
    const element = doc.getElementById(this.id);
    if (!element) {
      return void 0;
    }
    const engine = context.engine ?? globalThis.VSNEngine;
    const scope = engine?.getScope ? engine.getScope(element) : void 0;
    return { __element: element, __scope: scope };
  }
};
var SpreadElement = class extends BaseNode {
  constructor(value) {
    super("SpreadElement");
    this.value = value;
  }
};
var RestElement = class extends BaseNode {
  constructor(target) {
    super("RestElement");
    this.target = target;
  }
};
var ArrayPattern = class extends BaseNode {
  constructor(elements) {
    super("ArrayPattern");
    this.elements = elements;
  }
};
var ObjectPattern = class extends BaseNode {
  constructor(entries) {
    super("ObjectPattern");
    this.entries = entries;
  }
};
var LiteralExpression = class extends BaseNode {
  constructor(value) {
    super("Literal");
    this.value = value;
  }
  evaluate() {
    return this.value;
  }
};
var TemplateExpression = class extends BaseNode {
  constructor(parts) {
    super("TemplateExpression");
    this.parts = parts;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    let result = "";
    let index = 0;
    const run = () => {
      while (index < this.parts.length) {
        const part = this.parts[index];
        index += 1;
        const value = part.evaluate(context);
        return resolveMaybe(value, (resolved) => {
          throwIfAborted(context.signal);
          result += resolved == null ? "" : String(resolved);
          return run();
        }, context.signal);
      }
      return result;
    };
    return run();
  }
  getTemplateParts(context) {
    const strings = [];
    const values = [];
    for (const part of this.parts) {
      if (part instanceof LiteralExpression) {
        strings.push(String(part.value ?? ""));
        continue;
      }
      values.push(part?.evaluate(context));
    }
    return { strings, values };
  }
};
var TaggedTemplateExpression = class extends BaseNode {
  constructor(tag, template) {
    super("TaggedTemplateExpression");
    this.tag = tag;
    this.template = template;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const tagValue = this.tag.evaluate(context);
    return resolveMaybe(tagValue, (resolvedTag) => {
      throwIfAborted(context.signal);
      if (typeof resolvedTag !== "function") {
        return void 0;
      }
      const { strings, values } = this.template.getTemplateParts(context);
      return resolvedTag(strings, ...values);
    }, context.signal);
  }
};
var UnaryExpression = class extends BaseNode {
  constructor(operator, argument) {
    super("UnaryExpression");
    this.operator = operator;
    this.argument = argument;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const value = this.argument.evaluate(context);
    return resolveMaybe(value, (resolved) => {
      throwIfAborted(context.signal);
      if (this.operator === "!") {
        return !resolved;
      }
      if (this.operator === "-") {
        return -resolved;
      }
      return resolved;
    }, context.signal);
  }
};
var BinaryExpression = class extends BaseNode {
  constructor(operator, left, right) {
    super("BinaryExpression");
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const leftValue = this.left.evaluate(context);
    return resolveMaybe(leftValue, (resolvedLeft) => {
      throwIfAborted(context.signal);
      if (this.operator === "&&") {
        if (!resolvedLeft) {
          return resolvedLeft;
        }
        return this.right.evaluate(context);
      }
      if (this.operator === "||") {
        if (resolvedLeft) {
          return resolvedLeft;
        }
        return this.right.evaluate(context);
      }
      if (this.operator === "??") {
        if (resolvedLeft !== null && resolvedLeft !== void 0) {
          return resolvedLeft;
        }
        return this.right.evaluate(context);
      }
      const rightValue = this.right.evaluate(context);
      return resolveMaybe(rightValue, (resolvedRight) => {
        throwIfAborted(context.signal);
        if (this.operator === "+") {
          return resolvedLeft + resolvedRight;
        }
        if (this.operator === "-") {
          return resolvedLeft - resolvedRight;
        }
        if (this.operator === "*") {
          return resolvedLeft * resolvedRight;
        }
        if (this.operator === "/") {
          return resolvedLeft / resolvedRight;
        }
        if (this.operator === "%") {
          return resolvedLeft % resolvedRight;
        }
        if (this.operator === "==") {
          return resolvedLeft == resolvedRight;
        }
        if (this.operator === "!=") {
          return resolvedLeft != resolvedRight;
        }
        if (this.operator === "===") {
          return resolvedLeft === resolvedRight;
        }
        if (this.operator === "!==") {
          return resolvedLeft !== resolvedRight;
        }
        if (this.operator === "<") {
          return resolvedLeft < resolvedRight;
        }
        if (this.operator === ">") {
          return resolvedLeft > resolvedRight;
        }
        if (this.operator === "<=") {
          return resolvedLeft <= resolvedRight;
        }
        if (this.operator === ">=") {
          return resolvedLeft >= resolvedRight;
        }
        return void 0;
      }, context.signal);
    }, context.signal);
  }
};
var TernaryExpression = class extends BaseNode {
  constructor(test, consequent, alternate) {
    super("TernaryExpression");
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const condition = this.test.evaluate(context);
    return resolveMaybe(condition, (resolved) => {
      throwIfAborted(context.signal);
      if (resolved) {
        return this.consequent.evaluate(context);
      }
      return this.alternate.evaluate(context);
    }, context.signal);
  }
};
var MemberExpression = class _MemberExpression extends BaseNode {
  constructor(target, property, optional = false) {
    super("MemberExpression");
    this.target = target;
    this.property = property;
    this.optional = optional;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const resolved = this.resolve(context);
    return resolveMaybe(resolved, (resolvedValue) => resolvedValue?.value, context.signal);
  }
  resolve(context) {
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
    const target = this.target.evaluate(context);
    return resolveMaybe(target, (resolvedTarget) => {
      throwIfAborted(context.signal);
      if (resolvedTarget == null) {
        return { value: void 0, target: resolvedTarget, optional: this.optional };
      }
      return { value: resolvedTarget[this.property], target: resolvedTarget, optional: this.optional };
    }, context.signal);
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
    if (path.path.startsWith("root.") && context.rootScope) {
      const localPath = path.path.slice("root.".length);
      const value2 = context.rootScope.getPath(`self.${localPath}`);
      const targetPath2 = localPath.split(".").slice(0, -1).join(".");
      const target2 = targetPath2 ? context.rootScope.getPath(`self.${targetPath2}`) : context.rootScope;
      return { value: value2, target: target2, optional: this.optional };
    }
    const value = context.scope.getPath(path.path);
    const explicit = path.path.startsWith("parent.") || path.path.startsWith("root.") || path.path.startsWith("self.");
    if (!explicit && value === void 0 && !context.scope.hasKey?.(path.root)) {
      return void 0;
    }
    const targetPath = this.getTargetPath(path.path);
    const target = targetPath ? context.scope.getPath(targetPath) : void 0;
    return { value, target, optional: this.optional };
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
        return { value: void 0, target: parent, optional: this.optional };
      }
      value = value?.[part];
    }
    return { value, target: parent, optional: this.optional };
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
  evaluate(context) {
    throwIfAborted(context.signal);
    const resolved = this.resolveCallee(context);
    return resolveMaybe(resolved, (resolvedCallee) => {
      throwIfAborted(context.signal);
      const fnValue = resolvedCallee?.fn ?? this.callee.evaluate(context);
      return resolveMaybe(fnValue, (resolvedFn) => {
        throwIfAborted(context.signal);
        if (typeof resolvedFn !== "function") {
          return void 0;
        }
        const values = [];
        const evalArgs = (index) => {
          for (let i = index; i < this.args.length; i += 1) {
            const arg = this.args[i];
            const argValue = arg.evaluate(context);
            return resolveMaybe(argValue, (resolvedArg) => {
              throwIfAborted(context.signal);
              values.push(resolvedArg);
              return evalArgs(i + 1);
            }, context.signal);
          }
          throwIfAborted(context.signal);
          return resolvedFn.apply(resolvedCallee?.thisArg, values);
        };
        return evalArgs(0);
      }, context.signal);
    }, context.signal);
  }
  resolveCallee(context) {
    if (this.callee instanceof MemberExpression) {
      const resolved = this.callee.resolve(context);
      return resolveMaybe(resolved, (resolvedValue) => {
        throwIfAborted(context.signal);
        if (!resolvedValue) {
          return void 0;
        }
        return { fn: resolvedValue.value, thisArg: resolvedValue.target };
      }, context.signal);
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
  evaluate(context) {
    throwIfAborted(context.signal);
    const values = [];
    const pushElements = (value) => {
      if (value == null) {
        return;
      }
      const iterator = value[Symbol.iterator];
      if (typeof iterator === "function") {
        for (const entry of value) {
          values.push(entry);
        }
      } else {
        values.push(value);
      }
    };
    const evalAt = (index) => {
      for (let i = index; i < this.elements.length; i += 1) {
        const element = this.elements[i];
        if (element instanceof SpreadElement) {
          const spreadValue = element.value.evaluate(context);
          return resolveMaybe(spreadValue, (resolvedSpread) => {
            throwIfAborted(context.signal);
            pushElements(resolvedSpread);
            return evalAt(i + 1);
          }, context.signal);
        }
        const value = element.evaluate(context);
        return resolveMaybe(value, (resolvedValue) => {
          throwIfAborted(context.signal);
          values.push(resolvedValue);
          return evalAt(i + 1);
        }, context.signal);
      }
      return values;
    };
    return evalAt(0);
  }
};
var ObjectExpression = class extends BaseNode {
  constructor(entries) {
    super("ObjectExpression");
    this.entries = entries;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const result = {};
    const evalAt = (index) => {
      for (let i = index; i < this.entries.length; i += 1) {
        const entry = this.entries[i];
        if ("spread" in entry) {
          const spreadValue = entry.spread.evaluate(context);
          return resolveMaybe(spreadValue, (resolvedSpread) => {
            throwIfAborted(context.signal);
            if (resolvedSpread != null) {
              Object.assign(result, resolvedSpread);
            }
            return evalAt(i + 1);
          }, context.signal);
        }
        if ("computed" in entry && entry.computed) {
          const keyValue = entry.keyExpr.evaluate(context);
          return resolveMaybe(keyValue, (resolvedKey) => {
            throwIfAborted(context.signal);
            const entryValue = entry.value.evaluate(context);
            return resolveMaybe(entryValue, (resolvedValue) => {
              throwIfAborted(context.signal);
              result[String(resolvedKey)] = resolvedValue;
              return evalAt(i + 1);
            }, context.signal);
          }, context.signal);
        }
        const value = entry.value.evaluate(context);
        return resolveMaybe(value, (resolvedValue) => {
          throwIfAborted(context.signal);
          result[entry.key] = resolvedValue;
          return evalAt(i + 1);
        }, context.signal);
      }
      return result;
    };
    return evalAt(0);
  }
};
var IndexExpression = class extends BaseNode {
  constructor(target, index) {
    super("IndexExpression");
    this.target = target;
    this.index = index;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const target = this.target.evaluate(context);
    return resolveMaybe(target, (resolvedTarget) => {
      throwIfAborted(context.signal);
      if (resolvedTarget == null) {
        return void 0;
      }
      const index = this.index.evaluate(context);
      return resolveMaybe(index, (resolvedIndex) => {
        throwIfAborted(context.signal);
        if (resolvedIndex == null) {
          return void 0;
        }
        const key = this.normalizeIndexKey(resolvedTarget, resolvedIndex);
        return resolvedTarget[key];
      }, context.signal);
    }, context.signal);
  }
  normalizeIndexKey(target, index) {
    if (Array.isArray(target) && typeof index === "string" && index.trim() !== "") {
      const numeric = Number(index);
      if (!Number.isNaN(numeric)) {
        return numeric;
      }
    }
    return index;
  }
};
var DirectiveExpression = class extends BaseNode {
  constructor(kind, name) {
    super("Directive");
    this.kind = kind;
    this.name = name;
  }
  evaluate(context) {
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
      if (this.name === "text" && element instanceof HTMLElement) {
        return element.innerText;
      }
      if (this.name === "content" && element instanceof HTMLElement) {
        return element.textContent ?? "";
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
var ElementDirectiveExpression = class extends BaseNode {
  constructor(element, directive) {
    super("ElementDirective");
    this.element = element;
    this.directive = directive;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const elementValue = this.element.evaluate(context);
    return resolveMaybe(elementValue, (resolvedElement) => {
      throwIfAborted(context.signal);
      const element = resolveElementFromReference(resolvedElement);
      if (!element) {
        return void 0;
      }
      const nextContext = { ...context, element };
      return this.directive.evaluate(nextContext);
    }, context.signal);
  }
};
var ElementPropertyExpression = class extends BaseNode {
  constructor(element, property) {
    super("ElementProperty");
    this.element = element;
    this.property = property;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const elementValue = this.element.evaluate(context);
    return resolveMaybe(elementValue, (resolvedElement) => {
      throwIfAborted(context.signal);
      if (resolvedElement && typeof resolvedElement === "object" && resolvedElement.__scope) {
        return resolvedElement.__scope.getPath?.(this.property);
      }
      const element = resolveElementFromReference(resolvedElement);
      if (!element) {
        return void 0;
      }
      return element[this.property];
    }, context.signal);
  }
};
function resolveElementFromReference(value) {
  if (value && typeof value === "object") {
    const candidate = value.__element;
    if (candidate && typeof candidate === "object" && candidate.nodeType === 1) {
      return candidate;
    }
    if (value.nodeType === 1) {
      return value;
    }
  }
  return void 0;
}
var AwaitExpression = class extends BaseNode {
  constructor(argument) {
    super("AwaitExpression");
    this.argument = argument;
  }
  evaluate(context) {
    throwIfAborted(context.signal);
    const value = this.argument.evaluate(context);
    return Promise.resolve(value).then((resolved) => {
      throwIfAborted(context.signal);
      return resolved;
    });
  }
};
var QueryExpression = class extends BaseNode {
  constructor(direction, selector) {
    super("Query");
    this.direction = direction;
    this.selector = selector;
  }
  evaluate(context) {
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
      if (!token) {
        continue;
      }
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
  indexAfterDelimited(openType, closeType, offset = 0) {
    const first = this.peekNonWhitespace(offset);
    if (!first || first.type !== openType) {
      return null;
    }
    let index = offset + 1;
    let depth = 1;
    while (true) {
      const token = this.peekNonWhitespace(index);
      if (!token) {
        return null;
      }
      if (token.type === openType) {
        depth += 1;
      } else if (token.type === closeType) {
        depth -= 1;
        if (depth === 0) {
          return index + 1;
        }
      }
      index += 1;
    }
  }
};

// src/parser/parser.ts
var Parser = class _Parser {
  stream;
  source;
  customFlags;
  behaviorFlags;
  allowImplicitSemicolon = false;
  awaitStack = [];
  functionDepth = 0;
  constructor(input, options) {
    this.source = input;
    this.customFlags = options?.customFlags ?? /* @__PURE__ */ new Set(["important", "debounce"]);
    this.behaviorFlags = options?.behaviorFlags ?? /* @__PURE__ */ new Set();
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
          behaviors.push(this.parseBehavior(true));
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
  parseBehavior(optionalKeyword = false) {
    return this.wrapErrors(() => {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === "Behavior" /* Behavior */) {
        this.stream.next();
      } else if (!optionalKeyword) {
        this.stream.expect("Behavior" /* Behavior */);
      }
      const selector = this.parseSelector();
      const { flags, flagArgs } = this.parseBehaviorFlags();
      const body = this.parseBlock({ allowDeclarations: true });
      return new BehaviorNode(selector, body, flags, flagArgs);
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
      if (token.type === "Bang" /* Bang */) {
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
      const selectorToken = this.stream.next();
      selectorText += selectorToken.raw ?? selectorToken.value;
    }
    if (!selectorText.trim()) {
      throw new Error("Behavior selector is required");
    }
    return new SelectorNode(selectorText.trim());
  }
  parseBehaviorFlags() {
    const result = this.parseFlags(this.behaviorFlags, "behavior modifier");
    return { flags: result.flags, flagArgs: result.flagArgs };
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
      const { flags, flagArgs } = this.parseUseFlags();
      this.stream.skipWhitespace();
      this.stream.expect("Semicolon" /* Semicolon */);
      return new UseNode(name, alias, flags, flagArgs);
    });
  }
  parseUseFlags() {
    const flags = {};
    const flagArgs = {};
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== "Bang" /* Bang */) {
        break;
      }
      this.stream.next();
      const name = this.stream.expect("Identifier" /* Identifier */).value;
      if (name !== "wait") {
        throw new Error(`Unknown flag ${name}`);
      }
      flags.wait = true;
      if (this.stream.peek()?.type === "LParen" /* LParen */) {
        this.stream.next();
        this.stream.skipWhitespace();
        const timeoutToken = this.stream.expect("Number" /* Number */);
        const timeoutMs = Number(timeoutToken.value);
        let intervalMs;
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === "Comma" /* Comma */) {
          this.stream.next();
          this.stream.skipWhitespace();
          const intervalToken = this.stream.expect("Number" /* Number */);
          intervalMs = Number(intervalToken.value);
          this.stream.skipWhitespace();
        }
        this.stream.expect("RParen" /* RParen */);
        flagArgs.wait = { timeoutMs, ...intervalMs !== void 0 ? { intervalMs } : {} };
      }
    }
    return { flags, flagArgs };
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
    const allowReturn = options?.allowReturn ?? this.functionDepth > 0;
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
      const explicitBehaviorStart = allowDeclarations && next.type === "Behavior" /* Behavior */;
      const isFunctionDeclaration = allowDeclarations && this.isFunctionDeclarationStart();
      const isFunctionExpressionAssignment = allowDeclarations && this.isFunctionExpressionAssignmentStart();
      const isDeclaration = this.isDeclarationStart();
      const implicitBehaviorStart = allowDeclarations && !explicitBehaviorStart && !isFunctionDeclaration && !isFunctionExpressionAssignment && !isDeclaration && this.isImplicitBehaviorStart();
      const isNestedBehavior = explicitBehaviorStart || implicitBehaviorStart;
      if (allowDeclarations && isNestedBehavior) {
        sawNestedBehavior = true;
      }
      if (allowDeclarations && sawNestedBehavior && !isNestedBehavior) {
        throw new Error("Nested behaviors must appear after construct, function, and on blocks");
      }
      if (isFunctionDeclaration) {
        if (!sawConstruct) {
          sawFunctionOrOn = true;
        }
        statements.push(this.parseFunctionDeclaration());
        continue;
      }
      if (isFunctionExpressionAssignment) {
        if (!declarationsOpen) {
          throw new Error("Declarations must appear before blocks");
        }
        statements.push(this.parseAssignment());
        continue;
      }
      if (isNestedBehavior) {
        if (declarationsOpen) {
          declarationsOpen = false;
        }
        statements.push(this.parseBehavior(true));
      } else if (isDeclaration) {
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
        statements.push(this.parseStatement({ allowReturn }));
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
    if (next.type === "Assert" /* Assert */) {
      return this.parseAssertStatement();
    }
    if (next.type === "Break" /* Break */) {
      return this.parseBreakStatement();
    }
    if (next.type === "Continue" /* Continue */) {
      return this.parseContinueStatement();
    }
    if (allowBlocks && next.type === "On" /* On */) {
      return this.parseOnBlock();
    }
    if (allowBlocks && next.type === "If" /* If */) {
      return this.parseIfBlock();
    }
    if (allowBlocks && next.type === "For" /* For */) {
      return this.parseForBlock();
    }
    if (allowBlocks && next.type === "While" /* While */) {
      return this.parseWhileBlock();
    }
    if (allowBlocks && next.type === "Try" /* Try */) {
      return this.parseTryBlock();
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
    if (allowBlocks && this.isImplicitBehaviorStart()) {
      return this.parseBehavior(true);
    }
    if (this.isAwaitAllowed() && next.type === "Identifier" /* Identifier */ && next.value === "await") {
      return this.parseExpressionStatement();
    }
    if (this.isAssignmentStart()) {
      return this.parseAssignment();
    }
    if (this.isExpressionStatementStart()) {
      return this.parseExpressionStatement();
    }
    throw new Error(`Unexpected token ${next.type}`);
  }
  parseOnBlock() {
    this.stream.expect("On" /* On */);
    this.stream.skipWhitespace();
    const event = this.parseIdentifierPath();
    const leadingFlags = this.parseOnFlags(true);
    this.stream.skipWhitespace();
    const args = [];
    if (this.stream.peek()?.type === "LParen" /* LParen */) {
      this.stream.next();
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
    } else if (!leadingFlags.consumedArgument) {
      this.stream.expect("LParen" /* LParen */);
    }
    const trailingFlags = this.parseOnFlags();
    const flags = { ...leadingFlags.flags, ...trailingFlags.flags };
    const flagArgs = { ...leadingFlags.flagArgs, ...trailingFlags.flagArgs };
    const body = this.parseBlock({ allowDeclarations: false });
    return new OnBlockNode(event, args, body, flags, flagArgs);
  }
  parseOnFlags(preserveEmptyArgument = false) {
    const flags = {};
    const flagArgs = {};
    let consumedArgument = false;
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== "Bang" /* Bang */) {
        break;
      }
      this.stream.next();
      const name = this.stream.expect("Identifier" /* Identifier */).value;
      if (this.customFlags && !this.customFlags.has(name)) {
        throw new Error(`Unknown flag ${name}`);
      }
      flags[name] = true;
      this.stream.skipWhitespace();
      const next = this.stream.peekNonWhitespace(0);
      if (next?.type !== "LParen" /* LParen */) {
        continue;
      }
      const afterParen = this.stream.peekNonWhitespace(1);
      if (preserveEmptyArgument && afterParen?.type === "RParen" /* RParen */) {
        continue;
      }
      const customArg = this.parseCustomFlagArg();
      consumedArgument = true;
      if (customArg !== void 0) {
        flagArgs[name] = customArg;
      }
    }
    return { flags, flagArgs, consumedArgument };
  }
  parseAssignment() {
    const target = this.parseAssignmentTarget();
    this.stream.skipWhitespace();
    const operator = this.parseAssignmentOperator();
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    this.consumeStatementTerminator();
    return new AssignmentNode(target, value, operator);
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
    let test = this.parseNullishExpression();
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
  parseNullishExpression() {
    let expr = this.parseLogicalOrExpression();
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== "NullishCoalesce" /* NullishCoalesce */) {
        break;
      }
      this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseLogicalOrExpression();
      expr = new BinaryExpression("??", expr, right);
    }
    return expr;
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
      if (!next || next.type !== "DoubleEquals" /* DoubleEquals */ && next.type !== "NotEquals" /* NotEquals */ && next.type !== "TripleEquals" /* TripleEquals */ && next.type !== "StrictNotEquals" /* StrictNotEquals */) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseComparisonExpression();
      this.stream.skipWhitespace();
      let operator = "==";
      if (op.type === "NotEquals" /* NotEquals */) {
        operator = "!=";
      } else if (op.type === "TripleEquals" /* TripleEquals */) {
        operator = "===";
      } else if (op.type === "StrictNotEquals" /* StrictNotEquals */) {
        operator = "!==";
      }
      left = new BinaryExpression(operator, left, right);
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
  parseMultiplicativeExpression() {
    let left = this.parseUnaryExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next) {
        break;
      }
      if (next.type !== "Star" /* Star */ && next.type !== "Slash" /* Slash */ && next.type !== "Percent" /* Percent */) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseUnaryExpression();
      this.stream.skipWhitespace();
      let operator = "*";
      if (op.type === "Slash" /* Slash */) {
        operator = "/";
      } else if (op.type === "Percent" /* Percent */) {
        operator = "%";
      }
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  parseAdditiveExpression() {
    let left = this.parseMultiplicativeExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next || next.type !== "Plus" /* Plus */ && next.type !== "Minus" /* Minus */) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseMultiplicativeExpression();
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
    if (token.type === "PlusPlus" /* PlusPlus */ || token.type === "MinusMinus" /* MinusMinus */) {
      this.stream.next();
      const argument = this.parseUnaryExpression();
      return this.createIncrementNode(token, argument, true);
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
    return this.parsePostfixExpression();
  }
  parsePostfixExpression() {
    let expr = this.parseCallExpression();
    while (true) {
      this.stream.skipWhitespace();
      const token = this.stream.peek();
      if (!token) {
        break;
      }
      if (token.type === "PlusPlus" /* PlusPlus */ || token.type === "MinusMinus" /* MinusMinus */) {
        this.stream.next();
        expr = this.createIncrementNode(token, expr, false);
        continue;
      }
      break;
    }
    return expr;
  }
  createIncrementNode(token, argument, prefix) {
    if (!(argument instanceof IdentifierExpression) && !(argument instanceof MemberExpression) && !(argument instanceof IndexExpression) && !(argument instanceof DirectiveExpression) && !(argument instanceof ElementDirectiveExpression)) {
      throw new Error("Increment/decrement requires a mutable target");
    }
    const operator = token.type === "PlusPlus" /* PlusPlus */ ? "++" : "--";
    return new AssignmentNode(argument, new LiteralExpression(1), operator, prefix);
  }
  parseCallExpression() {
    let expr = this.parsePrimaryExpression();
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        break;
      }
      if (next.type === "Template" /* Template */) {
        const template = this.parseTemplateExpression();
        if (!(template instanceof TemplateExpression)) {
          throw new Error("Expected template literal");
        }
        expr = new TaggedTemplateExpression(expr, template);
        continue;
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
      if (next.type === "OptionalChain" /* OptionalChain */) {
        this.stream.next();
        this.stream.skipWhitespace();
        const chained = this.stream.peek();
        if (!chained) {
          throw new Error("Expected property or call after ?.");
        }
        if (chained.type === "LParen" /* LParen */) {
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
        if (chained.type === "Identifier" /* Identifier */) {
          const name = this.stream.next();
          expr = new MemberExpression(expr, name.value, true);
          continue;
        }
        throw new Error("Expected property or call after ?.");
      }
      if (next.type === "Dot" /* Dot */) {
        this.stream.next();
        const chained = this.stream.peek();
        if (chained?.type === "At" /* At */ || chained?.type === "Dollar" /* Dollar */) {
          const directive = this.parseDirectiveExpression();
          expr = new ElementDirectiveExpression(expr, directive);
        } else {
          const name = this.stream.expect("Identifier" /* Identifier */);
          if (expr instanceof ElementRefExpression) {
            expr = new ElementPropertyExpression(expr, name.value);
          } else {
            expr = new MemberExpression(expr, name.value);
          }
        }
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
      return this.parseDirectiveExpression();
    }
    if (token.type === "Hash" /* Hash */) {
      return this.parseElementRefExpression();
    }
    if (token.type === "Question" /* Question */) {
      return this.parseQueryExpression();
    }
    if (token.type === "LBracket" /* LBracket */) {
      return this.parseArrayExpression();
    }
    if (token.type === "LBrace" /* LBrace */) {
      return this.parseObjectExpression();
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
    if (token.type === "Template" /* Template */) {
      return this.parseTemplateExpression();
    }
    throw new Error(`Unsupported expression token ${token.type}`);
  }
  parseDirectiveExpression() {
    const token = this.stream.peek();
    if (!token || token.type !== "At" /* At */ && token.type !== "Dollar" /* Dollar */) {
      throw new Error("Expected directive");
    }
    const kind = token.type === "At" /* At */ ? "attr" : "style";
    this.stream.next();
    const name = this.stream.expect("Identifier" /* Identifier */);
    return new DirectiveExpression(kind, name.value);
  }
  parseElementRefExpression() {
    this.stream.expect("Hash" /* Hash */);
    const id = this.stream.expect("Identifier" /* Identifier */).value;
    return new ElementRefExpression(id);
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
      if (next.type === "Ellipsis" /* Ellipsis */) {
        this.stream.next();
        this.stream.skipWhitespace();
        const value = this.parseExpression();
        elements.push(new SpreadElement(value));
      } else {
        elements.push(this.parseExpression());
      }
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
  parseTemplateExpression() {
    const parts = [];
    while (true) {
      const token = this.stream.peek();
      if (!token) {
        throw new Error("Unterminated template literal");
      }
      if (token.type !== "Template" /* Template */) {
        throw new Error("Expected template literal");
      }
      const literal = this.stream.next().value;
      parts.push(new LiteralExpression(literal));
      const next = this.stream.peek();
      if (!next || next.type !== "Dollar" /* Dollar */) {
        break;
      }
      this.stream.next();
      this.stream.expect("LBrace" /* LBrace */);
      this.stream.skipWhitespace();
      const expr = this.parseExpression();
      this.stream.skipWhitespace();
      this.stream.expect("RBrace" /* RBrace */);
      parts.push(expr);
    }
    return new TemplateExpression(parts);
  }
  parseObjectExpression() {
    this.stream.expect("LBrace" /* LBrace */);
    const entries = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated object literal");
      }
      if (next.type === "RBrace" /* RBrace */) {
        this.stream.next();
        break;
      }
      let value;
      let entry;
      if (next.type === "Ellipsis" /* Ellipsis */) {
        this.stream.next();
        this.stream.skipWhitespace();
        entry = { spread: this.parseExpression() };
      } else if (next.type === "LBracket" /* LBracket */) {
        this.stream.next();
        this.stream.skipWhitespace();
        const keyExpr = this.parseExpression();
        this.stream.skipWhitespace();
        this.stream.expect("RBracket" /* RBracket */);
        this.stream.skipWhitespace();
        this.stream.expect("Colon" /* Colon */);
        this.stream.skipWhitespace();
        value = this.parseExpression();
        entry = { keyExpr, value, computed: true };
      } else if (next.type === "Identifier" /* Identifier */) {
        const name = this.stream.next().value;
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === "Colon" /* Colon */) {
          this.stream.next();
          this.stream.skipWhitespace();
          value = this.parseExpression();
        } else {
          value = new IdentifierExpression(name);
        }
        entry = { key: name, value };
      } else if (next.type === "String" /* String */) {
        const key = this.stream.next().value;
        this.stream.skipWhitespace();
        this.stream.expect("Colon" /* Colon */);
        this.stream.skipWhitespace();
        value = this.parseExpression();
        entry = { key, value };
      } else {
        throw new Error(`Unexpected token in object literal: ${next.type}`);
      }
      if (!entry) {
        throw new Error("Invalid object literal entry");
      }
      entries.push(entry);
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === "Comma" /* Comma */) {
        this.stream.next();
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === "RBrace" /* RBrace */) {
          this.stream.next();
          break;
        }
        continue;
      }
      if (this.stream.peek()?.type === "RBrace" /* RBrace */) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or '}' in object literal");
    }
    return new ObjectExpression(entries);
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
    this.functionDepth += 1;
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
        statements.push(this.parseStatement({ allowBlocks: true, allowReturn: true }));
      }
    } finally {
      this.functionDepth -= 1;
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
    if (token.type === "LBracket" /* LBracket */) {
      return this.parseArrayPattern();
    }
    if (token.type === "LBrace" /* LBrace */) {
      return this.parseObjectPattern();
    }
    if (token.type === "Identifier" /* Identifier */) {
      const expr = this.parseCallExpression();
      if (expr instanceof CallExpression) {
        throw new Error("Invalid assignment target CallExpression");
      }
      if (expr instanceof IdentifierExpression || expr instanceof MemberExpression || expr instanceof IndexExpression || expr instanceof ElementDirectiveExpression) {
        return expr;
      }
      throw new Error("Invalid assignment target");
    }
    if (token.type === "Hash" /* Hash */) {
      const expr = this.parseCallExpression();
      if (expr instanceof ElementDirectiveExpression) {
        return expr;
      }
      throw new Error("Invalid assignment target");
    }
    throw new Error(`Invalid assignment target ${token.type}`);
  }
  parseArrayPattern() {
    this.stream.expect("LBracket" /* LBracket */);
    const elements = [];
    let sawRest = false;
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated array pattern");
      }
      if (next.type === "RBracket" /* RBracket */) {
        this.stream.next();
        break;
      }
      if (next.type === "Comma" /* Comma */) {
        this.stream.next();
        elements.push(null);
        continue;
      }
      if (next.type === "Ellipsis" /* Ellipsis */) {
        if (sawRest) {
          throw new Error("Array patterns can only include one rest element");
        }
        this.stream.next();
        this.stream.skipWhitespace();
        const name = this.stream.expect("Identifier" /* Identifier */);
        elements.push(new RestElement(new IdentifierExpression(name.value)));
        sawRest = true;
      } else if (next.type === "LBracket" /* LBracket */) {
        elements.push(this.parseArrayPattern());
      } else if (next.type === "LBrace" /* LBrace */) {
        elements.push(this.parseObjectPattern());
      } else if (next.type === "Identifier" /* Identifier */) {
        elements.push(new IdentifierExpression(this.parseIdentifierPath()));
      } else {
        throw new Error(`Unexpected token in array pattern: ${next.type}`);
      }
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === "Comma" /* Comma */) {
        this.stream.next();
        continue;
      }
      if (this.stream.peek()?.type === "RBracket" /* RBracket */) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or ']' in array pattern");
    }
    if (sawRest) {
      const last = elements[elements.length - 1];
      if (!(last instanceof RestElement)) {
        throw new Error("Rest element must be last in array pattern");
      }
    }
    return new ArrayPattern(elements);
  }
  parseObjectPattern() {
    this.stream.expect("LBrace" /* LBrace */);
    const entries = [];
    let rest;
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated object pattern");
      }
      if (next.type === "RBrace" /* RBrace */) {
        this.stream.next();
        break;
      }
      if (next.type === "Ellipsis" /* Ellipsis */) {
        if (rest) {
          throw new Error("Object patterns can only include one rest element");
        }
        this.stream.next();
        this.stream.skipWhitespace();
        const name = this.stream.expect("Identifier" /* Identifier */);
        rest = new IdentifierExpression(name.value);
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === "Comma" /* Comma */) {
          this.stream.next();
          this.stream.skipWhitespace();
        }
        if (this.stream.peek()?.type !== "RBrace" /* RBrace */) {
          throw new Error("Rest element must be last in object pattern");
        }
        this.stream.next();
        break;
      } else if (next.type === "Identifier" /* Identifier */ || next.type === "String" /* String */) {
        const keyToken = this.stream.next();
        const key = keyToken.value;
        this.stream.skipWhitespace();
        let target;
        if (this.stream.peek()?.type === "Colon" /* Colon */) {
          this.stream.next();
          this.stream.skipWhitespace();
          const valueToken = this.stream.peek();
          if (!valueToken) {
            throw new Error("Expected object pattern target");
          }
          if (valueToken.type === "LBracket" /* LBracket */) {
            target = this.parseArrayPattern();
          } else if (valueToken.type === "LBrace" /* LBrace */) {
            target = this.parseObjectPattern();
          } else if (valueToken.type === "Identifier" /* Identifier */) {
            target = new IdentifierExpression(this.parseIdentifierPath());
          } else {
            throw new Error(`Unexpected token in object pattern: ${valueToken.type}`);
          }
        } else {
          target = new IdentifierExpression(key);
        }
        entries.push({ key, target });
      } else {
        throw new Error(`Unexpected token in object pattern: ${next.type}`);
      }
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === "Comma" /* Comma */) {
        this.stream.next();
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === "RBrace" /* RBrace */) {
          this.stream.next();
          break;
        }
        continue;
      }
      if (this.stream.peek()?.type === "RBrace" /* RBrace */) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or '}' in object pattern");
    }
    const patternEntries = rest ? [...entries, { rest }] : entries;
    if (rest && entries.length === 0) {
      return new ObjectPattern([{ rest }]);
    }
    return new ObjectPattern(patternEntries);
  }
  parseDeclaration() {
    const target = this.parseDeclarationTarget();
    this.stream.skipWhitespace();
    const operator = this.parseDeclarationOperator();
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    const { flags, flagArgs } = this.parseFlags(this.customFlags, "flag");
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
  parseFlags(allowed, errorLabel) {
    const flags = {};
    const flagArgs = {};
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== "Bang" /* Bang */) {
        break;
      }
      this.stream.next();
      const name = this.stream.expect("Identifier" /* Identifier */).value;
      if (allowed && !allowed.has(name)) {
        throw new Error(`Unknown ${errorLabel} ${name}`);
      }
      flags[name] = true;
      const customArg = this.parseCustomFlagArg();
      if (customArg !== void 0) {
        flagArgs[name] = customArg;
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
    if (token.type === "RParen" /* RParen */) {
      this.stream.next();
      return void 0;
    }
    const value = this.parseCustomFlagLiteral();
    this.stream.skipWhitespace();
    this.stream.expect("RParen" /* RParen */);
    return value;
  }
  parseCustomFlagLiteral() {
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Unterminated flag arguments");
    }
    if (token.type === "Number" /* Number */) {
      return Number(this.stream.next().value);
    }
    if (token.type === "String" /* String */) {
      return this.stream.next().value;
    }
    if (token.type === "Boolean" /* Boolean */) {
      return this.stream.next().value === "true";
    }
    if (token.type === "Identifier" /* Identifier */) {
      return this.stream.next().value;
    }
    if (token.type === "LBracket" /* LBracket */) {
      return this.parseCustomFlagArray();
    }
    if (token.type === "LBrace" /* LBrace */) {
      return this.parseCustomFlagObject();
    }
    throw new Error(`Unsupported flag argument ${token.type}`);
  }
  parseCustomFlagArray() {
    this.stream.expect("LBracket" /* LBracket */);
    const items = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated flag array");
      }
      if (next.type === "RBracket" /* RBracket */) {
        this.stream.next();
        break;
      }
      items.push(this.parseCustomFlagLiteral());
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === "Comma" /* Comma */) {
        this.stream.next();
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === "RBracket" /* RBracket */) {
          throw new Error("Trailing comma in flag array");
        }
        continue;
      }
      if (this.stream.peek()?.type === "RBracket" /* RBracket */) {
        this.stream.next();
        break;
      }
      throw new Error("Expected comma in flag array");
    }
    return items;
  }
  parseCustomFlagObject() {
    this.stream.expect("LBrace" /* LBrace */);
    const obj = {};
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated flag object");
      }
      if (next.type === "RBrace" /* RBrace */) {
        this.stream.next();
        break;
      }
      let key;
      if (next.type === "Identifier" /* Identifier */ || next.type === "String" /* String */) {
        key = this.stream.next().value;
      } else {
        throw new Error(`Unsupported flag object key ${next.type}`);
      }
      this.stream.skipWhitespace();
      this.stream.expect("Colon" /* Colon */);
      this.stream.skipWhitespace();
      obj[key] = this.parseCustomFlagLiteral();
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === "Comma" /* Comma */) {
        this.stream.next();
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === "RBrace" /* RBrace */) {
          throw new Error("Trailing comma in flag object");
        }
        continue;
      }
      if (this.stream.peek()?.type === "RBrace" /* RBrace */) {
        this.stream.next();
        break;
      }
      throw new Error("Expected comma in flag object");
    }
    return obj;
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
      while (true) {
        const token = this.stream.peekNonWhitespace(index);
        if (!token) {
          return false;
        }
        if (token.type === "Dot" /* Dot */) {
          const next = this.stream.peekNonWhitespace(index + 1);
          if (next?.type === "Identifier" /* Identifier */) {
            index += 2;
            continue;
          }
          if (next?.type === "At" /* At */ || next?.type === "Dollar" /* Dollar */) {
            const afterDirective = this.stream.peekNonWhitespace(index + 2);
            if (afterDirective?.type !== "Identifier" /* Identifier */) {
              return false;
            }
            index += 3;
            continue;
          }
          return false;
        }
        if (token.type === "LBracket" /* LBracket */) {
          const indexAfter = this.stream.indexAfterDelimited("LBracket" /* LBracket */, "RBracket" /* RBracket */, index);
          if (indexAfter === null) {
            return false;
          }
          index = indexAfter;
          continue;
        }
        break;
      }
      return this.isAssignmentOperatorStart(index);
    }
    if (first.type === "At" /* At */ || first.type === "Dollar" /* Dollar */) {
      const second = this.stream.peekNonWhitespace(1);
      return second?.type === "Identifier" /* Identifier */ && this.isAssignmentOperatorStart(2);
    }
    if (first.type === "Hash" /* Hash */) {
      let index = 1;
      if (this.stream.peekNonWhitespace(index)?.type !== "Identifier" /* Identifier */) {
        return false;
      }
      index += 1;
      while (true) {
        const token = this.stream.peekNonWhitespace(index);
        if (!token) {
          return false;
        }
        if (token.type === "Dot" /* Dot */) {
          const next = this.stream.peekNonWhitespace(index + 1);
          if (next?.type === "Identifier" /* Identifier */) {
            index += 2;
            continue;
          }
          if (next?.type === "At" /* At */ || next?.type === "Dollar" /* Dollar */) {
            const afterDirective = this.stream.peekNonWhitespace(index + 2);
            if (afterDirective?.type !== "Identifier" /* Identifier */) {
              return false;
            }
            index += 3;
            continue;
          }
          return false;
        }
        if (token.type === "LBracket" /* LBracket */) {
          const indexAfter = this.stream.indexAfterDelimited("LBracket" /* LBracket */, "RBracket" /* RBracket */, index);
          if (indexAfter === null) {
            return false;
          }
          index = indexAfter;
          continue;
        }
        break;
      }
      return this.isAssignmentOperatorStart(index);
    }
    if (first.type === "LBrace" /* LBrace */ || first.type === "LBracket" /* LBracket */) {
      const stack = [];
      let index = 0;
      while (true) {
        const token = this.stream.peekNonWhitespace(index);
        if (!token) {
          return false;
        }
        if (token.type === "LBrace" /* LBrace */ || token.type === "LBracket" /* LBracket */) {
          stack.push(token.type);
        } else if (token.type === "RBrace" /* RBrace */ || token.type === "RBracket" /* RBracket */) {
          stack.pop();
          if (stack.length === 0) {
            return this.isAssignmentOperatorStart(index + 1);
          }
        }
        index += 1;
      }
    }
    return false;
  }
  isAssignmentOperatorStart(index) {
    const token = this.stream.peekNonWhitespace(index);
    if (!token) {
      return false;
    }
    if (token.type === "Equals" /* Equals */) {
      return true;
    }
    if (token.type === "Tilde" /* Tilde */) {
      const next = this.stream.peekNonWhitespace(index + 1);
      return next?.type === "Equals" /* Equals */;
    }
    if (token.type === "Plus" /* Plus */ || token.type === "Minus" /* Minus */ || token.type === "Star" /* Star */ || token.type === "Slash" /* Slash */) {
      const next = this.stream.peekNonWhitespace(index + 1);
      return next?.type === "Equals" /* Equals */;
    }
    return false;
  }
  isExpressionStatementStart() {
    const first = this.stream.peekNonWhitespace(0);
    if (!first) {
      return false;
    }
    if (first.type === "Identifier" /* Identifier */) {
      return true;
    }
    return first.type === "Number" /* Number */ || first.type === "String" /* String */ || first.type === "Boolean" /* Boolean */ || first.type === "Null" /* Null */ || first.type === "LParen" /* LParen */ || first.type === "LBracket" /* LBracket */ || first.type === "LBrace" /* LBrace */ || first.type === "At" /* At */ || first.type === "Dollar" /* Dollar */ || first.type === "Hash" /* Hash */ || first.type === "Question" /* Question */ || first.type === "Bang" /* Bang */ || first.type === "Minus" /* Minus */;
  }
  isImplicitBehaviorStart() {
    const first = this.stream.peekNonWhitespace(0);
    if (!first || !this.isSelectorStartToken(first)) {
      return false;
    }
    let index = 0;
    let parenthesisDepth = 0;
    let bracketDepth = 0;
    let sawTopLevelColon = false;
    while (true) {
      const token = this.stream.peekNonWhitespace(index);
      if (!token) {
        return false;
      }
      if (token.type === "LBrace" /* LBrace */ && parenthesisDepth === 0 && bracketDepth === 0) {
        return true;
      }
      if (token.type === "Semicolon" /* Semicolon */ || token.type === "RBrace" /* RBrace */) {
        return false;
      }
      if (parenthesisDepth === 0 && bracketDepth === 0) {
        if (token.type === "Equals" /* Equals */ || token.type === "Arrow" /* Arrow */ || token.type === "DoubleEquals" /* DoubleEquals */ || token.type === "TripleEquals" /* TripleEquals */ || token.type === "NotEquals" /* NotEquals */ || token.type === "StrictNotEquals" /* StrictNotEquals */ || token.type === "And" /* And */ || token.type === "Or" /* Or */ || token.type === "Pipe" /* Pipe */ || token.type === "Question" /* Question */) {
          return false;
        }
        if (token.type === "Colon" /* Colon */) {
          sawTopLevelColon = true;
        }
        if (token.type === "LParen" /* LParen */ && !sawTopLevelColon) {
          return false;
        }
        if ((token.type === "Plus" /* Plus */ || token.type === "Minus" /* Minus */ || token.type === "Star" /* Star */ || token.type === "Slash" /* Slash */ || token.type === "Tilde" /* Tilde */) && this.stream.peekNonWhitespace(index + 1)?.type === "Equals" /* Equals */) {
          return false;
        }
      }
      if (token.type === "LParen" /* LParen */) {
        parenthesisDepth += 1;
      } else if (token.type === "RParen" /* RParen */) {
        if (parenthesisDepth === 0) {
          return false;
        }
        parenthesisDepth -= 1;
      } else if (token.type === "LBracket" /* LBracket */) {
        bracketDepth += 1;
      } else if (token.type === "RBracket" /* RBracket */) {
        if (bracketDepth === 0) {
          return false;
        }
        bracketDepth -= 1;
      }
      index += 1;
    }
  }
  isSelectorStartToken(token) {
    return token.type === "Identifier" /* Identifier */ || token.type === "Dot" /* Dot */ || token.type === "Hash" /* Hash */ || token.type === "LBracket" /* LBracket */ || token.type === "Colon" /* Colon */ || token.type === "Star" /* Star */ || token.type === "Greater" /* Greater */ || token.type === "Less" /* Less */ || token.type === "Plus" /* Plus */ || token.type === "Minus" /* Minus */ || token.type === "Tilde" /* Tilde */ || token.type === "Ampersand" /* Ampersand */;
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
    const indexAfterParams = this.stream.indexAfterDelimited("LParen" /* LParen */, "RParen" /* RParen */, index);
    if (indexAfterParams === null) {
      return false;
    }
    return this.stream.peekNonWhitespace(indexAfterParams)?.type === "LBrace" /* LBrace */;
  }
  isArrowFunctionStart() {
    const first = this.stream.peekNonWhitespace(0);
    if (!first || first.type !== "LParen" /* LParen */) {
      return false;
    }
    const indexAfterParams = this.stream.indexAfterDelimited("LParen" /* LParen */, "RParen" /* RParen */, 0);
    if (indexAfterParams === null) {
      return false;
    }
    return this.stream.peekNonWhitespace(indexAfterParams)?.type === "Arrow" /* Arrow */;
  }
  isAsyncArrowFunctionStart() {
    const first = this.stream.peekNonWhitespace(0);
    if (!this.isAsyncToken(first)) {
      return false;
    }
    if (this.stream.peekNonWhitespace(1)?.type !== "LParen" /* LParen */) {
      return false;
    }
    const indexAfterParams = this.stream.indexAfterDelimited("LParen" /* LParen */, "RParen" /* RParen */, 1);
    if (indexAfterParams === null) {
      return false;
    }
    return this.stream.peekNonWhitespace(indexAfterParams)?.type === "Arrow" /* Arrow */;
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
    const indexAfterParams = this.stream.indexAfterDelimited("LParen" /* LParen */, "RParen" /* RParen */, index);
    if (indexAfterParams === null) {
      return false;
    }
    return this.stream.peekNonWhitespace(indexAfterParams)?.type === "Arrow" /* Arrow */;
  }
  parseExpressionStatement() {
    const expr = this.parseExpression();
    this.consumeStatementTerminator();
    return expr;
  }
  parseIfBlock() {
    this.stream.expect("If" /* If */);
    this.stream.skipWhitespace();
    this.stream.expect("LParen" /* LParen */);
    this.stream.skipWhitespace();
    const test = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect("RParen" /* RParen */);
    const consequent = this.parseConditionalBody();
    this.stream.skipWhitespace();
    let alternate;
    if (this.stream.peek()?.type === "Else" /* Else */) {
      this.stream.next();
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === "If" /* If */) {
        const nested = this.parseIfBlock();
        alternate = new BlockNode([nested]);
      } else {
        alternate = this.parseConditionalBody();
      }
    }
    return new IfNode(test, consequent, alternate);
  }
  parseConditionalBody() {
    this.stream.skipWhitespace();
    if (this.stream.peek()?.type === "LBrace" /* LBrace */) {
      return this.parseBlock({ allowDeclarations: false });
    }
    const statement = this.parseStatement({ allowBlocks: false, allowReturn: this.functionDepth > 0 });
    return new BlockNode([statement]);
  }
  parseWhileBlock() {
    this.stream.expect("While" /* While */);
    this.stream.skipWhitespace();
    this.stream.expect("LParen" /* LParen */);
    this.stream.skipWhitespace();
    const test = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect("RParen" /* RParen */);
    const body = this.parseBlock({ allowDeclarations: false });
    return new WhileNode(test, body);
  }
  parseForBlock() {
    this.stream.expect("For" /* For */);
    this.stream.skipWhitespace();
    this.stream.expect("LParen" /* LParen */);
    this.stream.skipWhitespace();
    const eachKind = this.detectForEachKind();
    if (eachKind) {
      const target = this.parseForEachTarget();
      this.stream.skipWhitespace();
      const keyword = this.stream.expect("Identifier" /* Identifier */);
      if (keyword.value !== eachKind) {
        throw new Error(`Expected '${eachKind}' but got '${keyword.value}'`);
      }
      this.stream.skipWhitespace();
      const iterable = this.parseExpression();
      this.stream.skipWhitespace();
      this.stream.expect("RParen" /* RParen */);
      const body2 = this.parseBlock({ allowDeclarations: false });
      return new ForEachNode(target, iterable, eachKind, body2);
    }
    let init;
    if (this.stream.peek()?.type !== "Semicolon" /* Semicolon */) {
      init = this.parseForClause();
    }
    this.stream.skipWhitespace();
    this.stream.expect("Semicolon" /* Semicolon */);
    this.stream.skipWhitespace();
    let test;
    if (this.stream.peek()?.type !== "Semicolon" /* Semicolon */) {
      test = this.parseExpression();
    }
    this.stream.skipWhitespace();
    this.stream.expect("Semicolon" /* Semicolon */);
    this.stream.skipWhitespace();
    let update;
    if (this.stream.peek()?.type !== "RParen" /* RParen */) {
      update = this.parseForClause();
    }
    this.stream.skipWhitespace();
    this.stream.expect("RParen" /* RParen */);
    const body = this.parseBlock({ allowDeclarations: false });
    return new ForNode(init, test, update, body);
  }
  detectForEachKind() {
    let offset = 0;
    let depth = 0;
    while (true) {
      const token = this.stream.peekNonWhitespace(offset);
      if (!token) {
        return null;
      }
      if (token.type === "LParen" /* LParen */ || token.type === "LBracket" /* LBracket */ || token.type === "LBrace" /* LBrace */) {
        depth += 1;
      } else if (token.type === "RParen" /* RParen */ || token.type === "RBracket" /* RBracket */ || token.type === "RBrace" /* RBrace */) {
        if (depth === 0) {
          return null;
        }
        depth -= 1;
      }
      if (depth === 0) {
        if (token.type === "Semicolon" /* Semicolon */) {
          return null;
        }
        if (token.type === "Identifier" /* Identifier */ && (token.value === "in" || token.value === "of")) {
          return token.value;
        }
      }
      offset += 1;
    }
  }
  parseForEachTarget() {
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Expected for-each target");
    }
    if (token.type !== "Identifier" /* Identifier */) {
      throw new Error("for-in/of target must be an identifier");
    }
    return new IdentifierExpression(this.stream.next().value);
  }
  parseForClause() {
    if (this.isAssignmentStart()) {
      return this.parseAssignmentExpression();
    }
    return this.parseExpression();
  }
  parseAssignmentExpression() {
    const target = this.parseAssignmentTarget();
    this.stream.skipWhitespace();
    const operator = this.parseAssignmentOperator();
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    return new AssignmentNode(target, value, operator);
  }
  parseAssignmentOperator() {
    const next = this.stream.peek();
    if (!next) {
      throw new Error("Expected assignment operator");
    }
    if (next.type === "Equals" /* Equals */) {
      this.stream.next();
      return "=";
    }
    if (next.type === "Tilde" /* Tilde */) {
      this.stream.next();
      this.stream.expect("Equals" /* Equals */);
      return "~=";
    }
    if (next.type === "Plus" /* Plus */ || next.type === "Minus" /* Minus */ || next.type === "Star" /* Star */ || next.type === "Slash" /* Slash */) {
      const op = this.stream.next();
      this.stream.expect("Equals" /* Equals */);
      if (op.type === "Plus" /* Plus */) {
        return "+=";
      }
      if (op.type === "Minus" /* Minus */) {
        return "-=";
      }
      if (op.type === "Star" /* Star */) {
        return "*=";
      }
      return "/=";
    }
    throw new Error("Expected assignment operator");
  }
  parseTryBlock() {
    this.stream.expect("Try" /* Try */);
    const body = this.parseBlock({ allowDeclarations: false });
    this.stream.skipWhitespace();
    this.stream.expect("Catch" /* Catch */);
    this.stream.skipWhitespace();
    this.stream.expect("LParen" /* LParen */);
    this.stream.skipWhitespace();
    const errorName = this.stream.expect("Identifier" /* Identifier */).value;
    this.stream.skipWhitespace();
    this.stream.expect("RParen" /* RParen */);
    const handler = this.parseBlock({ allowDeclarations: false });
    return new TryNode(body, errorName, handler);
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
    const params = this.parseFunctionParams();
    this.stream.skipWhitespace();
    const body = this.parseFunctionBlockWithAwait(isAsync);
    return new FunctionDeclarationNode(name, params, body, isAsync);
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
  parseAssertStatement() {
    this.stream.expect("Assert" /* Assert */);
    this.stream.skipWhitespace();
    const test = this.parseExpression();
    this.consumeStatementTerminator();
    return new AssertNode(test);
  }
  parseBreakStatement() {
    this.stream.expect("Break" /* Break */);
    this.consumeStatementTerminator();
    return new BreakNode();
  }
  parseContinueStatement() {
    this.stream.expect("Continue" /* Continue */);
    this.consumeStatementTerminator();
    return new ContinueNode();
  }
  parseArrowFunctionExpression(isAsync = false) {
    const params = this.parseFunctionParams();
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
  parseFunctionParams() {
    this.stream.expect("LParen" /* LParen */);
    const params = [];
    let sawRest = false;
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
      if (next.type === "Ellipsis" /* Ellipsis */) {
        if (sawRest) {
          throw new Error("Function parameters can only include one rest parameter");
        }
        this.stream.next();
        this.stream.skipWhitespace();
        const name2 = this.stream.expect("Identifier" /* Identifier */).value;
        params.push({ name: name2, rest: true });
        sawRest = true;
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === "Comma" /* Comma */) {
          throw new Error("Rest parameter must be last in function parameters");
        }
        this.stream.expect("RParen" /* RParen */);
        break;
      }
      const name = this.stream.expect("Identifier" /* Identifier */).value;
      this.stream.skipWhitespace();
      let defaultValue;
      if (this.stream.peek()?.type === "Equals" /* Equals */) {
        this.stream.next();
        this.stream.skipWhitespace();
        defaultValue = this.parseExpression();
      }
      params.push(defaultValue ? { name, defaultValue } : { name });
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
    return params;
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
var proxyToRaw = /* @__PURE__ */ new WeakMap();
var arrayMutators = /* @__PURE__ */ new Set([
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift"
]);
var batchDepth = 0;
var flushing = false;
var pendingListeners = /* @__PURE__ */ new Map();
var currentFlushHandlers;
var processedFlushHandlers;
var trackerStack = [];
function trackScopeRead(scope, path) {
  trackerStack[trackerStack.length - 1]?.trackScopeRead(scope, path);
}
function trackComputed(source) {
  trackerStack[trackerStack.length - 1]?.trackComputed(source);
}
function withTracker(tracker, callback) {
  trackerStack.push(tracker);
  try {
    return callback();
  } finally {
    trackerStack.pop();
  }
}
function withoutTracking(callback) {
  const activeTrackers = trackerStack.splice(0);
  try {
    return callback();
  } finally {
    trackerStack.push(...activeTrackers);
  }
}
function batch(callback) {
  batchDepth += 1;
  let result;
  try {
    result = callback();
  } catch (error) {
    endBatch();
    throw error;
  }
  endBatch();
  return result;
}
function endBatch() {
  batchDepth -= 1;
  if (batchDepth === 0) {
    flushPendingListeners();
  }
}
function notifyListener(entry) {
  if (!entry.active) {
    return;
  }
  if (batchDepth > 0 || flushing) {
    if (flushing && currentFlushHandlers?.has(entry.handler) && !processedFlushHandlers?.has(entry.handler)) {
      return;
    }
    const entries = pendingListeners.get(entry.handler) ?? /* @__PURE__ */ new Set();
    entries.add(entry);
    pendingListeners.set(entry.handler, entries);
    return;
  }
  withoutTracking(entry.handler);
}
function flushPendingListeners() {
  if (flushing) {
    return;
  }
  flushing = true;
  let failed = false;
  let firstError;
  try {
    while (pendingListeners.size > 0) {
      const entries = Array.from(pendingListeners.entries());
      pendingListeners.clear();
      currentFlushHandlers = new Set(entries.map(([handler]) => handler));
      processedFlushHandlers = /* @__PURE__ */ new Set();
      for (const [handler, registrations] of entries) {
        if (!Array.from(registrations).some((entry) => entry.active)) {
          continue;
        }
        processedFlushHandlers.add(handler);
        try {
          withoutTracking(handler);
        } catch (error) {
          if (!failed) {
            failed = true;
            firstError = error;
          }
        }
      }
      currentFlushHandlers = void 0;
      processedFlushHandlers = void 0;
    }
  } finally {
    currentFlushHandlers = void 0;
    processedFlushHandlers = void 0;
    flushing = false;
  }
  if (failed) {
    throw firstError;
  }
}
var ReactiveTracker = class {
  isDisposed = false;
  scopeDependencies = /* @__PURE__ */ new Map();
  computedDependencies = /* @__PURE__ */ new Map();
  nextScopeDependencies = /* @__PURE__ */ new Map();
  nextComputedDependencies = /* @__PURE__ */ new Set();
  tracking = false;
  invalidateListener = () => this.invalidate();
  collect(callback) {
    if (this.isDisposed) {
      return callback();
    }
    this.nextScopeDependencies = /* @__PURE__ */ new Map();
    this.nextComputedDependencies = /* @__PURE__ */ new Set();
    this.tracking = true;
    try {
      return withTracker(this, callback);
    } finally {
      this.tracking = false;
      this.commitDependencies();
    }
  }
  trackScopeRead(scope, path) {
    if (!this.tracking || this.isDisposed) {
      return;
    }
    const key = path.trim();
    if (!key) {
      return;
    }
    const paths = this.nextScopeDependencies.get(scope) ?? /* @__PURE__ */ new Set();
    paths.add(key);
    this.nextScopeDependencies.set(scope, paths);
  }
  trackComputed(source) {
    if (!this.tracking || this.isDisposed) {
      return;
    }
    this.nextComputedDependencies.add(source);
  }
  disposeTracking() {
    if (this.isDisposed) {
      return;
    }
    this.isDisposed = true;
    for (const [scope, paths] of this.scopeDependencies) {
      for (const path of paths) {
        scope.off(path, this.invalidateListener);
      }
    }
    this.scopeDependencies.clear();
    for (const remove of this.computedDependencies.values()) {
      remove();
    }
    this.computedDependencies.clear();
  }
  commitDependencies() {
    if (this.isDisposed) {
      return;
    }
    for (const [scope, paths] of this.scopeDependencies) {
      for (const path of paths) {
        scope.off(path, this.invalidateListener);
      }
    }
    this.scopeDependencies = this.nextScopeDependencies;
    for (const [source, remove] of this.computedDependencies) {
      if (!this.nextComputedDependencies.has(source)) {
        remove();
      }
    }
    const nextComputedDependencies = /* @__PURE__ */ new Map();
    for (const source of this.nextComputedDependencies) {
      const existing = this.computedDependencies.get(source);
      if (existing) {
        nextComputedDependencies.set(source, existing);
      } else {
        nextComputedDependencies.set(source, source.subscribe(this.invalidateListener));
      }
    }
    this.computedDependencies = nextComputedDependencies;
    for (const [scope, paths] of this.scopeDependencies) {
      for (const path of paths) {
        scope.on(path, this.invalidateListener);
      }
    }
  }
};
var ComputedState = class extends ReactiveTracker {
  constructor(scope, getter, lifetime, onDispose) {
    super();
    this.scope = scope;
    this.getter = getter;
    this.onDispose = onDispose;
    if (lifetime) {
      this.removeLifetime = lifetime.onCleanup(() => this.dispose());
    }
  }
  currentValue;
  dirty = true;
  evaluating = false;
  subscribers = /* @__PURE__ */ new Set();
  removeLifetime;
  get value() {
    return this.get();
  }
  get() {
    trackComputed(this);
    if (this.isDisposed) {
      return this.currentValue;
    }
    if (this.dirty) {
      this.recompute();
    }
    return this.currentValue;
  }
  subscribe(listener) {
    if (typeof listener !== "function") {
      throw new TypeError("Computed subscribers must be functions");
    }
    if (this.isDisposed) {
      return () => void 0;
    }
    const entry = { handler: listener, active: true };
    const existing = Array.from(this.subscribers).find(
      (candidate) => candidate.active && candidate.handler === listener
    );
    if (existing) {
      return () => void 0;
    }
    this.subscribers.add(entry);
    try {
      this.get();
    } catch (error) {
      entry.active = false;
      this.subscribers.delete(entry);
      throw error;
    }
    return () => {
      if (!entry.active) {
        return;
      }
      entry.active = false;
      this.subscribers.delete(entry);
    };
  }
  dispose() {
    if (this.isDisposed) {
      return;
    }
    this.removeLifetime?.();
    this.removeLifetime = void 0;
    this.disposeTracking();
    for (const entry of this.subscribers) {
      entry.active = false;
    }
    this.subscribers.clear();
    this.onDispose?.();
  }
  invalidate() {
    if (this.isDisposed || this.dirty) {
      return;
    }
    this.dirty = true;
    if (this.subscribers.size === 0) {
      return;
    }
    const previousValue = this.currentValue;
    const nextValue = this.recompute();
    if (!Object.is(previousValue, nextValue)) {
      for (const entry of this.subscribers) {
        notifyListener(entry);
      }
    }
  }
  recompute() {
    if (this.evaluating) {
      throw new Error("Computed state cannot depend on itself");
    }
    this.evaluating = true;
    try {
      const nextValue = this.collect(() => this.getter(this.scope));
      this.currentValue = nextValue;
      this.dirty = false;
      return nextValue;
    } catch (error) {
      this.dirty = true;
      throw error;
    } finally {
      this.evaluating = false;
    }
  }
};
var ReactiveEffect = class extends ReactiveTracker {
  constructor(scope, callback, lifetime) {
    super();
    this.scope = scope;
    this.callback = callback;
    if (lifetime) {
      this.removeLifetime = lifetime.onCleanup(() => this.dispose());
    }
    try {
      this.run();
    } catch (error) {
      this.dispose();
      throw error;
    }
  }
  running = false;
  rerunRequested = false;
  cleanup;
  removeLifetime;
  dispose() {
    if (this.isDisposed) {
      return;
    }
    this.removeLifetime?.();
    this.removeLifetime = void 0;
    this.disposeTracking();
    const cleanup = this.cleanup;
    this.cleanup = void 0;
    cleanup?.();
  }
  invalidate() {
    if (this.isDisposed) {
      return;
    }
    if (this.running) {
      this.rerunRequested = true;
      return;
    }
    this.run();
  }
  run() {
    if (this.isDisposed || this.running) {
      this.rerunRequested = true;
      return;
    }
    do {
      this.rerunRequested = false;
      this.running = true;
      const cleanup = this.cleanup;
      this.cleanup = void 0;
      try {
        cleanup?.();
        const nextCleanup = this.collect(() => this.callback(this.scope));
        if (typeof nextCleanup === "function") {
          this.cleanup = nextCleanup;
        }
      } finally {
        this.running = false;
      }
    } while (this.rerunRequested && !this.isDisposed);
  }
};
function isReactiveContainer(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function unwrapProxy(value) {
  let current = value;
  let raw = current && typeof current === "object" ? proxyToRaw.get(current) : void 0;
  while (raw && raw !== current) {
    current = raw;
    raw = current && typeof current === "object" ? proxyToRaw.get(current) : void 0;
  }
  return current;
}
var Scope = class _Scope {
  constructor(parent) {
    this.parent = parent;
    this.root = parent ? parent.root : this;
  }
  data = /* @__PURE__ */ new Map();
  computedValues = /* @__PURE__ */ new Map();
  root;
  listeners = /* @__PURE__ */ new Map();
  anyListeners = /* @__PURE__ */ new Set();
  reactiveProxies = /* @__PURE__ */ new WeakMap();
  isEachItem = false;
  createChild() {
    return new _Scope(this);
  }
  setParent(parent) {
    if (this.parent) {
      return;
    }
    this.parent = parent;
    this.root = parent.root;
  }
  get(key) {
    return this.getPath(key);
  }
  set(key, value) {
    this.setPath(key, value);
  }
  batch(callback) {
    return batch(callback);
  }
  computed(nameOrGetter, getterOrOptions, options) {
    if (typeof nameOrGetter === "function") {
      return computed(this, nameOrGetter, getterOrOptions);
    }
    const name = nameOrGetter.trim();
    const getter = getterOrOptions;
    if (!name || name.includes(".")) {
      throw new Error("Named computed state requires a non-empty root key");
    }
    if (typeof getter !== "function") {
      throw new TypeError("Computed state requires a getter function");
    }
    if (this.data.has(name) || this.computedValues.has(name)) {
      throw new Error(`Cannot define computed state '${name}' more than once`);
    }
    const state = new ComputedState(
      this,
      getter,
      options?.lifetime,
      () => {
        if (this.computedValues.get(name) === state) {
          this.computedValues.delete(name);
          this.emitChange(name);
        }
      }
    );
    this.computedValues.set(name, state);
    try {
      state.subscribe(() => this.emitChange(name));
    } catch (error) {
      state.dispose();
      throw error;
    }
    this.emitChange(name);
    return state;
  }
  effect(callback, options) {
    return effect(this, callback, options);
  }
  hasKey(path) {
    const parts = path.split(".");
    const root = parts[0];
    if (!root) {
      return false;
    }
    return this.data.has(root) || this.computedValues.has(root);
  }
  getPath(path) {
    const explicit = path.startsWith("parent.") || path.startsWith("root.") || path.startsWith("self.");
    const { targetScope, targetPath } = this.resolveScope(path);
    if (!targetScope || !targetPath) {
      return void 0;
    }
    const localValue = this.getLocalPathValue(targetScope, targetPath);
    if (explicit || targetScope.hasKey(targetPath)) {
      if (!targetScope.computedValues.has(targetPath.split(".")[0] ?? "")) {
        trackScopeRead(targetScope, targetPath);
      }
      return targetScope.wrapValue(localValue, targetPath);
    }
    const lookupScopes = [targetScope];
    let cursor = targetScope.parent;
    while (cursor) {
      lookupScopes.push(cursor);
      const value = this.getLocalPathValue(cursor, targetPath);
      if (cursor.hasKey(targetPath)) {
        if (!cursor.computedValues.has(targetPath.split(".")[0] ?? "")) {
          trackScopeRead(cursor, targetPath);
        }
        return cursor.wrapValue(value, targetPath);
      }
      cursor = cursor.parent;
    }
    lookupScopes.forEach((scope) => trackScopeRead(scope, targetPath));
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
    const nextValue = unwrapProxy(value);
    if (parts.length === 1) {
      if (scopeForSet.computedValues.has(root)) {
        throw new Error(`Cannot assign to computed state '${root}'`);
      }
      scopeForSet.data.set(root, nextValue);
      scopeForSet.emitChange(targetPath);
      return;
    }
    if (scopeForSet.computedValues.has(root)) {
      throw new Error(`Cannot assign to computed state '${root}'`);
    }
    let obj = unwrapProxy(scopeForSet.data.get(root));
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
      const current = unwrapProxy(cursor[key]);
      if (current == null || typeof current !== "object") {
        cursor[key] = {};
      } else if (current !== cursor[key]) {
        cursor[key] = current;
      }
      cursor = cursor[key];
    }
    const lastKey = parts[parts.length - 1];
    if (!lastKey) {
      return;
    }
    cursor[lastKey] = nextValue;
    scopeForSet.emitChange(targetPath);
  }
  on(path, handler) {
    const key = path.trim();
    if (!key) {
      return;
    }
    const set = this.listeners.get(key) ?? /* @__PURE__ */ new Set();
    if (!Array.from(set).some((entry) => entry.active && entry.handler === handler)) {
      set.add({ handler, active: true });
    }
    this.listeners.set(key, set);
  }
  off(path, handler) {
    const key = path.trim();
    const set = this.listeners.get(key);
    if (!set) {
      return;
    }
    for (const entry of set) {
      if (entry.handler === handler) {
        entry.active = false;
        set.delete(entry);
      }
    }
    if (set.size === 0) {
      this.listeners.delete(key);
    }
  }
  onAny(handler) {
    if (!Array.from(this.anyListeners).some((entry) => entry.active && entry.handler === handler)) {
      this.anyListeners.add({ handler, active: true });
    }
  }
  offAny(handler) {
    for (const entry of this.anyListeners) {
      if (entry.handler === handler) {
        entry.active = false;
        this.anyListeners.delete(entry);
      }
    }
  }
  emitChange(path) {
    const key = path.trim();
    if (!key) {
      return;
    }
    const handlers = /* @__PURE__ */ new Set();
    for (const [watchedPath, listeners] of this.listeners.entries()) {
      if (watchedPath === key || watchedPath.startsWith(`${key}.`) || key.startsWith(`${watchedPath}.`)) {
        listeners.forEach((handler) => handlers.add(handler));
      }
    }
    batch(() => {
      handlers.forEach((entry) => notifyListener(entry));
      this.anyListeners.forEach((entry) => notifyListener(entry));
    });
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
    const computed2 = scope.computedValues.get(root);
    let value = computed2 ? computed2.get() : scope.data.get(root);
    for (let i = 1; i < parts.length; i += 1) {
      if (value == null) {
        return void 0;
      }
      const key = parts[i];
      if (!key) {
        return void 0;
      }
      value = unwrapProxy(value)[key];
    }
    return unwrapProxy(value);
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
  wrapValue(value, path) {
    const rawValue = unwrapProxy(value);
    if (!isReactiveContainer(rawValue)) {
      return value;
    }
    const existing = this.reactiveProxies.get(rawValue);
    const cached = existing?.get(path);
    if (cached) {
      return cached;
    }
    const scope = this;
    const proxy = new Proxy(rawValue, {
      get(target, property, receiver) {
        if (Array.isArray(target) && property === Symbol.iterator) {
          return function* iterator() {
            trackScopeRead(scope, scope.appendPath(path, "length"));
            for (let index = 0; index < target.length; index += 1) {
              const itemPath = scope.appendPath(path, String(index));
              trackScopeRead(scope, itemPath);
              yield scope.wrapValue(target[index], itemPath);
            }
          };
        }
        const nextValue = Reflect.get(target, property, receiver);
        if (Array.isArray(target) && typeof property === "string" && arrayMutators.has(property)) {
          if (typeof nextValue !== "function") {
            return nextValue;
          }
          return (...args) => batch(() => Reflect.apply(nextValue, receiver, args));
        }
        if (typeof property !== "string") {
          return nextValue;
        }
        const propertyPath = scope.appendPath(path, property);
        trackScopeRead(scope, propertyPath);
        return scope.wrapValue(nextValue, propertyPath);
      },
      set(target, property, nextValue) {
        const rawNextValue = unwrapProxy(nextValue);
        const previousValue = Reflect.get(target, property, target);
        const previousLength = Array.isArray(target) ? target.length : void 0;
        const success = Reflect.set(target, property, rawNextValue, target);
        if (!success) {
          return false;
        }
        if (!Object.is(previousValue, rawNextValue)) {
          const propertyPath = typeof property === "string" ? scope.appendPath(path, property) : path;
          scope.emitChange(propertyPath);
          if (Array.isArray(target) && previousLength !== target.length) {
            scope.emitChange(scope.appendPath(path, "length"));
          }
        }
        return true;
      },
      deleteProperty(target, property) {
        const existed = Reflect.has(target, property);
        const success = Reflect.deleteProperty(target, property);
        if (success && existed) {
          const propertyPath = typeof property === "string" ? scope.appendPath(path, property) : path;
          scope.emitChange(propertyPath);
        }
        return success;
      },
      defineProperty(target, property, descriptor) {
        const previousLength = Array.isArray(target) ? target.length : void 0;
        const nextDescriptor = { ...descriptor };
        if ("value" in nextDescriptor) {
          nextDescriptor.value = unwrapProxy(nextDescriptor.value);
        }
        const success = Reflect.defineProperty(target, property, nextDescriptor);
        if (success) {
          const propertyPath = typeof property === "string" ? scope.appendPath(path, property) : path;
          scope.emitChange(propertyPath);
          if (Array.isArray(target) && previousLength !== target.length) {
            scope.emitChange(scope.appendPath(path, "length"));
          }
        }
        return success;
      }
    });
    proxyToRaw.set(proxy, rawValue);
    const cache = existing ?? /* @__PURE__ */ new Map();
    cache.set(path, proxy);
    this.reactiveProxies.set(rawValue, cache);
    return proxy;
  }
  appendPath(path, property) {
    if (!property) {
      return path;
    }
    return path ? `${path}.${property}` : property;
  }
};
function computed(scope, getter, options) {
  if (!(scope instanceof Scope)) {
    throw new TypeError("Computed state requires a Scope");
  }
  if (typeof getter !== "function") {
    throw new TypeError("Computed state requires a getter function");
  }
  return new ComputedState(scope, getter, options?.lifetime);
}
function effect(scope, callback, options) {
  if (!(scope instanceof Scope)) {
    throw new TypeError("Effects require a Scope");
  }
  if (typeof callback !== "function") {
    throw new TypeError("Effects require a callback function");
  }
  const reactiveEffect = new ReactiveEffect(scope, callback, options?.lifetime);
  return () => reactiveEffect.dispose();
}

// src/runtime/bindings.ts
function isCheckableInput(element) {
  return element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio");
}
function getElementValue(element) {
  if (isCheckableInput(element)) {
    return element.checked;
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  if (element instanceof HTMLSelectElement) {
    return element.value;
  }
  return element.textContent ?? "";
}
function setElementValue(element, value) {
  if (isCheckableInput(element)) {
    const checked = value === true || value === "true" || value === 1 || value === "1";
    element.checked = checked;
    if (checked) {
      element.setAttribute("checked", "");
    } else {
      element.removeAttribute("checked");
    }
    return;
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const nextValue = value == null ? "" : String(value);
    element.value = nextValue;
    element.setAttribute("value", nextValue);
    return;
  }
  if (element instanceof HTMLSelectElement) {
    element.value = value == null ? "" : String(value);
    return;
  }
  if (element instanceof HTMLElement && element.querySelector("*")) {
    return;
  }
  element.textContent = value == null ? "" : String(value);
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
function applyDisplay(element, expression, scope) {
  element.style.display = readCondition(expression, scope) ? "" : "none";
}
function applyIf(element, expression, scope) {
  applyDisplay(element, expression, scope);
}
function applyShow(element, expression, scope) {
  applyDisplay(element, expression, scope);
}

// src/runtime/html.ts
function applyHtml(element, expression, scope) {
  const key = expression.trim();
  if (!key) {
    return;
  }
  const value = scope.get(key);
  const html = value == null ? "" : String(value);
  element.innerHTML = html;
}

// src/runtime/http.ts
async function applyGet(element, config, scope, onHtmlApplied) {
  if (!globalThis.fetch) {
    throw new Error("fetch is not available");
  }
  throwIfAborted(config.signal);
  const requestTarget = resolveTarget(element, config.targetSelector);
  const response = await globalThis.fetch(config.url, {
    headers: getPartialHeaders(element, requestTarget),
    ...config.signal ? { signal: config.signal } : {}
  });
  throwIfAborted(config.signal);
  if (!response || !response.ok) {
    return;
  }
  const html = await response.text();
  throwIfAborted(config.signal);
  const target = resolveTarget(element, config.targetSelector);
  if (!target) {
    element.dispatchEvent(new CustomEvent("vsn:targetError", { detail: { selector: config.targetSelector } }));
    return;
  }
  if (config.swap === "outer") {
    const wrapper = target.ownerDocument.createElement("div");
    applyHtml(wrapper, "__html", { get: () => html });
    const replacements = Array.from(wrapper.childNodes);
    const elements = Array.from(wrapper.children);
    if (replacements.length > 0 && target.parentNode) {
      const fragment = target.ownerDocument.createDocumentFragment();
      fragment.append(...replacements);
      target.parentNode.replaceChild(fragment, target);
      for (const element2 of elements) {
        onHtmlApplied?.(element2);
      }
    }
    return;
  }
  applyHtml(target, "__html", { get: () => html });
  onHtmlApplied?.(target);
}
function getPartialHeaders(element, target) {
  const headers = new Headers();
  headers.set("HX-Request", "true");
  const currentUrl = element.ownerDocument.defaultView?.location.href;
  if (currentUrl) {
    headers.set("HX-Current-URL", currentUrl);
  }
  const targetId = target?.getAttribute("id");
  if (targetId) {
    headers.set("HX-Target", targetId);
  }
  const triggerId = element.getAttribute("id");
  if (triggerId) {
    headers.set("HX-Trigger", triggerId);
  }
  const triggerName = element.getAttribute("name");
  if (triggerName) {
    headers.set("HX-Trigger-Name", triggerName);
  }
  return headers;
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
  const debounced = ((...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = void 0;
      fn(...args);
    }, waitMs);
  });
  debounced.cancel = () => {
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    timer = void 0;
  };
  return debounced;
}

// src/runtime/engine.ts
function isPromiseLike2(value) {
  return Boolean(value) && typeof value.then === "function";
}
function emptySpecificity() {
  return { ids: 0, classes: 0, elements: 0 };
}
function compareSpecificity(a, b) {
  return a.ids - b.ids || a.classes - b.classes || a.elements - b.elements;
}
function maxSpecificity(a, b) {
  return compareSpecificity(a, b) >= 0 ? a : b;
}
function addSpecificity(target, addition) {
  target.ids += addition.ids;
  target.classes += addition.classes;
  target.elements += addition.elements;
}
function specificityScore(counts) {
  return counts.ids * 1e6 + counts.classes * 1e3 + counts.elements;
}
function maxSelectorSpecificity(selectors) {
  return selectors.reduce(
    (best, selector) => maxSpecificity(best, computeSelectorSpecificity(selector)),
    emptySpecificity()
  );
}
function splitSelectorList(selector) {
  const groups = [];
  let start = 0;
  let quote = "";
  let escaped = false;
  let bracketDepth = 0;
  let parenDepth = 0;
  for (let i = 0; i < selector.length; i += 1) {
    const char = selector[i] ?? "";
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "[") {
      bracketDepth += 1;
      continue;
    }
    if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }
    if (char === "(") {
      parenDepth += 1;
      continue;
    }
    if (char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }
    if (char === "," && bracketDepth === 0 && parenDepth === 0) {
      const group = selector.slice(start, i).trim();
      if (group) {
        groups.push(group);
      }
      start = i + 1;
    }
  }
  const finalGroup = selector.slice(start).trim();
  if (finalGroup) {
    groups.push(finalGroup);
  }
  return groups;
}
function replaceNestingSelector(selector, parentSelector) {
  let result = "";
  let quote = "";
  let bracketDepth = 0;
  let replaced = false;
  for (let i = 0; i < selector.length; i += 1) {
    const char = selector[i] ?? "";
    if (quote) {
      result += char;
      if (char === "\\") {
        const escaped = selector[i + 1];
        if (escaped !== void 0) {
          result += escaped;
          i += 1;
        }
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      result += char;
      continue;
    }
    if (char === "\\") {
      result += char;
      const escaped = selector[i + 1];
      if (escaped !== void 0) {
        result += escaped;
        i += 1;
      }
      continue;
    }
    if (char === "[") {
      bracketDepth += 1;
      result += char;
      continue;
    }
    if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      result += char;
      continue;
    }
    if (char === "&" && bracketDepth === 0) {
      result += parentSelector;
      replaced = true;
      continue;
    }
    result += char;
  }
  return { selector: result, replaced };
}
function hasNestingSelector(selector) {
  return splitSelectorList(selector).some((group) => replaceNestingSelector(group, "").replaced);
}
function composeNestedSelector(parentSelector, nestedSelector) {
  const parentGroups = splitSelectorList(parentSelector);
  const nestedGroups = splitSelectorList(nestedSelector);
  const composedGroups = [];
  for (const parentGroup of parentGroups) {
    for (const nestedGroup of nestedGroups) {
      const replacement = replaceNestingSelector(nestedGroup, parentGroup);
      composedGroups.push(replacement.replaced ? replacement.selector : `${parentGroup} ${nestedGroup}`);
    }
  }
  return composedGroups.join(", ");
}
function isSelectorNameChar(char) {
  return Boolean(char && /[A-Za-z0-9_-]/.test(char));
}
function readSelectorName(selector, start) {
  let end = start;
  while (end < selector.length) {
    const char = selector[end];
    if (isSelectorNameChar(char)) {
      end += 1;
      continue;
    }
    if (char === "\\" && end + 1 < selector.length) {
      end += 2;
      continue;
    }
    break;
  }
  return end;
}
function readBalancedSelector(selector, start, open, close) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let i = start; i < selector.length; i += 1) {
    const char = selector[i] ?? "";
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === open) {
      depth += 1;
      continue;
    }
    if (char === close) {
      depth -= 1;
      if (depth === 0) {
        return { content: selector.slice(start + 1, i), end: i + 1 };
      }
    }
  }
  return { content: selector.slice(start + 1), end: selector.length };
}
function findSelectorKeyword(selector, keyword) {
  let quote = "";
  let escaped = false;
  let bracketDepth = 0;
  let parenDepth = 0;
  for (let i = 0; i <= selector.length - keyword.length; i += 1) {
    const char = selector[i] ?? "";
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "[") {
      bracketDepth += 1;
      continue;
    }
    if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }
    if (char === "(") {
      parenDepth += 1;
      continue;
    }
    if (char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }
    if (bracketDepth !== 0 || parenDepth !== 0) {
      continue;
    }
    if (selector.slice(i, i + keyword.length).toLowerCase() !== keyword.toLowerCase()) {
      continue;
    }
    const before = selector[i - 1];
    const after = selector[i + keyword.length];
    if (!isSelectorNameChar(before) && !isSelectorNameChar(after)) {
      return i;
    }
  }
  return -1;
}
function computeSelectorSpecificity(selector) {
  const counts = emptySpecificity();
  let compoundStart = true;
  for (let i = 0; i < selector.length; ) {
    const char = selector[i] ?? "";
    if (/\s/.test(char) || char === ">" || char === "+" || char === "~") {
      compoundStart = true;
      i += 1;
      continue;
    }
    if (char === "*") {
      compoundStart = false;
      i += 1;
      continue;
    }
    if (char === "[") {
      counts.classes += 1;
      const balanced = readBalancedSelector(selector, i, "[", "]");
      i = balanced.end;
      compoundStart = false;
      continue;
    }
    if (char === "#") {
      const end2 = readSelectorName(selector, i + 1);
      if (end2 > i + 1) {
        counts.ids += 1;
      }
      i = end2;
      compoundStart = false;
      continue;
    }
    if (char === ".") {
      const end2 = readSelectorName(selector, i + 1);
      if (end2 > i + 1) {
        counts.classes += 1;
      }
      i = end2;
      compoundStart = false;
      continue;
    }
    if (char === ":") {
      const pseudoElement = selector[i + 1] === ":";
      const nameStart = i + (pseudoElement ? 2 : 1);
      const nameEnd = readSelectorName(selector, nameStart);
      const name = selector.slice(nameStart, nameEnd).toLowerCase();
      i = nameEnd;
      if (pseudoElement) {
        counts.elements += 1;
      } else if (name === "where" && selector[i] === "(") {
        const balanced = readBalancedSelector(selector, i, "(", ")");
        i = balanced.end;
      } else if (name === "is" || name === "not" || name === "has") {
        if (selector[i] === "(") {
          const balanced = readBalancedSelector(selector, i, "(", ")");
          const argumentSpecificity = maxSelectorSpecificity(splitSelectorList(balanced.content));
          addSpecificity(counts, argumentSpecificity);
          i = balanced.end;
        }
      } else {
        counts.classes += 1;
        if (selector[i] === "(") {
          const balanced = readBalancedSelector(selector, i, "(", ")");
          if (name === "nth-child" || name === "nth-last-child") {
            const ofIndex = findSelectorKeyword(balanced.content, "of");
            if (ofIndex >= 0) {
              const argumentSpecificity = maxSelectorSpecificity(
                splitSelectorList(balanced.content.slice(ofIndex + 2))
              );
              addSpecificity(counts, argumentSpecificity);
            }
          }
          i = balanced.end;
        }
      }
      compoundStart = false;
      continue;
    }
    if (char === "|" && selector[i + 1] !== "|") {
      compoundStart = true;
      i += 1;
      continue;
    }
    const end = readSelectorName(selector, i);
    if (end > i) {
      if (compoundStart) {
        counts.elements += 1;
      }
      i = end;
      compoundStart = false;
      continue;
    }
    compoundStart = false;
    i += 1;
  }
  return counts;
}
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
  behaviorRegistryHashes = /* @__PURE__ */ new Set();
  behaviorEntriesById = /* @__PURE__ */ new Map();
  dynamicBehaviorIds = /* @__PURE__ */ new WeakMap();
  behaviorBoundElements = /* @__PURE__ */ new Map();
  behaviorBindings = /* @__PURE__ */ new WeakMap();
  behaviorRootScopes = /* @__PURE__ */ new WeakMap();
  behaviorLifetimes = /* @__PURE__ */ new WeakMap();
  inlineLifetimes = /* @__PURE__ */ new WeakMap();
  behaviorId = 0;
  codeCache = /* @__PURE__ */ new Map();
  behaviorCache = /* @__PURE__ */ new Map();
  observer;
  observerLifetime;
  attributeHandlers = [];
  htmlTransformers = [];
  htmlTransformerOrder = 0;
  globals = {};
  importantFlags = /* @__PURE__ */ new WeakMap();
  inlineDeclarations = /* @__PURE__ */ new WeakMap();
  flagHandlers = /* @__PURE__ */ new Map();
  behaviorModifiers = /* @__PURE__ */ new Map();
  pendingAdded = /* @__PURE__ */ new Set();
  pendingRemoved = /* @__PURE__ */ new Set();
  pendingUpdated = /* @__PURE__ */ new Set();
  observerFlush;
  ignoredAdded = /* @__PURE__ */ new WeakMap();
  diagnostics;
  logger;
  engineLifetime = new Lifetime();
  pendingUses = [];
  pendingAutoBindToScope = [];
  executionStack = [];
  groupProxyCache = /* @__PURE__ */ new WeakMap();
  scopeElements = /* @__PURE__ */ new WeakMap();
  classMapBindings = /* @__PURE__ */ new WeakMap();
  dynamicOwnerCleanupLifetimes = /* @__PURE__ */ new WeakMap();
  mountedRoots = /* @__PURE__ */ new Set();
  mountedDocuments = /* @__PURE__ */ new Set();
  inactiveSubtrees = /* @__PURE__ */ new WeakSet();
  constructor(options = {}) {
    this.diagnostics = options.diagnostics ?? false;
    this.logger = options.logger ?? console;
    this.registerGlobal("console", console);
    this.registerGlobal("batch", batch);
    this.registerGlobal("computed", (nameOrGetter, getter) => {
      const scope = this.getCurrentScope();
      if (!scope) {
        throw new Error("Computed state must be created during an engine execution");
      }
      const lifetime = this.getCurrentLifetime();
      const computedOptions = lifetime ? { lifetime } : void 0;
      if (typeof nameOrGetter === "string") {
        if (typeof getter !== "function") {
          throw new TypeError("Named computed state requires a getter function");
        }
        return scope.computed(nameOrGetter, getter, computedOptions);
      }
      if (typeof nameOrGetter !== "function") {
        throw new TypeError("Computed state requires a getter function");
      }
      return computed(scope, nameOrGetter, computedOptions);
    });
    this.registerGlobal("effect", (callback) => {
      const scope = this.getCurrentScope();
      if (!scope) {
        throw new Error("Effects must be created during an engine execution");
      }
      if (typeof callback !== "function") {
        throw new TypeError("Effects require a callback function");
      }
      const lifetime = this.getCurrentLifetime();
      const effectOptions = lifetime ? { lifetime } : void 0;
      return effect(scope, callback, effectOptions);
    });
    this.registerGlobal("onCleanup", (disposer) => {
      const lifetime = this.getCurrentLifetime();
      return lifetime ? lifetime.onCleanup(disposer) : () => void 0;
    });
    this.registerFlag("important");
    this.registerFlag("debounce", {
      onEventBind: ({ args }) => ({
        debounceMs: typeof args === "number" ? args : 200
      })
    });
    this.registerFlag("prevent", {
      onEventBefore: ({ event }) => {
        event?.preventDefault();
      }
    });
    this.registerFlag("stop", {
      onEventBefore: ({ event }) => {
        event?.stopPropagation();
      }
    });
    this.registerFlag("self", {
      onEventBefore: ({ event, element }) => {
        const target = event?.target;
        if (!(target instanceof Node)) {
          return false;
        }
        return target === element;
      }
    });
    this.registerFlag("outside", {
      onEventBind: ({ element }) => ({ listenerTarget: element.ownerDocument }),
      onEventBefore: ({ event, element }) => {
        const target = event?.target;
        if (!(target instanceof Node)) {
          return false;
        }
        return !element.contains(target);
      }
    });
    this.registerFlag("once", {
      onEventBind: () => ({ options: { once: true } })
    });
    this.registerFlag("passive", {
      onEventBind: () => ({ options: { passive: true } })
    });
    this.registerFlag("capture", {
      onEventBind: () => ({ options: { capture: true } })
    });
    this.registerFlag("shift", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "shift")
    });
    this.registerFlag("ctrl", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "ctrl")
    });
    this.registerFlag("control", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "ctrl")
    });
    this.registerFlag("alt", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "alt")
    });
    this.registerFlag("meta", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "meta")
    });
    this.registerFlag("enter", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "enter")
    });
    this.registerFlag("escape", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "escape")
    });
    this.registerFlag("esc", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "escape")
    });
    this.registerFlag("tab", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "tab")
    });
    this.registerFlag("space", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "space")
    });
    this.registerFlag("up", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowup")
    });
    this.registerFlag("down", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowdown")
    });
    this.registerFlag("left", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowleft")
    });
    this.registerFlag("right", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowright")
    });
    this.registerFlag("arrowup", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowup")
    });
    this.registerFlag("arrowdown", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowdown")
    });
    this.registerFlag("arrowleft", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowleft")
    });
    this.registerFlag("arrowright", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowright")
    });
    this.registerFlag("delete", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "delete")
    });
    this.registerFlag("backspace", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "backspace")
    });
    this.registerFlag("minwidth", {
      onEventBefore: ({ args }) => this.matchesMinWidth(args)
    });
    this.registerFlag("maxwidth", {
      onEventBefore: ({ args }) => this.matchesMaxWidth(args)
    });
    this.registerGlobal("minwidth", (value) => this.matchesMinWidth(value));
    this.registerGlobal("maxwidth", (value) => this.matchesMaxWidth(value));
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
    this.registerFlag("int", {
      transformValue: (_context, value) => this.coerceInt(value)
    });
    this.registerFlag("float", {
      transformValue: (_context, value) => this.coerceFloat(value)
    });
    this.registerBehaviorModifier("group", {
      onConstruct: ({ args, scope, rootScope, behavior, element }) => {
        const key = typeof args === "string" ? args : void 0;
        if (!key) {
          return;
        }
        const targetScope = this.getGroupTargetScope(element, behavior, scope, rootScope);
        const existing = targetScope.getPath?.(key);
        const list = Array.isArray(existing) ? existing : [];
        const proxy = this.getGroupProxy(scope);
        if (!list.includes(proxy)) {
          list.push(proxy);
          targetScope.setPath?.(key, list);
        } else if (!Array.isArray(existing)) {
          targetScope.setPath?.(key, list);
        }
      },
      onUnbind: ({ args, scope, rootScope, behavior, element }) => {
        const key = typeof args === "string" ? args : void 0;
        if (!key) {
          return;
        }
        const targetScope = this.getGroupTargetScope(element, behavior, scope, rootScope);
        const existing = targetScope.getPath?.(key);
        if (!Array.isArray(existing)) {
          return;
        }
        const proxy = this.getGroupProxy(scope);
        const next = existing.filter((entry) => entry !== proxy);
        if (next.length !== existing.length) {
          targetScope.setPath?.(key, next);
        }
      }
    });
  }
  matchesMinWidth(value) {
    const px = this.parseWidthArg(value);
    if (px === void 0) {
      return false;
    }
    return this.mediaMatches(`(min-width: ${px}px)`);
  }
  matchesMaxWidth(value) {
    const px = this.parseWidthArg(value);
    if (px === void 0) {
      return false;
    }
    return this.mediaMatches(`(max-width: ${px}px)`);
  }
  parseWidthArg(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const match = value.match(/-?\d+(\.\d+)?/);
      if (!match) {
        return void 0;
      }
      const parsed = Number(match[0]);
      return Number.isFinite(parsed) ? parsed : void 0;
    }
    return void 0;
  }
  mediaMatches(query) {
    const matcher = globalThis.matchMedia;
    if (typeof matcher !== "function") {
      return false;
    }
    return Boolean(matcher(query)?.matches);
  }
  getGroupTargetScope(element, behavior, scope, rootScope) {
    let targetScope = rootScope ?? scope;
    if (behavior.parentSelector) {
      const parentElement = element.closest(behavior.parentSelector);
      if (parentElement) {
        targetScope = this.getScope(parentElement);
      }
    }
    return targetScope;
  }
  getGroupProxy(scope) {
    const cached = this.groupProxyCache.get(scope);
    if (cached) {
      return cached;
    }
    const element = this.scopeElements.get(scope);
    const proxy = new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop === "symbol") {
            return void 0;
          }
          if (prop === "__element") {
            return element;
          }
          if (prop === "__scope") {
            return scope;
          }
          const key = String(prop);
          const value = scope.getPath(key);
          const rootKey = key.split(".")[0];
          const hasKey = rootKey ? scope.hasKey?.(rootKey) : false;
          if (value !== void 0 || hasKey) {
            return value;
          }
          if (element && key in element) {
            const elementValue = element[key];
            if (typeof elementValue === "function") {
              return elementValue.bind(element);
            }
            return elementValue;
          }
          return void 0;
        },
        set: (_target, prop, value) => {
          if (typeof prop === "symbol") {
            return false;
          }
          scope.setPath(String(prop), value);
          return true;
        },
        has: (_target, prop) => {
          if (typeof prop === "symbol") {
            return false;
          }
          return scope.getPath(String(prop)) !== void 0;
        },
        getOwnPropertyDescriptor: () => ({
          enumerable: true,
          configurable: true
        }),
        ownKeys: () => []
      }
    );
    this.groupProxyCache.set(scope, proxy);
    return proxy;
  }
  async mount(root) {
    if (this.engineLifetime.isDisposed) {
      this.engineLifetime = new Lifetime();
    }
    const documentRoot = root.ownerDocument;
    const active = _Engine.activeEngines.get(documentRoot);
    if (active && active !== this) {
      active.disposeMountedRoots();
    }
    _Engine.activeEngines.set(documentRoot, this);
    this.mountedDocuments.add(documentRoot);
    const elements = [root, ...Array.from(root.querySelectorAll("*"))];
    for (const element of elements) {
      this.inactiveSubtrees.delete(element);
    }
    for (const element of elements) {
      if (element === root && root === root.ownerDocument.body && !this.hasVsnAttributes(element)) {
        continue;
      }
      this.getScope(element, this.findParentScope(element));
    }
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
    const isMountedRoot = element instanceof HTMLElement && this.mountedRoots.delete(element);
    this.inactiveSubtrees.add(element);
    if (isMountedRoot) {
      this.reconnectObserver();
    }
    const elements = [element, ...Array.from(element.querySelectorAll("*"))];
    for (const current of elements) {
      this.teardownElement(current);
    }
  }
  registerBehaviors(source) {
    this.registerBehaviorSource(source);
  }
  registerBehaviorSource(source, dynamicOwner) {
    const program = new Parser(source, {
      customFlags: new Set(this.flagHandlers.keys()),
      behaviorFlags: new Set(this.behaviorModifiers.keys())
    }).parseProgram();
    for (const use of program.uses) {
      if (use.flags?.wait) {
        this.pendingUses.push(this.waitForUseGlobal(use));
        continue;
      }
      const value = this.resolveGlobalPath(use.name);
      if (value === void 0) {
        console.warn(`vsn: global '${use.name}' not found`);
        continue;
      }
      this.registerGlobal(use.alias, value);
    }
    if (dynamicOwner) {
      const lifetime = this.getInlineLifetime(dynamicOwner);
      if (this.dynamicOwnerCleanupLifetimes.get(dynamicOwner) !== lifetime) {
        lifetime.onCleanup(() => this.disposeDynamicBehaviors(dynamicOwner));
        this.dynamicOwnerCleanupLifetimes.set(dynamicOwner, lifetime);
      }
    }
    for (const behavior of program.behaviors) {
      this.collectBehavior(behavior, void 0, void 0, dynamicOwner);
    }
  }
  registerGlobal(name, value) {
    this.globals[name] = value;
  }
  registerGlobals(values) {
    Object.assign(this.globals, values);
  }
  registerFlag(name, handler = {}) {
    this.flagHandlers.set(name, handler);
  }
  registerBehaviorModifier(name, handler = {}) {
    const reserved = /* @__PURE__ */ new Set(["important", "debounce"]);
    if (reserved.has(name)) {
      throw new Error(`Behavior modifier '${name}' is reserved`);
    }
    this.behaviorModifiers.set(name, handler);
  }
  registerHtmlTransformer(transform, options = {}) {
    const entry = {
      transform,
      priority: options.priority ?? 0,
      order: this.htmlTransformerOrder += 1
    };
    this.htmlTransformers.push(entry);
    this.htmlTransformers.sort((a, b) => a.priority - b.priority || a.order - b.order);
    return () => {
      const index = this.htmlTransformers.indexOf(entry);
      if (index >= 0) {
        this.htmlTransformers.splice(index, 1);
      }
    };
  }
  getRegistryStats() {
    return {
      behaviorCount: this.behaviorRegistry.length,
      behaviorCacheSize: this.behaviorCache.size
    };
  }
  registerAttributeHandler(handler) {
    const existingIndex = this.attributeHandlers.findIndex((existing) => existing.id === handler.id);
    if (existingIndex >= 0) {
      this.attributeHandlers.splice(existingIndex, 1);
    }
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
  async waitForUses() {
    while (this.pendingUses.length > 0) {
      const pending = this.pendingUses;
      this.pendingUses = [];
      await Promise.all(pending);
    }
  }
  waitForUseGlobal(use) {
    const config = use.flagArgs?.wait ?? {};
    const timeoutMs = config.timeoutMs ?? 1e4;
    const configuredDelayMs = config.intervalMs ?? 100;
    const initialDelayMs = Number.isFinite(configuredDelayMs) && configuredDelayMs > 0 ? configuredDelayMs : 1;
    const maxDelayMs = 1e3;
    const existing = this.resolveGlobalPath(use.name);
    if (existing !== void 0) {
      this.registerGlobal(use.alias, existing);
      return Promise.resolve();
    }
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      this.emitUseError(use.name, new Error(`vsn: global '${use.name}' not found`));
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let elapsedMs = 0;
      let delayMs = initialDelayMs;
      let timer;
      let settled = false;
      const removeCleanup = this.engineLifetime.onCleanup(() => {
        if (timer) {
          clearTimeout(timer);
          timer = void 0;
        }
        settled = true;
        resolve();
      });
      const finish = () => {
        if (settled) {
          return;
        }
        settled = true;
        removeCleanup();
        resolve();
      };
      const check = () => {
        if (settled) {
          return;
        }
        const value = this.resolveGlobalPath(use.name);
        if (value !== void 0) {
          this.registerGlobal(use.alias, value);
          finish();
          return;
        }
        if (elapsedMs >= timeoutMs) {
          this.emitUseError(use.name, new Error(`vsn: global '${use.name}' not found`));
          finish();
          return;
        }
        const scheduledDelay = Math.min(delayMs, timeoutMs - elapsedMs);
        timer = setTimeout(() => {
          timer = void 0;
          elapsedMs += scheduledDelay;
          delayMs = Math.min(delayMs * 2, maxDelayMs);
          check();
        }, scheduledDelay);
      };
      check();
    });
  }
  getScope(element, parentScope) {
    const existing = this.scopes.get(element);
    if (existing) {
      if (parentScope) {
        existing.setParent(parentScope);
      }
      if (!this.scopeElements.has(existing)) {
        this.scopeElements.set(existing, element);
      }
      return existing;
    }
    const scope = new Scope(parentScope ?? this.findParentScope(element));
    this.scopes.set(element, scope);
    this.scopeElements.set(scope, element);
    return scope;
  }
  /**
   * Returns the lifetime owned by an element's inline bindings.
   * Extensions can use this for resources that should live until the element
   * is unmounted.
   */
  getLifetime(element) {
    return this.inlineLifetimes.get(element) ?? this.getInlineLifetime(element);
  }
  get signal() {
    return this.engineLifetime.signal;
  }
  batch(callback) {
    return batch(callback);
  }
  computed(scope, getter, options) {
    return computed(scope, getter, options);
  }
  effect(scope, callback, options) {
    return effect(scope, callback, options);
  }
  dispose() {
    const documents = Array.from(this.mountedDocuments);
    this.disposeMountedRoots();
    try {
      this.engineLifetime.dispose();
    } catch (error) {
      this.logger.warn?.("vsn:error", { error, selector: "engine" });
    }
    for (const documentRoot of documents) {
      if (_Engine.activeEngines.get(documentRoot) === this) {
        _Engine.activeEngines.delete(documentRoot);
      }
    }
    this.mountedDocuments.clear();
  }
  getInlineLifetime(element) {
    const existing = this.inlineLifetimes.get(element);
    if (existing && !existing.isDisposed) {
      return existing;
    }
    const lifetime = new Lifetime();
    this.inlineLifetimes.set(element, lifetime);
    return lifetime;
  }
  resetInlineLifetime(element) {
    const existing = this.inlineLifetimes.get(element);
    if (existing && !existing.isDisposed) {
      if (this.lifecycleBindings.has(element)) {
        this.runDestruct(element, existing);
      }
      this.disposeLifetime(element, existing);
    }
    const lifetime = new Lifetime();
    this.inlineLifetimes.set(element, lifetime);
    return lifetime;
  }
  getBehaviorLifetime(element, behaviorId) {
    const lifetimes = this.behaviorLifetimes.get(element) ?? /* @__PURE__ */ new Map();
    const existing = lifetimes.get(behaviorId);
    if (existing && !existing.isDisposed) {
      return existing;
    }
    const lifetime = new Lifetime();
    lifetimes.set(behaviorId, lifetime);
    this.behaviorLifetimes.set(element, lifetimes);
    return lifetime;
  }
  disposeLifetime(element, lifetime) {
    try {
      lifetime.dispose();
    } catch (error) {
      this.emitError(element, error);
    }
  }
  disposeBehaviorLifetimes(element) {
    const lifetimes = this.behaviorLifetimes.get(element);
    if (!lifetimes) {
      return;
    }
    for (const lifetime of lifetimes.values()) {
      this.disposeLifetime(element, lifetime);
    }
    this.behaviorLifetimes.delete(element);
  }
  addEventListener(lifetime, target, event, handler, options) {
    target.addEventListener(event, handler, options);
    lifetime.onCleanup(() => target.removeEventListener(event, handler, options));
  }
  cleanupBehaviorBindings(element) {
    const bound = this.behaviorBindings.get(element);
    if (bound) {
      for (const behaviorId of bound) {
        const boundElements = this.behaviorBoundElements.get(behaviorId);
        boundElements?.delete(element);
        if (boundElements?.size === 0) {
          this.behaviorBoundElements.delete(behaviorId);
        }
      }
    }
    this.behaviorBindings.delete(element);
    this.behaviorRootScopes.delete(element);
    bound?.clear();
  }
  setHtml(element, value, options = {}) {
    if (!(element instanceof HTMLElement)) {
      return;
    }
    const context = {
      element,
      trusted: options.trusted ?? false
    };
    let transformed = value;
    for (const entry of this.htmlTransformers) {
      transformed = entry.transform(transformed, context);
    }
    element.innerHTML = transformed == null ? "" : String(transformed);
    this.processHtml(element);
  }
  processHtml(root) {
    this.handleHtmlBehaviors(root);
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
      this.setHtml(element, scope.get(htmlBinding.expr.trim()), { trusted: htmlBinding.trusted });
    }
  }
  attachObserver(root) {
    if (!this.observer) {
      const lifetime = this.engineLifetime.child();
      this.observerLifetime = lifetime;
      this.observerFlush = debounce(() => this.flushObserverQueue(), 10);
      lifetime.onCleanup(() => this.observerFlush?.cancel());
      lifetime.onCleanup(() => this.observer?.disconnect());
      this.observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "attributes" && mutation.target instanceof Element) {
            if (!this.isInactive(mutation.target)) {
              this.pendingUpdated.add(mutation.target);
            }
          }
          for (const node of Array.from(mutation.addedNodes)) {
            if (node && node.nodeType === 1) {
              const element = node;
              if (this.ignoredAdded.has(element)) {
                this.ignoredAdded.delete(element);
                continue;
              }
              if (!this.isInactive(element)) {
                this.pendingAdded.add(element);
              }
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
    }
    this.mountedRoots.add(root);
    this.observeRoot(root);
  }
  observeRoot(root) {
    this.observer?.observe(root, { childList: true, subtree: true, attributes: true });
  }
  reconnectObserver() {
    if (!this.observer) {
      return;
    }
    this.observer.disconnect();
    if (this.mountedRoots.size === 0) {
      this.disconnectObserver();
      return;
    }
    for (const root of this.mountedRoots) {
      this.observeRoot(root);
    }
  }
  disposeMountedRoots() {
    const roots = Array.from(this.mountedRoots);
    this.disconnectObserver();
    this.mountedRoots.clear();
    for (const root of roots) {
      for (const element of [root, ...Array.from(root.querySelectorAll("*"))]) {
        this.teardownElement(element);
      }
    }
  }
  disconnectObserver() {
    const lifetime = this.observerLifetime;
    this.observerLifetime = void 0;
    if (lifetime) {
      try {
        lifetime.dispose();
      } catch (error) {
        this.logger.warn?.("vsn:error", { error, selector: "observer" });
      }
    } else {
      this.observer?.disconnect();
      this.observerFlush?.cancel();
    }
    this.observer = void 0;
    this.observerFlush = void 0;
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
    const elements = [node, ...Array.from(node.querySelectorAll("*"))];
    for (const element of elements) {
      this.teardownElement(element);
    }
  }
  teardownElement(element) {
    const inlineLifetime = this.inlineLifetimes.get(element);
    if (inlineLifetime && !inlineLifetime.isDisposed) {
      if (this.lifecycleBindings.has(element)) {
        this.runDestruct(element, inlineLifetime);
      }
      this.disposeLifetime(element, inlineLifetime);
    }
    if (this.behaviorBindings.has(element)) {
      this.runBehaviorDestruct(element);
      this.disposeBehaviorLifetimes(element);
      this.cleanupBehaviorBindings(element);
    }
    this.disposeDynamicBehaviors(element);
  }
  handleAddedNode(node, applyBehaviors = true) {
    if (this.isInactive(node)) {
      return;
    }
    const elements = [node, ...Array.from(node.querySelectorAll("*"))];
    for (const element of elements) {
      this.getScope(element, this.findParentScope(element));
    }
    for (const element of elements) {
      if (!this.hasVsnAttributes(element)) {
        continue;
      }
      const parentScope = this.findParentScope(element);
      this.getScope(element, parentScope);
      this.attachAttributes(element);
      this.runConstruct(element);
    }
    if (applyBehaviors) {
      void this.applyBehaviors(node);
    }
  }
  handleUpdatedNode(node) {
    if (this.isInactive(node)) {
      return;
    }
    const elements = [node, ...Array.from(node.querySelectorAll("*"))];
    for (const element of elements) {
      void this.reapplyBehaviorsForElement(element);
    }
  }
  async applyBehaviors(root) {
    if (this.isInactive(root)) {
      return;
    }
    await this.waitForUses();
    if (this.isInactive(root)) {
      return;
    }
    if (this.behaviorRegistry.length > 0) {
      const elements = [root, ...Array.from(root.querySelectorAll("*"))];
      for (const element of elements) {
        await this.reapplyBehaviorsForElement(element);
      }
    }
    this.flushAutoBindQueue();
  }
  isInactive(element) {
    let current = element;
    while (current) {
      if (this.inactiveSubtrees.has(current)) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
  async reapplyBehaviorsForElement(element) {
    if (this.behaviorRegistry.length === 0 || this.isInactive(element)) {
      return;
    }
    const bound = this.behaviorBindings.get(element) ?? /* @__PURE__ */ new Set();
    this.behaviorBindings.set(element, bound);
    const scope = this.getScope(element, this.findParentScope(element));
    const matched = this.behaviorRegistry.filter((behavior) => element.matches(behavior.selector)).map((behavior) => ({
      behavior,
      specificity: this.computeSpecificityForElement(behavior.selector, element)
    })).sort((a, b) => {
      if (a.specificity !== b.specificity) {
        return a.specificity - b.specificity;
      }
      return a.behavior.order - b.behavior.order;
    });
    for (const { behavior } of matched) {
      if (!bound.has(behavior.id)) {
        await this.applyBehaviorForElement(behavior, element, scope, bound);
        if (this.isInactive(element)) {
          return;
        }
      }
    }
    const matchedIds = new Set(matched.map(({ behavior }) => behavior.id));
    for (const behavior of this.behaviorRegistry) {
      if (bound.has(behavior.id) && !matchedIds.has(behavior.id)) {
        this.unbindBehaviorForElement(behavior, element, scope, bound);
      }
    }
    if (!this.isInactive(element)) {
      this.behaviorBindings.set(element, bound);
    }
  }
  async applyBehaviorForElement(behavior, element, scope, bound) {
    bound.add(behavior.id);
    const boundElements = this.behaviorBoundElements.get(behavior.id) ?? /* @__PURE__ */ new Set();
    boundElements.add(element);
    this.behaviorBoundElements.set(behavior.id, boundElements);
    const rootScope = this.getBehaviorRootScope(element, behavior);
    const rootScopes = this.behaviorRootScopes.get(element) ?? /* @__PURE__ */ new Map();
    rootScopes.set(behavior.id, rootScope);
    this.behaviorRootScopes.set(element, rootScopes);
    const lifetime = this.getBehaviorLifetime(element, behavior.id);
    try {
      this.applyBehaviorFunctions(element, scope, behavior.functions, rootScope, lifetime);
      await this.applyBehaviorDeclarations(element, scope, behavior.declarations, rootScope, behavior.id, lifetime);
      if (lifetime.isDisposed) {
        return;
      }
      await this.applyBehaviorModifierHook("onBind", behavior, element, scope, rootScope, lifetime);
      if (lifetime.isDisposed) {
        return;
      }
      if (behavior.construct) {
        await this.safeExecuteBlock(behavior.construct, scope, element, rootScope, lifetime);
      }
      if (lifetime.isDisposed) {
        return;
      }
      await this.applyBehaviorModifierHook("onConstruct", behavior, element, scope, rootScope, lifetime);
      if (lifetime.isDisposed) {
        return;
      }
      for (const onBlock of behavior.onBlocks) {
        this.attachBehaviorOnHandler(
          element,
          onBlock.event,
          onBlock.body,
          onBlock.flags,
          onBlock.flagArgs,
          onBlock.args,
          rootScope,
          lifetime
        );
      }
      this.logDiagnostic("bind", element, behavior);
    } catch (error) {
      const cancelled = lifetime.signal.aborted || isAbortError(error);
      this.disposeLifetime(element, lifetime);
      this.behaviorLifetimes.get(element)?.delete(behavior.id);
      if (this.behaviorLifetimes.get(element)?.size === 0) {
        this.behaviorLifetimes.delete(element);
      }
      bound.delete(behavior.id);
      boundElements.delete(element);
      if (boundElements.size === 0) {
        this.behaviorBoundElements.delete(behavior.id);
      }
      this.behaviorRootScopes.get(element)?.delete(behavior.id);
      if (!cancelled) {
        throw error;
      }
    }
  }
  unbindBehaviorForElement(behavior, element, scope, bound) {
    bound.delete(behavior.id);
    const boundElements = this.behaviorBoundElements.get(behavior.id);
    boundElements?.delete(element);
    if (boundElements?.size === 0) {
      this.behaviorBoundElements.delete(behavior.id);
    }
    const lifetime = this.behaviorLifetimes.get(element)?.get(behavior.id) ?? new Lifetime();
    this.disposeLifetime(element, lifetime);
    this.behaviorLifetimes.get(element)?.delete(behavior.id);
    if (this.behaviorLifetimes.get(element)?.size === 0) {
      this.behaviorLifetimes.delete(element);
    }
    const rootScope = this.getBehaviorRootScope(element, behavior);
    if (behavior.destruct) {
      void this.safeExecuteBlock(behavior.destruct, scope, element, rootScope, lifetime, null);
    }
    this.behaviorRootScopes.get(element)?.delete(behavior.id);
    void this.applyBehaviorModifierHook("onDestruct", behavior, element, scope, rootScope, lifetime);
    void this.applyBehaviorModifierHook("onUnbind", behavior, element, scope, rootScope, lifetime);
    this.logDiagnostic("unbind", element, behavior);
  }
  runBehaviorDestruct(element) {
    const bound = this.behaviorBindings.get(element);
    if (!bound) {
      return;
    }
    const scope = this.getScope(element);
    for (const behavior of this.behaviorRegistry) {
      if (!bound.has(behavior.id) || !behavior.destruct && !this.behaviorHasModifierHooks(behavior)) {
        continue;
      }
      const rootScope = this.getBehaviorRootScope(element, behavior);
      const lifetime = this.behaviorLifetimes.get(element)?.get(behavior.id) ?? new Lifetime();
      if (behavior.destruct) {
        void this.safeExecuteBlock(behavior.destruct, scope, element, rootScope, lifetime, null);
      }
      void this.applyBehaviorModifierHook("onDestruct", behavior, element, scope, rootScope, lifetime);
      void this.applyBehaviorModifierHook("onUnbind", behavior, element, scope, rootScope, lifetime);
    }
  }
  attachAttributes(element) {
    const scope = this.getScope(element);
    const lifetime = this.resetInlineLifetime(element);
    const context = {
      lifetime,
      signal: lifetime.signal,
      onCleanup: (disposer) => lifetime.onCleanup(disposer)
    };
    for (const name of element.getAttributeNames()) {
      if (!name.startsWith("vsn-")) {
        continue;
      }
      const value = element.getAttribute(name) ?? "";
      for (const handler of this.attributeHandlers) {
        if (!handler.match(name)) {
          continue;
        }
        const handled = handler.handle(element, name, value, scope, context);
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
    void this.safeExecute(config.construct, scope, element, void 0, this.getInlineLifetime(element));
  }
  runDestruct(element, lifetime = this.getInlineLifetime(element)) {
    const config = this.lifecycleBindings.get(element);
    if (!config?.destruct) {
      return;
    }
    const scope = this.getScope(element);
    void this.safeExecute(config.destruct, scope, element, void 0, lifetime);
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
      itemScope.isEachItem = true;
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
  attachBindInputHandler(element, expr, lifetime = this.getInlineLifetime(element)) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
      return;
    }
    const handler = () => {
      const scope = this.getScope(element);
      applyBindToScope(element, expr, scope);
    };
    this.addEventListener(lifetime, element, "input", handler);
    this.addEventListener(lifetime, element, "change", handler);
  }
  parseBindDirection(name) {
    if (name.includes(":from")) {
      return "from";
    }
    if (name.includes(":to")) {
      return "to";
    }
    return "auto";
  }
  resolveBindConfig(element, expr, scope, direction) {
    if (direction !== "auto") {
      return {
        direction,
        seedFromScope: false,
        syncToScope: direction === "to" || direction === "both",
        deferToScope: false
      };
    }
    if (this.isInEachScope(scope)) {
      return { direction: "both", seedFromScope: false, syncToScope: false, deferToScope: false };
    }
    if (this.isFormControl(element)) {
      if (this.hasScopeValue(scope, expr)) {
        return { direction: "both", seedFromScope: true, syncToScope: false, deferToScope: false };
      }
      return { direction: "both", seedFromScope: false, syncToScope: false, deferToScope: true };
    }
    if (this.hasScopeValue(scope, expr)) {
      return { direction: "both", seedFromScope: false, syncToScope: false, deferToScope: false };
    }
    if (this.hasElementValue(element)) {
      return { direction: "both", seedFromScope: false, syncToScope: false, deferToScope: true };
    }
    return { direction: "both", seedFromScope: false, syncToScope: false, deferToScope: false };
  }
  isFormControl(element) {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
  }
  hasScopeValue(scope, expr) {
    const key = expr.trim();
    if (!key) {
      return false;
    }
    const value = scope.get(key);
    return value !== void 0 && value !== null;
  }
  hasElementValue(element) {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
      return element.value.length > 0;
    }
    return (element.textContent ?? "").trim().length > 0;
  }
  coerceInt(value) {
    if (value == null || value === "") {
      return value;
    }
    const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
    return Number.isNaN(num) ? value : num;
  }
  coerceFloat(value) {
    if (value == null || value === "") {
      return value;
    }
    const num = typeof value === "number" ? value : Number.parseFloat(String(value));
    return Number.isNaN(num) ? value : num;
  }
  isInEachScope(scope) {
    let cursor = scope;
    while (cursor) {
      if (cursor.isEachItem) {
        return true;
      }
      cursor = cursor.parent;
    }
    return false;
  }
  flushAutoBindQueue() {
    if (this.pendingAutoBindToScope.length === 0) {
      return;
    }
    const pending = this.pendingAutoBindToScope;
    this.pendingAutoBindToScope = [];
    for (const entry of pending) {
      if (!entry.element.isConnected) {
        continue;
      }
      if (this.hasScopeValue(entry.scope, entry.expr)) {
        continue;
      }
      if (!this.hasElementValue(entry.element)) {
        continue;
      }
      applyBindToScope(entry.element, entry.expr, entry.scope);
    }
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
  watch(scope, expr, handler, element, behaviorId, lifetime) {
    const key = expr.trim();
    if (!key) {
      return;
    }
    const root = key.split(".")[0];
    if (!root) {
      return;
    }
    const owner = lifetime ?? (element ? this.getInlineLifetime(element) : void 0);
    let target = scope;
    while (target && !target.hasKey(root)) {
      target = target.parent;
    }
    if (target) {
      target.on(key, handler);
      this.trackScopeWatcher(target, "path", handler, key, owner);
      return;
    }
    let cursor = scope;
    while (cursor) {
      cursor.on(key, handler);
      this.trackScopeWatcher(cursor, "path", handler, key, owner);
      cursor = cursor.parent;
    }
  }
  watchWithDebounce(scope, expr, handler, debounceMs, element, behaviorId, lifetime) {
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    const owner = lifetime ?? (element ? this.getInlineLifetime(element) : void 0);
    if (debounceMs && owner) {
      owner.onCleanup(effectiveHandler.cancel);
    }
    this.watch(scope, expr, effectiveHandler, element, behaviorId, owner);
  }
  watchExpression(scope, rootScope, expression, handler, debounceMs, element, behaviorId, lifetime) {
    const dependencies = this.getExpressionDependencies(expression);
    if (dependencies.length === 0) {
      return;
    }
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    const owner = lifetime ?? (element ? this.getInlineLifetime(element) : void 0);
    if (debounceMs && owner) {
      owner.onCleanup(effectiveHandler.cancel);
    }
    for (const dependency of dependencies) {
      this.watchExpressionDependency(
        scope,
        rootScope,
        dependency,
        effectiveHandler,
        element,
        behaviorId,
        owner
      );
    }
  }
  getExpressionDependencies(expression) {
    const dependencies = /* @__PURE__ */ new Set();
    const visit = (node) => {
      if (!node || typeof node !== "object") {
        return;
      }
      if (node instanceof IdentifierExpression) {
        if (node.name !== "self" && node.name !== "signal") {
          dependencies.add(node.name);
        }
        return;
      }
      if (node.type === "MemberExpression") {
        const path = node.getIdentifierPath?.()?.path;
        if (path) {
          dependencies.add(path);
          return;
        }
        visit(node.target);
        return;
      }
      switch (node.type) {
        case "Assignment":
          visit(node.target);
          visit(node.value);
          return;
        case "ArrayExpression":
          for (const element of node.elements ?? []) {
            visit(element);
          }
          return;
        case "ObjectExpression":
          for (const entry of node.entries ?? []) {
            if (entry?.spread) {
              visit(entry.spread);
              continue;
            }
            if (entry?.computed) {
              visit(entry.keyExpr);
            }
            visit(entry?.value);
          }
          return;
        case "ElementDirective":
        case "ElementProperty":
          visit(node.element);
          return;
        case "TemplateExpression":
          for (const part of node.parts ?? []) {
            visit(part);
          }
          return;
        case "TaggedTemplateExpression":
          visit(node.tag);
          visit(node.template);
          return;
        case "UnaryExpression":
        case "AwaitExpression":
          visit(node.argument);
          return;
        case "BinaryExpression":
          visit(node.left);
          visit(node.right);
          return;
        case "TernaryExpression":
          visit(node.test);
          visit(node.consequent);
          visit(node.alternate);
          return;
        case "CallExpression":
          visit(node.callee);
          for (const arg of node.args ?? []) {
            visit(arg);
          }
          return;
        case "IndexExpression":
          visit(node.target);
          visit(node.index);
          return;
        default:
          return;
      }
    };
    visit(expression);
    return Array.from(dependencies);
  }
  watchExpressionDependency(scope, rootScope, dependency, handler, element, behaviorId, lifetime) {
    const path = dependency.trim();
    if (!path) {
      return;
    }
    if (path.startsWith("root.")) {
      const target = rootScope ?? this.getRootScope(scope);
      this.watchDirectScope(target, path.slice("root.".length), handler, element, behaviorId, lifetime);
      return;
    }
    if (path.startsWith("parent.")) {
      let target = scope;
      let targetPath = path;
      while (targetPath.startsWith("parent.")) {
        target = target?.parent;
        targetPath = targetPath.slice("parent.".length);
      }
      if (target) {
        this.watchDirectScope(target, targetPath, handler, element, behaviorId, lifetime);
      }
      return;
    }
    if (path.startsWith("self.")) {
      this.watchDirectScope(scope, path.slice("self.".length), handler, element, behaviorId, lifetime);
      return;
    }
    const root = path.split(".")[0];
    if (!root || !this.hasScopeKey(scope, root) && root in this.globals) {
      return;
    }
    this.watch(scope, path, handler, element, behaviorId, lifetime);
  }
  watchDirectScope(scope, path, handler, element, behaviorId, lifetime) {
    if (!scope || !path) {
      return;
    }
    scope.on(path, handler);
    const owner = lifetime ?? (element ? this.getInlineLifetime(element) : void 0);
    this.trackScopeWatcher(scope, "path", handler, path, owner);
  }
  hasScopeKey(scope, key) {
    let cursor = scope;
    while (cursor) {
      if (cursor.hasKey(key)) {
        return true;
      }
      cursor = cursor.parent;
    }
    return false;
  }
  getRootScope(scope) {
    let root = scope;
    while (root.parent) {
      root = root.parent;
    }
    return root;
  }
  trackScopeWatcher(scope, kind, handler, key, lifetime) {
    if (!lifetime) {
      return;
    }
    lifetime.onCleanup(() => {
      if (kind === "any") {
        scope.offAny(handler);
      } else if (key) {
        scope.off(key, handler);
      }
    });
  }
  trackBehaviorClassMapBinding(element, binding, lifetime) {
    lifetime.onCleanup(() => this.clearClassMapBinding(element, binding));
  }
  trackBehaviorInvalidator(invalidator, lifetime) {
    lifetime.onCleanup(invalidator);
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
    if (event.includes(".")) {
      throw new Error("vsn:on does not support dot modifiers; use !flags instead");
    }
    const { flagMap, flagArgs } = this.parseInlineFlags(flags);
    const config = {
      event,
      code: value,
      flags: flagMap,
      flagArgs
    };
    return config;
  }
  parseInlineFlags(parts) {
    const flagMap = {};
    const flagArgs = {};
    for (const raw of parts) {
      const trimmed = raw.trim();
      if (!trimmed) {
        continue;
      }
      const match = trimmed.match(/^([a-zA-Z][\w-]*)(?:\((.+)\))?$/);
      if (!match) {
        continue;
      }
      const name = match[1] ?? "";
      if (!name) {
        continue;
      }
      if (!this.flagHandlers.has(name)) {
        throw new Error(`Unknown flag ${name}`);
      }
      flagMap[name] = true;
      if (match[2] !== void 0) {
        flagArgs[name] = this.parseInlineFlagArg(match[2]);
      }
    }
    return { flagMap, flagArgs };
  }
  parseInlineFlagArg(raw) {
    const trimmed = raw.trim();
    if (trimmed === "true") {
      return true;
    }
    if (trimmed === "false") {
      return false;
    }
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }
    return trimmed;
  }
  describeElement(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const classes = element.classList.length > 0 ? `.${Array.from(element.classList).join(".")}` : "";
    return `${tag}${id}${classes}`;
  }
  logDiagnostic(type, element, behavior) {
    if (!this.diagnostics || !this.logger.info) {
      return;
    }
    this.logger.info(`vsn:${type}`, {
      element: this.describeElement(element),
      selector: behavior.selector,
      behaviorId: behavior.id
    });
  }
  emitError(element, error) {
    const selector = this.describeElement(element);
    this.logger.warn?.("vsn:error", { error, selector });
    element.dispatchEvent(
      new CustomEvent("vsn:error", {
        detail: { error, selector },
        bubbles: true
      })
    );
  }
  emitUseError(name, error) {
    const selector = `use:${name}`;
    this.logger.warn?.("vsn:error", { error, selector });
    const target = globalThis.document;
    if (target && typeof target.dispatchEvent === "function") {
      target.dispatchEvent(
        new CustomEvent("vsn:error", {
          detail: { error, selector },
          bubbles: true
        })
      );
    }
  }
  attachOnHandler(element, config, lifetime = this.getInlineLifetime(element)) {
    const { listenerTarget, options, debounceMs } = this.getEventBindingConfig(
      element,
      config.flags,
      config.flagArgs,
      lifetime
    );
    let effectiveHandler;
    const handler = async (event) => {
      if (!element.isConnected || lifetime.isDisposed) {
        listenerTarget.removeEventListener(config.event, effectiveHandler, options);
        return;
      }
      const scope = this.getScope(element);
      if (!this.applyEventFlagBefore(element, scope, config.flags, config.flagArgs, event, lifetime)) {
        return;
      }
      try {
        await this.execute(config.code, scope, element, void 0, lifetime);
        if (!lifetime.isDisposed) {
          this.evaluate(element);
        }
      } catch (error) {
        if (!lifetime.signal.aborted && !isAbortError(error)) {
          this.emitError(element, error);
        }
      } finally {
        this.applyEventFlagAfter(element, scope, config.flags, config.flagArgs, event, lifetime);
      }
    };
    effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    if (debounceMs && effectiveHandler.cancel) {
      lifetime.onCleanup(effectiveHandler.cancel);
    }
    this.addEventListener(lifetime, listenerTarget, config.event, effectiveHandler, options);
  }
  attachBehaviorOnHandler(element, event, body, flags, flagArgs, args, rootScope, lifetime) {
    if (event.includes(".")) {
      throw new Error("vsn:on does not support dot modifiers; use !flags instead");
    }
    const { listenerTarget, options, debounceMs } = this.getEventBindingConfig(
      element,
      flags,
      flagArgs,
      lifetime,
      rootScope
    );
    const handler = async (evt) => {
      if (lifetime.isDisposed) {
        return;
      }
      const scope = this.getScope(element);
      if (!this.applyEventFlagBefore(element, scope, flags, flagArgs, evt, lifetime, rootScope)) {
        return;
      }
      const previousValues = /* @__PURE__ */ new Map();
      if (args && args.length > 0) {
        const argName = args[0];
        if (argName) {
          previousValues.set(argName, scope.getPath(argName));
          const [nextArg] = this.applyEventFlagArgTransforms(
            element,
            scope,
            flags,
            flagArgs,
            evt,
            lifetime,
            rootScope
          );
          scope.setPath(argName, nextArg);
        }
      }
      let failed = false;
      try {
        await this.executeBlock(body, scope, element, rootScope, lifetime);
      } catch (error) {
        failed = true;
        if (!lifetime.signal.aborted && !isAbortError(error)) {
          this.emitError(element, error);
        }
      } finally {
        for (const [name, value] of previousValues.entries()) {
          scope.setPath(name, value);
        }
        this.applyEventFlagAfter(element, scope, flags, flagArgs, evt, lifetime, rootScope);
      }
      if (!failed && !lifetime.isDisposed) {
        this.evaluate(element);
      }
    };
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    if (debounceMs) {
      lifetime.onCleanup(effectiveHandler.cancel);
    }
    this.addEventListener(lifetime, listenerTarget, event, effectiveHandler, options);
  }
  attachGetHandler(element, autoLoad = false, lifetime = this.getInlineLifetime(element)) {
    let requestLifetime;
    const handler = async () => {
      if (lifetime.isDisposed || !element.isConnected) {
        return;
      }
      requestLifetime?.dispose();
      const operationLifetime = lifetime.child();
      requestLifetime = operationLifetime;
      const config = this.getBindings.get(element);
      if (!config) {
        operationLifetime.dispose();
        return;
      }
      try {
        await applyGet(
          element,
          { ...config, signal: operationLifetime.signal },
          this.getScope(element),
          (target) => {
            if (!operationLifetime.signal.aborted) {
              this.handleHtmlBehaviors(target);
            }
          }
        );
        if (operationLifetime.signal.aborted || lifetime.isDisposed) {
          return;
        }
      } catch (error) {
        if (operationLifetime.signal.aborted || lifetime.signal.aborted || isAbortError(error)) {
          return;
        }
        console.warn("vsn:getError", error);
        element.dispatchEvent(new CustomEvent("vsn:getError", { detail: { error }, bubbles: true }));
      } finally {
        if (requestLifetime === operationLifetime) {
          requestLifetime = void 0;
        }
        operationLifetime.dispose();
      }
    };
    const clickHandler = (event) => {
      if (event.target !== element) {
        return;
      }
      void handler();
    };
    this.addEventListener(lifetime, element, "click", clickHandler);
    if (autoLoad) {
      Promise.resolve().then(handler);
    }
  }
  getEventBindingConfig(element, flags, flagArgs, lifetime, rootScope) {
    let listenerTarget = element;
    let options = {};
    let debounceMs;
    for (const name of Object.keys(flags)) {
      const handler = this.flagHandlers.get(name);
      if (!handler?.onEventBind) {
        continue;
      }
      const patch = handler.onEventBind({
        name,
        args: flagArgs[name],
        element,
        scope: this.getScope(element),
        rootScope,
        event: void 0,
        engine: this,
        lifetime,
        signal: lifetime.signal,
        onCleanup: (disposer) => lifetime.onCleanup(disposer)
      });
      if (!patch) {
        continue;
      }
      if (patch.listenerTarget) {
        listenerTarget = patch.listenerTarget;
      }
      if (patch.options) {
        options = { ...options, ...patch.options };
      }
      if (patch.debounceMs !== void 0) {
        debounceMs = patch.debounceMs;
      }
    }
    return {
      listenerTarget,
      ...Object.keys(options).length > 0 ? { options } : {},
      ...debounceMs !== void 0 ? { debounceMs } : {}
    };
  }
  applyEventFlagBefore(element, scope, flags, flagArgs, event, lifetime, rootScope) {
    for (const name of Object.keys(flags)) {
      const handler = this.flagHandlers.get(name);
      if (!handler?.onEventBefore) {
        continue;
      }
      const result = handler.onEventBefore({
        name,
        args: flagArgs[name],
        element,
        scope,
        rootScope,
        event,
        engine: this,
        lifetime,
        signal: lifetime.signal,
        onCleanup: (disposer) => lifetime.onCleanup(disposer)
      });
      if (result === false) {
        return false;
      }
    }
    return true;
  }
  applyEventFlagAfter(element, scope, flags, flagArgs, event, lifetime, rootScope) {
    if (lifetime.isDisposed) {
      return;
    }
    for (const name of Object.keys(flags)) {
      const handler = this.flagHandlers.get(name);
      if (!handler?.onEventAfter) {
        continue;
      }
      handler.onEventAfter({
        name,
        args: flagArgs[name],
        element,
        scope,
        rootScope,
        event,
        engine: this,
        lifetime,
        signal: lifetime.signal,
        onCleanup: (disposer) => lifetime.onCleanup(disposer)
      });
    }
  }
  applyEventFlagArgTransforms(element, scope, flags, flagArgs, event, lifetime, rootScope) {
    let args = [event];
    for (const name of Object.keys(flags)) {
      const handler = this.flagHandlers.get(name);
      if (!handler?.transformEventArgs) {
        continue;
      }
      const nextArgs = handler.transformEventArgs(
        {
          name,
          args: flagArgs[name],
          element,
          scope,
          rootScope,
          event,
          engine: this,
          lifetime,
          signal: lifetime.signal,
          onCleanup: (disposer) => lifetime.onCleanup(disposer)
        },
        args
      );
      if (Array.isArray(nextArgs)) {
        args = nextArgs;
      }
    }
    return args;
  }
  matchesKeyFlag(event, flag) {
    if (!(event instanceof KeyboardEvent)) {
      return false;
    }
    const modifierChecks = {
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      meta: event.metaKey
    };
    if (flag in modifierChecks) {
      return modifierChecks[flag] ?? false;
    }
    const keyAliases = {
      escape: "escape",
      esc: "escape",
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
    const expectedKey = keyAliases[flag] ?? flag;
    return key === expectedKey;
  }
  withExecutionFrame(element, lifetime, fn, scope) {
    if (!element && !lifetime && !scope) {
      return fn();
    }
    this.executionStack.push({
      ...element ? { element } : {},
      ...lifetime ? { lifetime } : {},
      ...scope ? { scope } : {}
    });
    const pop = () => {
      this.executionStack.pop();
    };
    let result;
    try {
      result = fn();
    } catch (error) {
      pop();
      throw error;
    }
    if (isPromiseLike2(result)) {
      return Promise.resolve(result).finally(pop);
    }
    pop();
    return result;
  }
  withExecutionContext(element, lifetime, fn, scope) {
    return this.withExecutionFrame(element, lifetime, fn, scope);
  }
  async withExecutionElement(element, lifetime, fn, scope) {
    await this.withExecutionFrame(element, lifetime, fn, scope);
  }
  getCurrentElement() {
    return this.executionStack[this.executionStack.length - 1]?.element;
  }
  getCurrentLifetime() {
    return this.executionStack[this.executionStack.length - 1]?.lifetime;
  }
  getCurrentScope() {
    return this.executionStack[this.executionStack.length - 1]?.scope;
  }
  async execute(code, scope, element, rootScope, lifetime) {
    throwIfAborted(lifetime?.signal);
    let block = this.codeCache.get(code);
    if (!block) {
      block = Parser.parseInline(code);
      this.codeCache.set(code, block);
    }
    await batch(() => this.withExecutionElement(element, lifetime, async () => {
      const selfRef = this.getGroupProxy(scope);
      const context = {
        scope,
        rootScope,
        globals: this.globals,
        engine: this,
        ...element ? { element } : {},
        self: selfRef,
        ...lifetime ? { lifetime, signal: lifetime.signal } : {}
      };
      await block.evaluate(context);
    }, scope));
  }
  async executeBlock(block, scope, element, rootScope, lifetime, signal = lifetime?.signal) {
    throwIfAborted(signal);
    await batch(() => this.withExecutionElement(element, lifetime, async () => {
      const selfRef = this.getGroupProxy(scope);
      const context = {
        scope,
        rootScope,
        globals: this.globals,
        engine: this,
        ...element ? { element } : {},
        self: selfRef,
        ...lifetime ? { lifetime, ...signal ? { signal } : {} } : {}
      };
      await block.evaluate(context);
    }, scope));
  }
  async safeExecute(code, scope, element, rootScope, lifetime) {
    try {
      await this.execute(code, scope, element, rootScope, lifetime);
    } catch (error) {
      if (element && !lifetime?.signal.aborted && !isAbortError(error)) {
        this.emitError(element, error);
      }
    }
  }
  async safeExecuteBlock(block, scope, element, rootScope, lifetime, signal = lifetime?.signal) {
    try {
      await this.executeBlock(block, scope, element, rootScope, lifetime, signal);
    } catch (error) {
      if (element && !signal?.aborted && !isAbortError(error)) {
        this.emitError(element, error);
      }
    }
  }
  collectBehavior(behavior, parentSelector, rootSelectorOverride, dynamicOwner) {
    const nestedSelector = behavior.selector.selectorText;
    if (!parentSelector && hasNestingSelector(nestedSelector)) {
      throw new Error("Nesting selector '&' requires a parent behavior");
    }
    const selector = parentSelector ? composeNestedSelector(parentSelector, nestedSelector) : nestedSelector;
    const rootSelector = rootSelectorOverride ?? (parentSelector ?? behavior.selector.selectorText);
    const behaviorHash = this.hashBehavior(behavior);
    const hash = `${selector}::${rootSelector}::${behaviorHash}`;
    if (this.behaviorRegistryHashes.has(hash)) {
      const existing = this.behaviorRegistry.find((entry2) => entry2.hash === hash);
      if (existing && dynamicOwner) {
        existing.dynamicOwners.add(dynamicOwner);
        this.trackDynamicBehavior(dynamicOwner, existing.id);
      } else if (existing) {
        existing.persistent = true;
      }
      return;
    }
    const cached = this.getCachedBehavior(behavior);
    const entry = {
      id: this.behaviorId += 1,
      hash,
      selector,
      rootSelector,
      specificity: this.computeSpecificity(selector),
      order: this.behaviorRegistry.length,
      flags: behavior.flags ?? {},
      flagArgs: behavior.flagArgs ?? {},
      ...cached,
      ...parentSelector ? { parentSelector } : {},
      persistent: dynamicOwner === void 0,
      dynamicOwners: dynamicOwner ? /* @__PURE__ */ new Set([dynamicOwner]) : /* @__PURE__ */ new Set()
    };
    this.behaviorRegistry.push(entry);
    this.behaviorRegistryHashes.add(hash);
    this.behaviorEntriesById.set(entry.id, entry);
    if (dynamicOwner) {
      this.trackDynamicBehavior(dynamicOwner, entry.id);
    }
    this.collectNestedBehaviors(behavior.body, selector, rootSelector, dynamicOwner);
  }
  collectNestedBehaviors(block, parentSelector, rootSelector, dynamicOwner) {
    for (const statement of block.statements) {
      if (statement instanceof BehaviorNode) {
        this.collectBehavior(statement, parentSelector, rootSelector, dynamicOwner);
        continue;
      }
      if (statement instanceof OnBlockNode) {
        this.collectNestedBehaviors(statement.body, parentSelector, rootSelector, dynamicOwner);
        continue;
      }
      if (statement instanceof BlockNode) {
        this.collectNestedBehaviors(statement, parentSelector, rootSelector, dynamicOwner);
      }
    }
  }
  trackDynamicBehavior(owner, behaviorId) {
    const ids = this.dynamicBehaviorIds.get(owner) ?? /* @__PURE__ */ new Set();
    ids.add(behaviorId);
    this.dynamicBehaviorIds.set(owner, ids);
  }
  disposeDynamicBehaviors(owner) {
    const ids = this.dynamicBehaviorIds.get(owner);
    if (!ids) {
      return;
    }
    for (const behaviorId of ids) {
      const behavior = this.behaviorEntriesById.get(behaviorId);
      if (!behavior) {
        continue;
      }
      behavior.dynamicOwners.delete(owner);
      if (behavior.persistent || behavior.dynamicOwners.size > 0) {
        continue;
      }
      for (const element of Array.from(this.behaviorBoundElements.get(behaviorId) ?? [])) {
        const bound = this.behaviorBindings.get(element);
        if (bound?.has(behaviorId)) {
          this.unbindBehaviorForElement(behavior, element, this.getScope(element), bound);
        }
      }
      this.behaviorRegistry = this.behaviorRegistry.filter((entry) => entry.id !== behaviorId);
      this.behaviorRegistryHashes.delete(behavior.hash);
      this.behaviorEntriesById.delete(behaviorId);
      this.behaviorBoundElements.delete(behaviorId);
    }
    this.dynamicBehaviorIds.delete(owner);
  }
  computeSpecificity(selector) {
    return specificityScore(maxSelectorSpecificity(splitSelectorList(selector)));
  }
  computeSpecificityForElement(selector, element) {
    const groups = splitSelectorList(selector);
    const matchingGroups = groups.filter((group) => element.matches(group));
    return specificityScore(maxSelectorSpecificity(matchingGroups.length > 0 ? matchingGroups : groups));
  }
  getBehaviorRootScope(element, behavior) {
    const stored = this.behaviorRootScopes.get(element)?.get(behavior.id);
    if (stored) {
      return stored;
    }
    const rootElement = element.closest(behavior.rootSelector) ?? element;
    return this.getScope(rootElement);
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
        blocks.push({
          event: statement.eventName,
          body: statement.body,
          flags: statement.flags,
          flagArgs: statement.flagArgs,
          args: statement.args
        });
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
        functions.push({
          name: statement.name,
          params: statement.params,
          body: statement.body,
          isAsync: statement.isAsync
        });
        continue;
      }
      if (statement instanceof AssignmentNode) {
        if (statement.target instanceof IdentifierExpression && statement.value instanceof FunctionExpression) {
          functions.push({
            name: statement.target.name,
            params: statement.value.params,
            body: statement.value.body,
            isAsync: statement.value.isAsync
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
        flags: node.flags ?? {},
        flagArgs: node.flagArgs ?? {},
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
        flags: node.flags ?? {},
        flagArgs: node.flagArgs ?? {},
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
        value: this.normalizeNode(node.value),
        operator: node.operator ?? "",
        prefix: Boolean(node.prefix)
      };
    }
    if (type === "FunctionDeclaration") {
      return {
        type,
        name: node.name ?? "",
        params: Array.isArray(node.params) ? node.params.map((param) => ({
          name: param?.name ?? "",
          rest: Boolean(param?.rest),
          defaultValue: this.normalizeNode(param?.defaultValue ?? null)
        })) : [],
        body: this.normalizeNode(node.body),
        isAsync: Boolean(node.isAsync)
      };
    }
    if (type === "FunctionExpression") {
      return {
        type,
        params: Array.isArray(node.params) ? node.params.map((param) => ({
          name: param?.name ?? "",
          rest: Boolean(param?.rest),
          defaultValue: this.normalizeNode(param?.defaultValue ?? null)
        })) : [],
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
    if (type === "Assert") {
      return {
        type,
        test: this.normalizeNode(node.test)
      };
    }
    if (type === "Break" || type === "Continue") {
      return { type };
    }
    if (type === "If") {
      return {
        type,
        test: this.normalizeNode(node.test),
        consequent: this.normalizeNode(node.consequent),
        alternate: this.normalizeNode(node.alternate ?? null)
      };
    }
    if (type === "While") {
      return {
        type,
        test: this.normalizeNode(node.test),
        body: this.normalizeNode(node.body)
      };
    }
    if (type === "For") {
      return {
        type,
        init: this.normalizeNode(node.init ?? null),
        test: this.normalizeNode(node.test ?? null),
        update: this.normalizeNode(node.update ?? null),
        body: this.normalizeNode(node.body)
      };
    }
    if (type === "ForEach") {
      return {
        type,
        kind: node.kind ?? "of",
        target: this.normalizeNode(node.target),
        iterable: this.normalizeNode(node.iterable),
        body: this.normalizeNode(node.body)
      };
    }
    if (type === "Try") {
      return {
        type,
        errorName: node.errorName ?? "",
        body: this.normalizeNode(node.body),
        handler: this.normalizeNode(node.handler)
      };
    }
    if (type === "Identifier") {
      return { type, name: node.name ?? "" };
    }
    if (type === "ElementRef") {
      return { type, id: node.id ?? "" };
    }
    if (type === "Literal") {
      return { type, value: node.value };
    }
    if (type === "TemplateExpression") {
      return {
        type,
        parts: Array.isArray(node.parts) ? node.parts.map((part) => this.normalizeNode(part)) : []
      };
    }
    if (type === "TaggedTemplateExpression") {
      return {
        type,
        tag: this.normalizeNode(node.tag),
        template: this.normalizeNode(node.template)
      };
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
        property: node.property ?? "",
        optional: Boolean(node.optional)
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
    if (type === "ElementDirective") {
      return {
        type,
        element: this.normalizeNode(node.element),
        directive: this.normalizeNode(node.directive)
      };
    }
    if (type === "ElementProperty") {
      return {
        type,
        element: this.normalizeNode(node.element),
        property: node.property ?? ""
      };
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
    if (type === "ObjectExpression") {
      return {
        type,
        entries: Array.isArray(node.entries) ? node.entries.map((entry) => ({
          key: entry?.key ?? "",
          computed: Boolean(entry?.computed),
          keyExpr: entry?.keyExpr ? this.normalizeNode(entry.keyExpr) : null,
          value: this.normalizeNode(entry?.value)
        })) : []
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
  applyBehaviorFunctions(element, scope, functions, rootScope, lifetime) {
    for (const declaration of functions) {
      this.applyBehaviorFunction(element, scope, declaration, rootScope, lifetime);
    }
  }
  applyBehaviorFunction(element, scope, declaration, rootScope, lifetime) {
    const existing = scope.getPath(declaration.name);
    if (existing !== void 0 && typeof existing !== "function") {
      throw new Error(`Cannot override non-function '${declaration.name}' with a function`);
    }
    const selfRef = this.getGroupProxy(scope);
    const fn = (...args) => {
      if (lifetime.isDisposed && !lifetime.isDisposing) {
        return void 0;
      }
      const signal = lifetime.isDisposing ? void 0 : lifetime.signal;
      const callScope = scope.createChild ? scope.createChild() : scope;
      return batch(() => this.withExecutionContext(element, lifetime, () => {
        const context = {
          scope: callScope,
          rootScope: rootScope ?? callScope,
          globals: this.globals,
          engine: this,
          element,
          self: selfRef,
          returnValue: void 0,
          returning: false,
          breaking: false,
          continuing: false,
          lifetime,
          ...signal ? { signal } : {}
        };
        const previousValues = /* @__PURE__ */ new Map();
        const restore = () => {
          if (callScope === scope) {
            this.restoreFunctionParams(callScope, declaration.params, previousValues);
          }
        };
        let result;
        try {
          const paramsResult = this.applyFunctionParams(callScope, declaration.params, previousValues, context, args);
          if (isPromiseLike2(paramsResult)) {
            result = Promise.resolve(paramsResult).then(() => declaration.body.evaluate(context));
          } else {
            result = declaration.body.evaluate(context);
          }
        } catch (error) {
          restore();
          throw error;
        }
        if (declaration.isAsync) {
          return Promise.resolve(result).then(() => context.returnValue).finally(restore);
        }
        if (isPromiseLike2(result)) {
          return Promise.resolve(result).then(() => context.returnValue).finally(restore);
        }
        restore();
        return context.returnValue;
      }, callScope));
    };
    scope.setPath(declaration.name, fn);
  }
  applyFunctionParams(scope, params, previousValues, context, args) {
    let argIndex = 0;
    const apply = (index) => {
      for (let i = index; i < params.length; i += 1) {
        const param = params[i];
        const name = param.name;
        if (!name) {
          continue;
        }
        previousValues.set(name, scope.getPath(name));
        if (param.rest) {
          scope.setPath(`self.${name}`, args.slice(argIndex));
          argIndex = args.length;
          continue;
        }
        let value = args[argIndex];
        argIndex += 1;
        if (value === void 0 && param.defaultValue) {
          const defaultValue = param.defaultValue.evaluate(context);
          if (isPromiseLike2(defaultValue)) {
            return Promise.resolve(defaultValue).then((resolved) => {
              scope.setPath(`self.${name}`, resolved);
              return apply(i + 1);
            });
          }
          value = defaultValue;
        }
        scope.setPath(`self.${name}`, value);
      }
      return void 0;
    };
    return apply(0);
  }
  restoreFunctionParams(scope, params, previousValues) {
    for (const param of params) {
      const name = param.name;
      if (!name) {
        continue;
      }
      scope.setPath(name, previousValues.get(name));
    }
  }
  async applyBehaviorDeclarations(element, scope, declarations, rootScope, behaviorId, lifetime) {
    for (const declaration of declarations) {
      if (lifetime?.isDisposed) {
        return;
      }
      await this.applyBehaviorDeclaration(element, scope, declaration, rootScope, behaviorId, lifetime);
    }
  }
  async applyBehaviorDeclaration(element, scope, declaration, rootScope, behaviorId, lifetime) {
    const selfRef = this.getGroupProxy(scope);
    const context = {
      scope,
      rootScope,
      globals: this.globals,
      engine: this,
      element,
      self: selfRef,
      ...lifetime ? { lifetime, signal: lifetime.signal } : {}
    };
    const operator = declaration.operator;
    const debounceMs = declaration.flags.debounce ? declaration.flagArgs.debounce ?? 200 : void 0;
    const transform = (value) => this.applyCustomFlagTransforms(value, element, scope, declaration, lifetime);
    const importantKey = this.getImportantKey(declaration);
    if (!declaration.flags.important && importantKey && this.isImportant(element, importantKey)) {
      return;
    }
    if (importantKey && this.isInlineDeclaration(element, importantKey)) {
      return;
    }
    if (!lifetime) {
      return;
    }
    this.applyCustomFlags(element, scope, declaration, lifetime);
    if (declaration.target instanceof IdentifierExpression) {
      const value = await declaration.value.evaluate(context);
      if (lifetime.isDisposed) {
        return;
      }
      const transformed = this.applyCustomFlagTransforms(value, element, scope, declaration, lifetime);
      scope.setPath(declaration.target.name, transformed);
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }
    if (!(declaration.target instanceof DirectiveExpression)) {
      return;
    }
    const target = declaration.target;
    if (behaviorId !== void 0 && target.kind === "attr" && target.name === "class") {
      this.trackBehaviorClassMapBinding(element, declaration, lifetime);
    }
    const exprIdentifier = declaration.value instanceof IdentifierExpression ? declaration.value.name : void 0;
    if (operator === ":>") {
      if (exprIdentifier) {
        this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs, rootScope, transform, lifetime);
      }
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }
    if (operator === ":=" && exprIdentifier) {
      this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs, rootScope, transform, lifetime);
    }
    if (!exprIdentifier) {
      const value = await declaration.value.evaluate(context);
      if (lifetime.isDisposed) {
        return;
      }
      const transformed = this.applyCustomFlagTransforms(value, element, scope, declaration, lifetime);
      this.setDirectiveValue(element, target, transformed, declaration);
      const shouldWatch2 = operator === ":<" || operator === ":=";
      if (shouldWatch2) {
        this.applyDirectiveFromExpression(
          element,
          target,
          declaration.value,
          scope,
          debounceMs,
          rootScope,
          declaration,
          behaviorId,
          lifetime
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
      debounceMs,
      shouldWatch,
      rootScope,
      declaration,
      behaviorId,
      lifetime
    );
    if (declaration.flags.important && importantKey) {
      this.markImportant(element, importantKey);
    }
  }
  applyCustomFlags(element, scope, declaration, lifetime) {
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
        declaration,
        lifetime,
        signal: lifetime.signal,
        onCleanup: (disposer) => lifetime.onCleanup(disposer)
      });
    }
  }
  applyCustomFlagTransforms(value, element, scope, declaration, lifetime) {
    if (this.flagHandlers.size === 0) {
      return value;
    }
    const owner = lifetime ?? this.getInlineLifetime(element);
    let nextValue = value;
    for (const [name, handler] of this.flagHandlers) {
      if (!declaration.flags[name] || !handler.transformValue) {
        continue;
      }
      nextValue = handler.transformValue(
        {
          name,
          args: declaration.flagArgs[name],
          element,
          scope,
          declaration,
          lifetime: owner,
          signal: owner.signal,
          onCleanup: (disposer) => owner.onCleanup(disposer)
        },
        nextValue
      );
    }
    return nextValue;
  }
  async applyBehaviorModifierHook(hook, behavior, element, scope, rootScope, lifetime) {
    if (this.behaviorModifiers.size === 0) {
      return;
    }
    for (const [name, handler] of this.behaviorModifiers) {
      if (!behavior.flags?.[name]) {
        continue;
      }
      const callback = handler[hook];
      if (!callback) {
        continue;
      }
      await callback({
        name,
        args: behavior.flagArgs?.[name],
        element,
        scope,
        rootScope,
        behavior,
        engine: this,
        lifetime,
        signal: lifetime.signal,
        onCleanup: (disposer) => lifetime.onCleanup(disposer)
      });
    }
  }
  behaviorHasModifierHooks(behavior) {
    if (this.behaviorModifiers.size === 0) {
      return false;
    }
    const flags = behavior.flags ?? {};
    for (const name of Object.keys(flags)) {
      if (flags[name] && this.behaviorModifiers.has(name)) {
        return true;
      }
    }
    return false;
  }
  applyDirectiveFromScope(element, target, expr, scope, debounceMs, watch = true, rootScope, binding, behaviorId, lifetime) {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      const handler2 = () => {
        if (lifetime?.isDisposed) {
          return;
        }
        const useRoot = expr.startsWith("root.") && rootScope;
        const sourceScope = useRoot ? rootScope : scope;
        const localExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
        this.setHtml(element, sourceScope.get(localExpr.trim()), {
          trusted: Boolean(binding?.flags?.trusted)
        });
      };
      handler2();
      if (watch) {
        const useRoot = expr.startsWith("root.") && rootScope;
        const sourceScope = useRoot ? rootScope : scope;
        const watchExpr = useRoot ? expr.slice("root.".length) : expr;
        this.watchWithDebounce(sourceScope, watchExpr, handler2, debounceMs, element, behaviorId, lifetime);
      }
      return;
    }
    const handler = () => {
      if (lifetime?.isDisposed) {
        return;
      }
      const useRoot = expr.startsWith("root.") && rootScope;
      const sourceScope = useRoot ? rootScope : scope;
      const localExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
      const value = sourceScope.get(localExpr);
      if (value == null) {
        if (target.kind === "attr" && target.name === "class") {
          this.clearClassMapBinding(element, binding ?? target);
        }
        return;
      }
      this.setDirectiveValue(element, target, value, binding);
    };
    handler();
    if (watch) {
      const useRoot = expr.startsWith("root.") && rootScope;
      const sourceScope = useRoot ? rootScope : scope;
      const watchExpr = useRoot ? expr.slice("root.".length) : expr;
      this.watchWithDebounce(sourceScope, watchExpr, handler, debounceMs, element, behaviorId, lifetime);
    }
  }
  applyDirectiveFromExpression(element, target, expr, scope, debounceMs, rootScope, binding, behaviorId, lifetime) {
    let version = 0;
    if (lifetime) {
      this.trackBehaviorInvalidator(() => {
        version += 1;
      }, lifetime);
    }
    const handler = async () => {
      if (lifetime?.isDisposed) {
        return;
      }
      throwIfAborted(lifetime?.signal);
      const currentVersion = ++version;
      const selfRef = this.getGroupProxy(scope);
      const context = {
        scope,
        rootScope,
        globals: this.globals,
        engine: this,
        element,
        self: selfRef,
        ...lifetime ? { lifetime, signal: lifetime.signal } : {}
      };
      const value = await expr.evaluate(context);
      if (currentVersion !== version || lifetime?.isDisposed) {
        return;
      }
      this.setDirectiveValue(element, target, value, binding);
    };
    const run = () => {
      void handler().catch((error) => {
        if (!lifetime?.signal.aborted && !isAbortError(error)) {
          this.emitError(element, error);
        }
      });
    };
    run();
    this.watchExpression(
      scope,
      rootScope,
      expr,
      () => {
        run();
      },
      debounceMs,
      element,
      behaviorId,
      lifetime
    );
  }
  applyDirectiveToScope(element, target, expr, scope, debounceMs, rootScope, transform, lifetime) {
    const useRoot = expr.startsWith("root.") && rootScope;
    const targetScope = useRoot ? rootScope : scope;
    const targetExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
    if (target.kind === "attr" && target.name === "value") {
      this.applyValueBindingToScope(element, targetExpr, debounceMs, targetScope, transform, lifetime);
      return;
    }
    if (target.kind === "attr" && target.name === "checked") {
      this.applyCheckedBindingToScope(element, targetExpr, debounceMs, targetScope, transform, lifetime);
      return;
    }
    const value = this.getDirectiveValue(element, target);
    if (value != null) {
      const nextValue = transform ? transform(value) : value;
      targetScope.set(targetExpr, nextValue);
    }
  }
  applyCheckedBindingToScope(element, expr, debounceMs, scope, transform, lifetime) {
    if (!(element instanceof HTMLInputElement)) {
      return;
    }
    const handler = () => {
      const targetScope = scope ?? this.getScope(element);
      const value = transform ? transform(element.checked) : element.checked;
      targetScope.set(expr, value);
    };
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    const owner = lifetime ?? this.getInlineLifetime(element);
    if (debounceMs) {
      owner.onCleanup(effectiveHandler.cancel);
    }
    effectiveHandler();
    this.addEventListener(owner, element, "change", effectiveHandler);
    this.addEventListener(owner, element, "input", effectiveHandler);
  }
  applyValueBindingToScope(element, expr, debounceMs, scope, transform, lifetime) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
      return;
    }
    const handler = () => {
      const targetScope = scope ?? this.getScope(element);
      const value = element.value;
      const nextValue = transform ? transform(value) : value;
      targetScope.set(expr, nextValue);
    };
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    const owner = lifetime ?? this.getInlineLifetime(element);
    if (debounceMs) {
      owner.onCleanup(effectiveHandler.cancel);
    }
    effectiveHandler();
    this.addEventListener(owner, element, "input", effectiveHandler);
    this.addEventListener(owner, element, "change", effectiveHandler);
  }
  setDirectiveValue(element, target, value, binding) {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      this.setHtml(element, value, {
        trusted: Boolean(binding?.flags?.trusted)
      });
      return;
    }
    if (target.kind === "attr") {
      if (target.name === "class") {
        const bindingKey = binding ?? target;
        if (value == null) {
          this.clearClassMapBinding(element, bindingKey);
          return;
        }
        if (this.isClassMapValue(value)) {
          this.applyClassMap(element, value, bindingKey);
          return;
        }
        this.clearClassMapBinding(element, bindingKey);
      }
      if (target.name === "text" && element instanceof HTMLElement) {
        element.innerText = value == null ? "" : String(value);
        return;
      }
      if (target.name === "content" && element instanceof HTMLElement) {
        element.textContent = value == null ? "" : String(value);
        return;
      }
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
  isClassMapValue(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  applyClassMap(element, value, binding) {
    const bindings = this.classMapBindings.get(element) ?? /* @__PURE__ */ new Map();
    const previousKeys = bindings.get(binding) ?? /* @__PURE__ */ new Set();
    const nextKeys = new Set(Object.keys(value));
    for (const className of nextKeys) {
      if (!className || /\s/.test(className)) {
        throw new Error(`Invalid @class map key '${className}'; keys must be single class names`);
      }
      element.classList.toggle(className, Boolean(value[className]));
    }
    for (const className of previousKeys) {
      if (!nextKeys.has(className)) {
        element.classList.remove(className);
      }
    }
    bindings.set(binding, nextKeys);
    this.classMapBindings.set(element, bindings);
  }
  clearClassMapBinding(element, binding) {
    const bindings = this.classMapBindings.get(element);
    const previousKeys = bindings?.get(binding);
    if (!previousKeys) {
      return;
    }
    for (const className of previousKeys) {
      element.classList.remove(className);
    }
    bindings?.delete(binding);
  }
  getDirectiveValue(element, target) {
    if (target.kind === "attr") {
      if (target.name === "text" && element instanceof HTMLElement) {
        return element.innerText;
      }
      if (target.name === "content" && element instanceof HTMLElement) {
        return element.textContent ?? "";
      }
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
  handleHtmlBehaviors(root) {
    this.disposeDynamicBehaviors(root);
    const scripts = Array.from(root.querySelectorAll('script[type="text/vsn"]'));
    if (scripts.length === 0 && root.children.length === 0) {
      return;
    }
    if (scripts.length > 0) {
      const source = scripts.map((script) => script.textContent ?? "").join("\n");
      if (source.trim()) {
        this.registerBehaviorSource(source, root);
      }
    }
    const addedRoots = this.scopes.has(root) ? Array.from(root.children) : [root];
    for (const addedRoot of addedRoots) {
      this.ignoredAdded.set(addedRoot, true);
      this.handleAddedNode(addedRoot, false);
    }
    void this.applyBehaviors(root);
  }
  registerDefaultAttributeHandlers() {
    this.registerAttributeHandler({
      id: "vsn-bind",
      match: (name) => name.startsWith("vsn-bind"),
      handle: (element, name, value, scope) => {
        const parsedDirection = this.parseBindDirection(name);
        const config = this.resolveBindConfig(element, value, scope, parsedDirection);
        const direction = config.direction;
        const auto = parsedDirection === "auto";
        this.bindBindings.set(element, { expr: value, direction, auto });
        if (!auto && (direction === "to" || direction === "both")) {
          this.markInlineDeclaration(element, `state:${value}`);
        }
        if (config.seedFromScope) {
          applyBindToElement(element, value, scope);
        }
        if (config.deferToScope) {
          this.pendingAutoBindToScope.push({ element, expr: value, scope });
        } else if (config.syncToScope) {
          applyBindToScope(element, value, scope);
        }
        if (direction === "to" || direction === "both") {
          this.attachBindInputHandler(element, value);
        }
        if (direction === "from" || direction === "both") {
          this.watch(scope, value, () => applyBindToElement(element, value, scope), element);
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
        this.watch(scope, value, () => this.evaluate(element), element);
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
        this.watch(scope, value, () => this.evaluate(element), element);
      }
    });
    this.registerAttributeHandler({
      id: "vsn-html",
      match: (name) => name.startsWith("vsn-html"),
      handle: (element, _name, value, scope) => {
        this.htmlBindings.set(element, { expr: value, trusted: _name.includes("!trusted") });
        this.markInlineDeclaration(element, "attr:html");
        if (element instanceof HTMLElement) {
          this.setHtml(element, scope.get(value.trim()), { trusted: _name.includes("!trusted") });
        }
        this.watch(scope, value, () => this.evaluate(element), element);
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
        this.watch(scope, config.listExpr, () => this.renderEach(element), element);
      }
    });
    this.registerAttributeHandler({
      id: "vsn-get",
      match: (name) => name.startsWith("vsn-get"),
      handle: (element, name, _value, _scope, context) => {
        const autoLoad = name.includes("!load");
        const url = element.getAttribute(name) ?? "";
        const target = element.getAttribute("vsn-target") ?? void 0;
        const swap = element.getAttribute("vsn-swap") ?? "inner";
        const config = {
          url,
          swap,
          ...target ? { targetSelector: target } : {}
        };
        this.getBindings.set(element, config);
        this.attachGetHandler(element, autoLoad, context?.lifetime);
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
var VERSION = true ? "1.0.14" : "0.1.0";
function parseCFS(source) {
  const parser = new Parser(source);
  return parser.parseProgram();
}
if (typeof window !== "undefined") {
  window["parseCFS"] = parseCFS;
}
async function loadBehaviorSources(root, signal) {
  const documentRoot = root instanceof Document ? root : root.ownerDocument;
  const scripts = Array.from(root.querySelectorAll('script[type="text/vsn"]'));
  const sources = await Promise.all(
    scripts.map(async (script) => {
      const src = script.getAttribute("src")?.trim();
      if (!src) {
        return script.textContent ?? "";
      }
      const url = new URL(src, documentRoot.baseURI);
      const response = signal ? await fetch(url.href, { signal }) : await fetch(url.href);
      if (signal?.aborted) {
        return "";
      }
      if (!response.ok) {
        throw new Error(`Failed to load VSN source '${url.href}' (HTTP ${response.status})`);
      }
      return response.text();
    })
  );
  return sources.join("\n");
}
function autoMount(root = document) {
  if (typeof document === "undefined") {
    return null;
  }
  const engine = new Engine();
  globalThis.VSNEngine = engine;
  const startTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  const mount = async () => {
    const target = root instanceof Document ? root.body : root;
    if (target) {
      try {
        if (engine.signal.aborted) {
          return;
        }
        const plugins = globalThis.VSNPlugins;
        if (plugins && typeof plugins === "object") {
          for (const plugin of Object.values(plugins)) {
            if (typeof plugin === "function") {
              plugin(engine);
            }
          }
        }
        const sources = await loadBehaviorSources(root, engine.signal);
        if (engine.signal.aborted) {
          return;
        }
        if (sources.trim()) {
          engine.registerBehaviors(sources);
        }
        await engine.mount(target);
        const endTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const elapsedMs = Math.round(endTime - startTime);
        console.log(`Took ${elapsedMs}ms to start up VSN.js. https://www.vsnjs.com/ v${VERSION}`);
      } catch (error) {
        if (engine.signal.aborted || isAbortError(error)) {
          return;
        }
        console.warn("vsn:mountError", error);
        target.dispatchEvent(new CustomEvent("vsn:error", {
          detail: { error, selector: "mount" },
          bubbles: true
        }));
      }
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(() => void mount(), 0), { once: true });
  } else {
    setTimeout(() => void mount(), 0);
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
  ArrayPattern,
  AssertError,
  AssertNode,
  AssignmentNode,
  AwaitExpression,
  BaseNode,
  BehaviorNode,
  BinaryExpression,
  BlockNode,
  BreakNode,
  CallExpression,
  ContinueNode,
  DeclarationNode,
  DirectiveExpression,
  ElementDirectiveExpression,
  ElementPropertyExpression,
  ElementRefExpression,
  Engine,
  ForEachNode,
  ForNode,
  FunctionDeclarationNode,
  FunctionExpression,
  IdentifierExpression,
  IfNode,
  IndexExpression,
  Lexer,
  Lifetime,
  LiteralExpression,
  MemberExpression,
  ObjectExpression,
  ObjectPattern,
  OnBlockNode,
  Parser,
  ProgramNode,
  QueryExpression,
  RestElement,
  ReturnNode,
  Scope,
  SelectorNode,
  SpreadElement,
  TaggedTemplateExpression,
  TemplateExpression,
  TernaryExpression,
  TokenType,
  TryNode,
  UnaryExpression,
  UseNode,
  VERSION,
  WhileNode,
  autoMount,
  batch,
  computed,
  effect,
  isAbortError,
  parseCFS,
  throwIfAborted
});
//# sourceMappingURL=index.cjs.map