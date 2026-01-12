// src/parser/token.ts
var TokenType = /* @__PURE__ */ ((TokenType2) => {
  TokenType2["Whitespace"] = "Whitespace";
  TokenType2["Identifier"] = "Identifier";
  TokenType2["Number"] = "Number";
  TokenType2["String"] = "String";
  TokenType2["Boolean"] = "Boolean";
  TokenType2["Null"] = "Null";
  TokenType2["Behavior"] = "Behavior";
  TokenType2["State"] = "State";
  TokenType2["On"] = "On";
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
  TokenType2["Tilde"] = "Tilde";
  TokenType2["Star"] = "Star";
  TokenType2["Equals"] = "Equals";
  TokenType2["Bang"] = "Bang";
  TokenType2["At"] = "At";
  TokenType2["Dollar"] = "Dollar";
  TokenType2["Question"] = "Question";
  return TokenType2;
})(TokenType || {});

// src/parser/lexer.ts
var KEYWORDS = {
  behavior: "Behavior" /* Behavior */,
  state: "State" /* State */,
  on: "On" /* On */,
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
  constructor(behaviors) {
    super("Program");
    this.behaviors = behaviors;
  }
};
var BlockNode = class extends BaseNode {
  constructor(statements) {
    super("Block");
    this.statements = statements;
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
};
var IdentifierExpression = class extends BaseNode {
  constructor(name) {
    super("Identifier");
    this.name = name;
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
};
var DirectiveExpression = class extends BaseNode {
  constructor(kind, name) {
    super("Directive");
    this.kind = kind;
    this.name = name;
  }
};
var QueryExpression = class extends BaseNode {
  constructor(direction, selector) {
    super("Query");
    this.direction = direction;
    this.selector = selector;
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
};

// src/parser/parser.ts
var Parser = class {
  stream;
  constructor(input) {
    const lexer = new Lexer(input);
    this.stream = new TokenStream(lexer.tokenize());
  }
  parseProgram() {
    const behaviors = [];
    this.stream.skipWhitespace();
    while (!this.stream.eof()) {
      behaviors.push(this.parseBehavior());
      this.stream.skipWhitespace();
    }
    return new ProgramNode(behaviors);
  }
  parseBehavior() {
    this.stream.skipWhitespace();
    this.stream.expect("Behavior" /* Behavior */);
    const selector = this.parseSelector();
    const body = this.parseBlock();
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
  parseBlock() {
    this.stream.skipWhitespace();
    this.stream.expect("LBrace" /* LBrace */);
    const statements = [];
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
      statements.push(this.parseStatement());
    }
    return new BlockNode(statements);
  }
  parseStatement() {
    this.stream.skipWhitespace();
    const next = this.stream.peek();
    if (!next) {
      throw new Error("Unexpected end of input");
    }
    if (next.type === "State" /* State */) {
      return this.parseStateBlock();
    }
    if (next.type === "On" /* On */) {
      return this.parseOnBlock();
    }
    if (next.type === "Behavior" /* Behavior */) {
      return this.parseBehavior();
    }
    if (next.type === "Identifier" /* Identifier */ && this.stream.peek(1)?.type === "Equals" /* Equals */) {
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
    const body = this.parseBlock();
    return new OnBlockNode(event.value, args, body);
  }
  parseAssignment() {
    const target = this.stream.expect("Identifier" /* Identifier */);
    this.stream.skipWhitespace();
    this.stream.expect("Equals" /* Equals */);
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect("Semicolon" /* Semicolon */);
    return new AssignmentNode(target.value, value);
  }
  parseExpression() {
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Expected expression");
    }
    if (token.type === "Bang" /* Bang */) {
      this.stream.next();
      const argument = this.parseExpression();
      return new UnaryExpression("!", argument);
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
    if (token.type === "Identifier" /* Identifier */) {
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
};

// src/index.ts
var VERSION = "0.1.0";
function parseCFS(source) {
  const parser = new Parser(source);
  return parser.parseProgram();
}
export {
  AssignmentNode,
  BaseNode,
  BehaviorNode,
  BlockNode,
  DirectiveExpression,
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
  VERSION,
  parseCFS
};
//# sourceMappingURL=index.js.map