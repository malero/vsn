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
      "?": "Question" /* Question */
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
  evaluate(_context) {
    return void 0;
  }
};
function isPromiseLike(value) {
  return Boolean(value) && typeof value.then === "function";
}
function resolveMaybe(value, next) {
  if (isPromiseLike(value)) {
    return value.then(next);
  }
  return next(value);
}
function evaluateWithChildScope(context, block) {
  const scope = context.scope;
  if (!scope || !scope.createChild) {
    return block.evaluate(context);
  }
  const previousScope = context.scope;
  context.scope = scope.createChild();
  try {
    return block.evaluate(context);
  } finally {
    context.scope = previousScope;
  }
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
    let index = 0;
    const run = () => {
      while (index < this.statements.length) {
        if (context.returning || context.breaking || context.continuing) {
          break;
        }
        const statement = this.statements[index];
        index += 1;
        if (statement && typeof statement.evaluate === "function") {
          const result = statement.evaluate(context);
          if (isPromiseLike(result)) {
            return result.then(() => run());
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
    const target = this.target;
    if (target instanceof DirectiveExpression) {
      const value2 = this.value.evaluate(context);
      return resolveMaybe(value2, (resolvedValue) => {
        this.assignDirectiveTarget(context, target, resolvedValue, this.operator);
        return resolvedValue;
      });
    }
    if (target instanceof ElementDirectiveExpression) {
      const elementValue = target.element.evaluate(context);
      return resolveMaybe(elementValue, (resolvedElement) => {
        const element = resolveElementFromReference(resolvedElement);
        if (!element) {
          return void 0;
        }
        const value2 = this.value.evaluate(context);
        return resolveMaybe(value2, (resolvedValue) => {
          this.assignDirectiveTarget(
            { ...context, element },
            target.directive,
            resolvedValue,
            this.operator
          );
          return resolvedValue;
        });
      });
    }
    if (!context.scope || !context.scope.setPath) {
      return void 0;
    }
    if (this.operator === "++" || this.operator === "--") {
      return this.applyIncrement(context);
    }
    const value = this.value.evaluate(context);
    return resolveMaybe(value, (resolvedValue) => {
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
          if (resolvedTarget?.scope?.setPath) {
            resolvedTarget.scope.setPath(resolvedTarget.path, resolvedValue);
            return resolvedValue;
          }
          this.assignTarget(context, this.target, resolvedValue);
          return resolvedValue;
        });
      }
      this.assignTarget(context, this.target, resolvedValue, this.operator);
      return resolvedValue;
    });
  }
  applyCompoundAssignment(context, value) {
    if (!context.scope || !context.scope.setPath) {
      return void 0;
    }
    const resolved = this.resolveAssignmentTarget(context);
    return resolveMaybe(resolved, (resolvedTarget) => {
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
    });
  }
  applyIncrement(context) {
    if (!context.scope || !context.scope.setPath) {
      return void 0;
    }
    const resolved = this.resolveAssignmentTarget(context);
    return resolveMaybe(resolved, (resolvedTarget) => {
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
    });
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
      });
    }
    if (this.target instanceof IndexExpression) {
      const path = this.resolveIndexPath(context, this.target);
      return resolveMaybe(path, (resolvedPath) => {
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
      });
    }
    return null;
  }
  resolveIndexPath(context, expr) {
    const base = this.resolveTargetPath(context, expr.target);
    return resolveMaybe(base, (resolvedBase) => {
      if (!resolvedBase) {
        return null;
      }
      const indexValue = expr.index.evaluate(context);
      return resolveMaybe(indexValue, (resolvedIndex) => {
        if (resolvedIndex == null) {
          return null;
        }
        return `${resolvedBase}.${resolvedIndex}`;
      });
    });
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
    if (target instanceof DirectiveExpression) {
      this.assignDirectiveTarget(context, target, value, operator);
      return;
    }
    if (target instanceof ElementDirectiveExpression) {
      const elementValue = target.element.evaluate(context);
      const next = resolveMaybe(elementValue, (resolvedElement) => {
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
      });
      if (isPromiseLike(next)) {
        void next;
      }
      return;
    }
    if (target instanceof ElementPropertyExpression) {
      const elementValue = target.element.evaluate(context);
      const next = resolveMaybe(elementValue, (resolvedElement) => {
        if (resolvedElement && typeof resolvedElement === "object" && resolvedElement.__scope) {
          resolvedElement.__scope.setPath?.(target.property, value);
          return;
        }
        const element = resolveElementFromReference(resolvedElement);
        if (!element) {
          return;
        }
        element[target.property] = value;
      });
      if (isPromiseLike(next)) {
        void next;
      }
      return;
    }
    if (target instanceof IdentifierExpression) {
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
    if (context.returning) {
      return context.returnValue;
    }
    const nextValue = this.value ? this.value.evaluate(context) : void 0;
    return resolveMaybe(nextValue, (resolved) => {
      context.returnValue = resolved;
      context.returning = true;
      return context.returnValue;
    });
  }
};
var BreakNode = class extends BaseNode {
  constructor() {
    super("Break");
  }
  evaluate(context) {
    context.breaking = true;
    return void 0;
  }
};
var ContinueNode = class extends BaseNode {
  constructor() {
    super("Continue");
  }
  evaluate(context) {
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
    const value = this.test.evaluate(context);
    return resolveMaybe(value, (resolved) => {
      if (!resolved) {
        throw new AssertError();
      }
      return resolved;
    });
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
    const condition = this.test.evaluate(context);
    return resolveMaybe(condition, (resolved) => {
      if (resolved) {
        return evaluateWithChildScope(context, this.consequent);
      }
      if (this.alternate) {
        return evaluateWithChildScope(context, this.alternate);
      }
      return void 0;
    });
  }
};
var WhileNode = class extends BaseNode {
  constructor(test, body) {
    super("While");
    this.test = test;
    this.body = body;
  }
  evaluate(context) {
    const previousScope = context.scope;
    if (context.scope?.createChild) {
      context.scope = context.scope.createChild();
    }
    const run = () => {
      const condition = this.test.evaluate(context);
      return resolveMaybe(condition, (resolved) => {
        if (!resolved || context.returning) {
          return void 0;
        }
        const bodyResult = this.body.evaluate(context);
        return resolveMaybe(bodyResult, () => {
          if (context.breaking) {
            context.breaking = false;
            return void 0;
          }
          if (context.continuing) {
            context.continuing = false;
          }
          return run();
        });
      });
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
    const iterableValue = this.iterable.evaluate(context);
    return resolveMaybe(iterableValue, (resolved) => {
      const entries = this.getEntries(resolved);
      const previousScope = context.scope;
      let bodyScope = context.scope;
      if (context.scope?.createChild) {
        bodyScope = context.scope.createChild();
      }
      let index = 0;
      const loop = () => {
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
        });
      };
      return loop();
    });
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
    const initResult = this.init ? this.init.evaluate(context) : void 0;
    const run = () => {
      const previousScope = context.scope;
      let bodyScope = context.scope;
      if (context.scope?.createChild) {
        bodyScope = context.scope.createChild();
      }
      const loop = () => {
        const testResult = this.test ? this.test.evaluate(context) : true;
        return resolveMaybe(testResult, (passed) => {
          if (!passed || context.returning) {
            context.scope = previousScope;
            return void 0;
          }
          context.scope = bodyScope;
          const bodyResult = this.body.evaluate(context);
          return resolveMaybe(bodyResult, () => {
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
            return resolveMaybe(updateResult, () => loop());
          });
        });
      };
      return loop();
    };
    return resolveMaybe(initResult, () => run());
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
    const handleError = (error) => {
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
        if (scope && scope.setPath && handlerScope === previousScope) {
          scope.setPath(this.errorName, previous);
        }
        context.scope = previousScope;
        return void 0;
      });
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
    const scope = context.scope;
    const globals = context.globals;
    const element = context.element;
    if (this.isAsync) {
      return (...args) => {
        const activeScope = scope?.createChild ? scope.createChild() : scope;
        const inner = {
          scope: activeScope,
          rootScope: context.rootScope,
          ...globals ? { globals } : {},
          ...element ? { element } : {},
          returnValue: void 0,
          returning: false,
          breaking: false,
          continuing: false
        };
        const previousValues = /* @__PURE__ */ new Map();
        const applyResult = activeScope ? this.applyParams(activeScope, previousValues, inner, args) : void 0;
        const bodyResult = resolveMaybe(applyResult, () => this.body.evaluate(inner));
        const finalResult = resolveMaybe(bodyResult, () => inner.returnValue);
        return Promise.resolve(finalResult).finally(() => {
          if (activeScope && activeScope === scope) {
            this.restoreParams(activeScope, previousValues);
          }
        });
      };
    }
    return (...args) => {
      const activeScope = scope?.createChild ? scope.createChild() : scope;
      const inner = {
        scope: activeScope,
        rootScope: context.rootScope,
        ...globals ? { globals } : {},
        ...element ? { element } : {},
        returnValue: void 0,
        returning: false,
        breaking: false,
        continuing: false
      };
      const previousValues = /* @__PURE__ */ new Map();
      const applyResult = activeScope ? this.applyParams(activeScope, previousValues, inner, args) : void 0;
      const bodyResult = resolveMaybe(applyResult, () => this.body.evaluate(inner));
      const finalResult = resolveMaybe(bodyResult, () => inner.returnValue);
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
  }
  applyParams(scope, previousValues, context, args) {
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
            setPath(`self.${name}`, resolvedDefault);
            return applyAt(i + 1, argIndex + 1);
          });
        }
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
    const engine = globalThis.VSNEngine;
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
    let result = "";
    let index = 0;
    const run = () => {
      while (index < this.parts.length) {
        const part = this.parts[index];
        index += 1;
        const value = part.evaluate(context);
        return resolveMaybe(value, (resolved) => {
          result += resolved == null ? "" : String(resolved);
          return run();
        });
      }
      return result;
    };
    return run();
  }
};
var UnaryExpression = class extends BaseNode {
  constructor(operator, argument) {
    super("UnaryExpression");
    this.operator = operator;
    this.argument = argument;
  }
  evaluate(context) {
    const value = this.argument.evaluate(context);
    return resolveMaybe(value, (resolved) => {
      if (this.operator === "!") {
        return !resolved;
      }
      if (this.operator === "-") {
        return -resolved;
      }
      return resolved;
    });
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
    const leftValue = this.left.evaluate(context);
    return resolveMaybe(leftValue, (resolvedLeft) => {
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
      });
    });
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
    const condition = this.test.evaluate(context);
    return resolveMaybe(condition, (resolved) => {
      if (resolved) {
        return this.consequent.evaluate(context);
      }
      return this.alternate.evaluate(context);
    });
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
    const resolved = this.resolve(context);
    return resolveMaybe(resolved, (resolvedValue) => resolvedValue?.value);
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
      if (resolvedTarget == null) {
        return { value: void 0, target: resolvedTarget, optional: this.optional };
      }
      return { value: resolvedTarget[this.property], target: resolvedTarget, optional: this.optional };
    });
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
    const resolved = this.resolveCallee(context);
    return resolveMaybe(resolved, (resolvedCallee) => {
      const fnValue = resolvedCallee?.fn ?? this.callee.evaluate(context);
      return resolveMaybe(fnValue, (resolvedFn) => {
        if (typeof resolvedFn !== "function") {
          return void 0;
        }
        const values = [];
        const evalArgs = (index) => {
          for (let i = index; i < this.args.length; i += 1) {
            const arg = this.args[i];
            const argValue = arg.evaluate(context);
            return resolveMaybe(argValue, (resolvedArg) => {
              values.push(resolvedArg);
              return evalArgs(i + 1);
            });
          }
          return resolvedFn.apply(resolvedCallee?.thisArg, values);
        };
        return evalArgs(0);
      });
    });
  }
  resolveCallee(context) {
    if (this.callee instanceof MemberExpression) {
      const resolved = this.callee.resolve(context);
      return resolveMaybe(resolved, (resolvedValue) => {
        if (!resolvedValue) {
          return void 0;
        }
        return { fn: resolvedValue.value, thisArg: resolvedValue.target };
      });
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
            pushElements(resolvedSpread);
            return evalAt(i + 1);
          });
        }
        const value = element.evaluate(context);
        return resolveMaybe(value, (resolvedValue) => {
          values.push(resolvedValue);
          return evalAt(i + 1);
        });
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
    const result = {};
    const evalAt = (index) => {
      for (let i = index; i < this.entries.length; i += 1) {
        const entry = this.entries[i];
        if ("spread" in entry) {
          const spreadValue = entry.spread.evaluate(context);
          return resolveMaybe(spreadValue, (resolvedSpread) => {
            if (resolvedSpread != null) {
              Object.assign(result, resolvedSpread);
            }
            return evalAt(i + 1);
          });
        }
        if ("computed" in entry && entry.computed) {
          const keyValue = entry.keyExpr.evaluate(context);
          return resolveMaybe(keyValue, (resolvedKey) => {
            const entryValue = entry.value.evaluate(context);
            return resolveMaybe(entryValue, (resolvedValue) => {
              result[String(resolvedKey)] = resolvedValue;
              return evalAt(i + 1);
            });
          });
        }
        const value = entry.value.evaluate(context);
        return resolveMaybe(value, (resolvedValue) => {
          result[entry.key] = resolvedValue;
          return evalAt(i + 1);
        });
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
    const target = this.target.evaluate(context);
    return resolveMaybe(target, (resolvedTarget) => {
      if (resolvedTarget == null) {
        return void 0;
      }
      const index = this.index.evaluate(context);
      return resolveMaybe(index, (resolvedIndex) => {
        if (resolvedIndex == null) {
          return void 0;
        }
        const key = this.normalizeIndexKey(resolvedTarget, resolvedIndex);
        return resolvedTarget[key];
      });
    });
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
    const elementValue = this.element.evaluate(context);
    return resolveMaybe(elementValue, (resolvedElement) => {
      const element = resolveElementFromReference(resolvedElement);
      if (!element) {
        return void 0;
      }
      const nextContext = { ...context, element };
      return this.directive.evaluate(nextContext);
    });
  }
};
var ElementPropertyExpression = class extends BaseNode {
  constructor(element, property) {
    super("ElementProperty");
    this.element = element;
    this.property = property;
  }
  evaluate(context) {
    const elementValue = this.element.evaluate(context);
    return resolveMaybe(elementValue, (resolvedElement) => {
      if (resolvedElement && typeof resolvedElement === "object" && resolvedElement.__scope) {
        return resolvedElement.__scope.getPath?.(this.property);
      }
      const element = resolveElementFromReference(resolvedElement);
      if (!element) {
        return void 0;
      }
      return element[this.property];
    });
  }
};
function resolveElementFromReference(value) {
  if (value && typeof value === "object") {
    if (value.nodeType === 1) {
      return value;
    }
    const candidate = value.__element;
    if (candidate && typeof candidate === "object" && candidate.nodeType === 1) {
      return candidate;
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
    const value = this.argument.evaluate(context);
    return Promise.resolve(value);
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
      selectorText += this.stream.next().value;
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
    const leadingFlags = this.parseOnFlags();
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
    const trailingFlags = this.parseOnFlags();
    const flags = { ...leadingFlags.flags, ...trailingFlags.flags };
    const flagArgs = { ...leadingFlags.flagArgs, ...trailingFlags.flagArgs };
    const body = this.parseBlock({ allowDeclarations: false });
    return new OnBlockNode(event, args, body, flags, flagArgs);
  }
  parseOnFlags() {
    const flags = {};
    const flagArgs = {};
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
      if (afterParen?.type === "Identifier" /* Identifier */ || afterParen?.type === "RParen" /* RParen */) {
        continue;
      }
      const customArg = this.parseCustomFlagArg();
      if (customArg !== void 0) {
        flagArgs[name] = customArg;
      }
    }
    return { flags, flagArgs };
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
      if (literal) {
        parts.push(new LiteralExpression(literal));
      }
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
      }
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
      }
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
        if (token.type === "Dot" /* Dot */ && this.stream.peekNonWhitespace(index + 1)?.type === "Identifier" /* Identifier */) {
          index += 2;
          continue;
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
var Scope = class _Scope {
  constructor(parent) {
    this.parent = parent;
    this.root = parent ? parent.root : this;
  }
  data = /* @__PURE__ */ new Map();
  root;
  listeners = /* @__PURE__ */ new Map();
  anyListeners = /* @__PURE__ */ new Set();
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
  if (element instanceof HTMLSelectElement) {
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
  if (element instanceof HTMLSelectElement) {
    element.value = value;
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
    applyHtml(wrapper, "__html", { get: () => html });
    const replacement = wrapper.firstElementChild;
    if (replacement && target.parentNode) {
      target.parentNode.replaceChild(replacement, target);
      onHtmlApplied?.(replacement);
    }
    return;
  }
  applyHtml(target, "__html", { get: () => html });
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
  behaviorRegistryHashes = /* @__PURE__ */ new Set();
  behaviorBindings = /* @__PURE__ */ new WeakMap();
  behaviorListeners = /* @__PURE__ */ new WeakMap();
  behaviorId = 0;
  codeCache = /* @__PURE__ */ new Map();
  behaviorCache = /* @__PURE__ */ new Map();
  observer;
  attributeHandlers = [];
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
  pendingUses = [];
  pendingAutoBindToScope = [];
  scopeWatchers = /* @__PURE__ */ new WeakMap();
  executionStack = [];
  groupProxyCache = /* @__PURE__ */ new WeakMap();
  constructor(options = {}) {
    this.diagnostics = options.diagnostics ?? false;
    this.logger = options.logger ?? console;
    this.registerGlobal("console", console);
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
    const proxy = new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop === "symbol") {
            return void 0;
          }
          if (prop === "__scope") {
            return scope;
          }
          return scope.getPath(String(prop));
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
    this.flagHandlers.set(name, handler);
  }
  registerBehaviorModifier(name, handler = {}) {
    const reserved = /* @__PURE__ */ new Set(["important", "debounce"]);
    if (reserved.has(name)) {
      throw new Error(`Behavior modifier '${name}' is reserved`);
    }
    this.behaviorModifiers.set(name, handler);
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
    const initialDelayMs = config.intervalMs ?? 100;
    const maxDelayMs = 1e3;
    const existing = this.resolveGlobalPath(use.name);
    if (existing !== void 0) {
      this.registerGlobal(use.alias, existing);
      return Promise.resolve();
    }
    if (timeoutMs <= 0) {
      this.emitUseError(use.name, new Error(`vsn: global '${use.name}' not found`));
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let elapsedMs = 0;
      let delayMs = initialDelayMs;
      const check = () => {
        const value = this.resolveGlobalPath(use.name);
        if (value !== void 0) {
          this.registerGlobal(use.alias, value);
          resolve();
          return;
        }
        if (elapsedMs >= timeoutMs) {
          this.emitUseError(use.name, new Error(`vsn: global '${use.name}' not found`));
          resolve();
          return;
        }
        const scheduledDelay = Math.min(delayMs, timeoutMs - elapsedMs);
        setTimeout(() => {
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
      applyHtml(element, htmlBinding.expr, scope);
      this.handleHtmlBehaviors(element);
    }
  }
  attachObserver(root) {
    if (this.observer) {
      return;
    }
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
    this.cleanupScopeWatchers(node);
    this.cleanupBehaviorListeners(node);
    for (const child of Array.from(node.querySelectorAll("*"))) {
      if (this.lifecycleBindings.has(child)) {
        this.runDestruct(child);
      }
      if (this.behaviorBindings.has(child)) {
        this.runBehaviorDestruct(child);
      }
      this.cleanupScopeWatchers(child);
      this.cleanupBehaviorListeners(child);
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
    await this.waitForUses();
    if (this.behaviorRegistry.length > 0) {
      const elements = [root, ...Array.from(root.querySelectorAll("*"))];
      for (const element of elements) {
        await this.reapplyBehaviorsForElement(element);
      }
    }
    this.flushAutoBindQueue();
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
    const rootScope = this.getBehaviorRootScope(element, behavior);
    this.applyBehaviorFunctions(element, scope, behavior.functions, rootScope);
    await this.applyBehaviorDeclarations(element, scope, behavior.declarations, rootScope);
    await this.applyBehaviorModifierHook("onBind", behavior, element, scope, rootScope);
    if (behavior.construct) {
      await this.safeExecuteBlock(behavior.construct, scope, element, rootScope);
    }
    await this.applyBehaviorModifierHook("onConstruct", behavior, element, scope, rootScope);
    for (const onBlock of behavior.onBlocks) {
      this.attachBehaviorOnHandler(
        element,
        onBlock.event,
        onBlock.body,
        onBlock.flags,
        onBlock.flagArgs,
        onBlock.args,
        behavior.id,
        rootScope
      );
    }
    this.logDiagnostic("bind", element, behavior);
  }
  unbindBehaviorForElement(behavior, element, scope, bound) {
    bound.delete(behavior.id);
    const rootScope = this.getBehaviorRootScope(element, behavior);
    if (behavior.destruct) {
      void this.safeExecuteBlock(behavior.destruct, scope, element, rootScope);
    }
    void this.applyBehaviorModifierHook("onDestruct", behavior, element, scope, rootScope);
    const listenerMap = this.behaviorListeners.get(element);
    const listeners = listenerMap?.get(behavior.id);
    if (listeners) {
      for (const listener of listeners) {
        listener.target.removeEventListener(listener.event, listener.handler, listener.options);
      }
      listenerMap?.delete(behavior.id);
    }
    void this.applyBehaviorModifierHook("onUnbind", behavior, element, scope, rootScope);
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
      if (behavior.destruct) {
        void this.safeExecuteBlock(behavior.destruct, scope, element, rootScope);
      }
      void this.applyBehaviorModifierHook("onDestruct", behavior, element, scope, rootScope);
      void this.applyBehaviorModifierHook("onUnbind", behavior, element, scope, rootScope);
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
    void this.safeExecute(config.construct, scope, element);
  }
  runDestruct(element) {
    const config = this.lifecycleBindings.get(element);
    if (!config?.destruct) {
      return;
    }
    const scope = this.getScope(element);
    void this.safeExecute(config.destruct, scope, element);
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
  watch(scope, expr, handler, element) {
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
      if (element) {
        this.trackScopeWatcher(element, target, "path", handler, key);
      }
      return;
    }
    let cursor = scope;
    while (cursor) {
      cursor.on(key, handler);
      if (element) {
        this.trackScopeWatcher(element, cursor, "path", handler, key);
      }
      cursor = cursor.parent;
    }
  }
  watchWithDebounce(scope, expr, handler, debounceMs, element) {
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    this.watch(scope, expr, effectiveHandler, element);
  }
  watchAllScopes(scope, handler, debounceMs, element) {
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    let cursor = scope;
    while (cursor) {
      cursor.onAny(effectiveHandler);
      if (element) {
        this.trackScopeWatcher(element, cursor, "any", effectiveHandler);
      }
      cursor = cursor.parent;
    }
  }
  trackScopeWatcher(element, scope, kind, handler, key) {
    const watchers = this.scopeWatchers.get(element) ?? [];
    watchers.push({ scope, kind, handler, ...key ? { key } : {} });
    this.scopeWatchers.set(element, watchers);
  }
  cleanupScopeWatchers(element) {
    const watchers = this.scopeWatchers.get(element);
    if (!watchers) {
      return;
    }
    for (const watcher of watchers) {
      if (watcher.kind === "any") {
        watcher.scope.offAny(watcher.handler);
        continue;
      }
      if (watcher.key) {
        watcher.scope.off(watcher.key, watcher.handler);
      }
    }
    this.scopeWatchers.delete(element);
  }
  cleanupBehaviorListeners(element) {
    const listenerMap = this.behaviorListeners.get(element);
    if (!listenerMap) {
      return;
    }
    for (const listeners of listenerMap.values()) {
      for (const listener of listeners) {
        listener.target.removeEventListener(listener.event, listener.handler, listener.options);
      }
    }
    listenerMap.clear();
    this.behaviorListeners.delete(element);
    this.behaviorBindings.delete(element);
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
  attachOnHandler(element, config) {
    const { listenerTarget, options, debounceMs } = this.getEventBindingConfig(
      element,
      config.flags,
      config.flagArgs
    );
    let effectiveHandler;
    const handler = async (event) => {
      if (!element.isConnected) {
        listenerTarget.removeEventListener(config.event, effectiveHandler, options);
        return;
      }
      const scope = this.getScope(element);
      if (!this.applyEventFlagBefore(element, scope, config.flags, config.flagArgs, event)) {
        return;
      }
      try {
        await this.execute(config.code, scope, element);
        this.evaluate(element);
      } catch (error) {
        this.emitError(element, error);
      } finally {
        this.applyEventFlagAfter(element, scope, config.flags, config.flagArgs, event);
      }
    };
    effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    listenerTarget.addEventListener(config.event, effectiveHandler, options);
  }
  attachBehaviorOnHandler(element, event, body, flags, flagArgs, args, behaviorId, rootScope) {
    if (event.includes(".")) {
      throw new Error("vsn:on does not support dot modifiers; use !flags instead");
    }
    const { listenerTarget, options, debounceMs } = this.getEventBindingConfig(element, flags, flagArgs);
    const handler = async (evt) => {
      const scope = this.getScope(element);
      if (!this.applyEventFlagBefore(element, scope, flags, flagArgs, evt)) {
        return;
      }
      const previousValues = /* @__PURE__ */ new Map();
      if (args && args.length > 0) {
        const argName = args[0];
        if (argName) {
          previousValues.set(argName, scope.getPath(argName));
          const [nextArg] = this.applyEventFlagArgTransforms(element, scope, flags, flagArgs, evt);
          scope.setPath(argName, nextArg);
        }
      }
      let failed = false;
      try {
        await this.executeBlock(body, scope, element, rootScope);
      } catch (error) {
        failed = true;
        this.emitError(element, error);
      } finally {
        for (const [name, value] of previousValues.entries()) {
          scope.setPath(name, value);
        }
        this.applyEventFlagAfter(element, scope, flags, flagArgs, evt);
      }
      if (!failed) {
        this.evaluate(element);
      }
    };
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    listenerTarget.addEventListener(event, effectiveHandler, options);
    const listenerMap = this.behaviorListeners.get(element) ?? /* @__PURE__ */ new Map();
    const listeners = listenerMap.get(behaviorId) ?? [];
    listeners.push({ target: listenerTarget, event, handler: effectiveHandler, options });
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
          this.handleHtmlBehaviors(target);
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
  getEventBindingConfig(element, flags, flagArgs) {
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
        rootScope: void 0,
        event: void 0,
        engine: this
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
  applyEventFlagBefore(element, scope, flags, flagArgs, event) {
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
        rootScope: void 0,
        event,
        engine: this
      });
      if (result === false) {
        return false;
      }
    }
    return true;
  }
  applyEventFlagAfter(element, scope, flags, flagArgs, event) {
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
        rootScope: void 0,
        event,
        engine: this
      });
    }
  }
  applyEventFlagArgTransforms(element, scope, flags, flagArgs, event) {
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
          rootScope: void 0,
          event,
          engine: this
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
  async withExecutionElement(element, fn) {
    if (!element) {
      await fn();
      return;
    }
    this.executionStack.push(element);
    try {
      await fn();
    } finally {
      this.executionStack.pop();
    }
  }
  getCurrentElement() {
    return this.executionStack[this.executionStack.length - 1];
  }
  async execute(code, scope, element, rootScope) {
    let block = this.codeCache.get(code);
    if (!block) {
      block = Parser.parseInline(code);
      this.codeCache.set(code, block);
    }
    await this.withExecutionElement(element, async () => {
      const context = {
        scope,
        rootScope,
        globals: this.globals,
        ...element ? { element } : {}
      };
      await block.evaluate(context);
    });
  }
  async executeBlock(block, scope, element, rootScope) {
    await this.withExecutionElement(element, async () => {
      const context = {
        scope,
        rootScope,
        globals: this.globals,
        ...element ? { element } : {}
      };
      await block.evaluate(context);
    });
  }
  async safeExecute(code, scope, element, rootScope) {
    try {
      await this.execute(code, scope, element, rootScope);
    } catch (error) {
      if (element) {
        this.emitError(element, error);
      }
    }
  }
  async safeExecuteBlock(block, scope, element, rootScope) {
    try {
      await this.executeBlock(block, scope, element, rootScope);
    } catch (error) {
      if (element) {
        this.emitError(element, error);
      }
    }
  }
  collectBehavior(behavior, parentSelector, rootSelectorOverride) {
    const selector = parentSelector ? `${parentSelector} ${behavior.selector.selectorText}` : behavior.selector.selectorText;
    const rootSelector = rootSelectorOverride ?? (parentSelector ?? behavior.selector.selectorText);
    const behaviorHash = this.hashBehavior(behavior);
    const hash = `${selector}::${rootSelector}::${behaviorHash}`;
    if (this.behaviorRegistryHashes.has(hash)) {
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
      ...parentSelector ? { parentSelector } : {}
    };
    this.behaviorRegistry.push(entry);
    this.behaviorRegistryHashes.add(hash);
    this.collectNestedBehaviors(behavior.body, selector, rootSelector);
  }
  collectNestedBehaviors(block, parentSelector, rootSelector) {
    for (const statement of block.statements) {
      if (statement instanceof BehaviorNode) {
        this.collectBehavior(statement, parentSelector, rootSelector);
        continue;
      }
      if (statement instanceof OnBlockNode) {
        this.collectNestedBehaviors(statement.body, parentSelector, rootSelector);
        continue;
      }
      if (statement instanceof BlockNode) {
        this.collectNestedBehaviors(statement, parentSelector, rootSelector);
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
  getBehaviorRootScope(element, behavior) {
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
  applyBehaviorFunctions(element, scope, functions, rootScope) {
    for (const declaration of functions) {
      this.applyBehaviorFunction(element, scope, declaration, rootScope);
    }
  }
  applyBehaviorFunction(element, scope, declaration, rootScope) {
    const existing = scope.getPath(declaration.name);
    if (existing !== void 0 && typeof existing !== "function") {
      throw new Error(`Cannot override non-function '${declaration.name}' with a function`);
    }
    const fn = async (...args) => {
      const callScope = scope.createChild ? scope.createChild() : scope;
      const context = {
        scope: callScope,
        rootScope: rootScope ?? callScope,
        globals: this.globals,
        element,
        returnValue: void 0,
        returning: false,
        breaking: false,
        continuing: false
      };
      const previousValues = /* @__PURE__ */ new Map();
      await this.applyFunctionParams(callScope, declaration.params, previousValues, context, args);
      await declaration.body.evaluate(context);
      if (callScope === scope) {
        this.restoreFunctionParams(callScope, declaration.params, previousValues);
      }
      return context.returnValue;
    };
    scope.setPath(declaration.name, fn);
  }
  async applyFunctionParams(scope, params, previousValues, context, args) {
    let argIndex = 0;
    for (const param of params) {
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
      if (value === void 0 && param.defaultValue) {
        value = await param.defaultValue.evaluate(context);
      }
      scope.setPath(`self.${name}`, value);
      argIndex += 1;
    }
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
  async applyBehaviorDeclarations(element, scope, declarations, rootScope) {
    for (const declaration of declarations) {
      await this.applyBehaviorDeclaration(element, scope, declaration, rootScope);
    }
  }
  async applyBehaviorDeclaration(element, scope, declaration, rootScope) {
    const context = { scope, rootScope, element };
    const operator = declaration.operator;
    const debounceMs = declaration.flags.debounce ? declaration.flagArgs.debounce ?? 200 : void 0;
    const transform = (value) => this.applyCustomFlagTransforms(value, element, scope, declaration);
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
      const transformed = this.applyCustomFlagTransforms(value, element, scope, declaration);
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
    const exprIdentifier = declaration.value instanceof IdentifierExpression ? declaration.value.name : void 0;
    if (operator === ":>") {
      if (exprIdentifier) {
        this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs, rootScope, transform);
      }
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }
    if (operator === ":=" && exprIdentifier) {
      this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs, rootScope, transform);
    }
    if (!exprIdentifier) {
      const value = await declaration.value.evaluate(context);
      const transformed = this.applyCustomFlagTransforms(value, element, scope, declaration);
      this.setDirectiveValue(element, target, transformed);
      const shouldWatch2 = operator === ":<" || operator === ":=";
      if (shouldWatch2) {
        this.applyDirectiveFromExpression(
          element,
          target,
          declaration.value,
          scope,
          debounceMs,
          rootScope
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
      rootScope
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
  applyCustomFlagTransforms(value, element, scope, declaration) {
    if (this.flagHandlers.size === 0) {
      return value;
    }
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
          declaration
        },
        nextValue
      );
    }
    return nextValue;
  }
  async applyBehaviorModifierHook(hook, behavior, element, scope, rootScope) {
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
        engine: this
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
  applyDirectiveFromScope(element, target, expr, scope, debounceMs, watch = true, rootScope) {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      const handler2 = () => {
        const useRoot = expr.startsWith("root.") && rootScope;
        const sourceScope = useRoot ? rootScope : scope;
        const localExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
        applyHtml(element, localExpr, sourceScope);
      };
      handler2();
      this.handleHtmlBehaviors(element);
      if (watch) {
        const useRoot = expr.startsWith("root.") && rootScope;
        const sourceScope = useRoot ? rootScope : scope;
        const watchExpr = useRoot ? expr.slice("root.".length) : expr;
        this.watchWithDebounce(sourceScope, watchExpr, handler2, debounceMs, element);
      }
      return;
    }
    const handler = () => {
      const useRoot = expr.startsWith("root.") && rootScope;
      const sourceScope = useRoot ? rootScope : scope;
      const localExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
      const value = sourceScope.get(localExpr);
      if (value == null) {
        return;
      }
      this.setDirectiveValue(element, target, value);
    };
    handler();
    if (watch) {
      const useRoot = expr.startsWith("root.") && rootScope;
      const sourceScope = useRoot ? rootScope : scope;
      const watchExpr = useRoot ? expr.slice("root.".length) : expr;
      this.watchWithDebounce(sourceScope, watchExpr, handler, debounceMs, element);
    }
  }
  applyDirectiveFromExpression(element, target, expr, scope, debounceMs, rootScope) {
    const handler = async () => {
      const context = { scope, rootScope, element };
      const value = await expr.evaluate(context);
      this.setDirectiveValue(element, target, value);
    };
    void handler();
    this.watchAllScopes(scope, () => {
      void handler();
    }, debounceMs, element);
  }
  applyDirectiveToScope(element, target, expr, scope, debounceMs, rootScope, transform) {
    const useRoot = expr.startsWith("root.") && rootScope;
    const targetScope = useRoot ? rootScope : scope;
    const targetExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
    if (target.kind === "attr" && target.name === "value") {
      this.applyValueBindingToScope(element, targetExpr, debounceMs, targetScope, transform);
      return;
    }
    if (target.kind === "attr" && target.name === "checked") {
      this.applyCheckedBindingToScope(element, targetExpr, debounceMs, targetScope, transform);
      return;
    }
    const value = this.getDirectiveValue(element, target);
    if (value != null) {
      const nextValue = transform ? transform(value) : value;
      targetScope.set(targetExpr, nextValue);
    }
  }
  applyCheckedBindingToScope(element, expr, debounceMs, scope, transform) {
    if (!(element instanceof HTMLInputElement)) {
      return;
    }
    const handler = () => {
      const targetScope = scope ?? this.getScope(element);
      const value = transform ? transform(element.checked) : element.checked;
      targetScope.set(expr, value);
    };
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    effectiveHandler();
    element.addEventListener("change", effectiveHandler);
    element.addEventListener("input", effectiveHandler);
  }
  applyValueBindingToScope(element, expr, debounceMs, scope, transform) {
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
    effectiveHandler();
    element.addEventListener("input", effectiveHandler);
    element.addEventListener("change", effectiveHandler);
  }
  setDirectiveValue(element, target, value) {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      const html = value == null ? "" : String(value);
      element.innerHTML = html;
      this.handleHtmlBehaviors(element);
      return;
    }
    if (target.kind === "attr") {
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
        this.htmlBindings.set(element, { expr: value });
        this.markInlineDeclaration(element, "attr:html");
        if (element instanceof HTMLElement) {
          applyHtml(element, value, scope);
          this.handleHtmlBehaviors(element);
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
      handle: (element, name) => {
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
if (typeof window !== "undefined") {
  window["parseCFS"] = parseCFS;
}
function autoMount(root = document) {
  if (typeof document === "undefined") {
    return null;
  }
  const engine = new Engine();
  globalThis.VSNEngine = engine;
  const startTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  const mount = () => {
    const target = root instanceof Document ? root.body : root;
    if (target) {
      const plugins = globalThis.VSNPlugins;
      if (plugins && typeof plugins === "object") {
        for (const plugin of Object.values(plugins)) {
          if (typeof plugin === "function") {
            plugin(engine);
          }
        }
      }
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
    document.addEventListener("DOMContentLoaded", () => setTimeout(mount, 0), { once: true });
  } else {
    setTimeout(mount, 0);
  }
  return engine;
}
if (typeof document !== "undefined") {
  const scriptTag = document.querySelector("script[auto-mount]");
  if (scriptTag) {
    autoMount();
  }
}
export {
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
  SelectorNode,
  SpreadElement,
  TemplateExpression,
  TernaryExpression,
  TokenType,
  TryNode,
  UnaryExpression,
  UseNode,
  VERSION,
  WhileNode,
  autoMount,
  parseCFS
};
//# sourceMappingURL=index.js.map