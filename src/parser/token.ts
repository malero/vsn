export enum TokenType {
  Whitespace = "Whitespace",
  Identifier = "Identifier",
  Number = "Number",
  String = "String",
  Boolean = "Boolean",
  Null = "Null",

  Behavior = "Behavior",
  Use = "Use",
  State = "State",
  On = "On",
  Construct = "Construct",
  Destruct = "Destruct",

  LBrace = "LBrace",
  RBrace = "RBrace",
  LParen = "LParen",
  RParen = "RParen",
  LBracket = "LBracket",
  RBracket = "RBracket",

  Colon = "Colon",
  Semicolon = "Semicolon",
  Comma = "Comma",

  Dot = "Dot",
  Hash = "Hash",
  Greater = "Greater",
  Less = "Less",
  Plus = "Plus",
  Minus = "Minus",
  Tilde = "Tilde",
  Star = "Star",

  Equals = "Equals",
  DoubleEquals = "DoubleEquals",
  NotEquals = "NotEquals",
  LessEqual = "LessEqual",
  GreaterEqual = "GreaterEqual",
  And = "And",
  Or = "Or",
  Bang = "Bang",

  At = "At",
  Dollar = "Dollar",
  Question = "Question"
}

export interface Position {
  index: number;
  line: number;
  column: number;
}

export interface Token {
  type: TokenType;
  value: string;
  start: Position;
  end: Position;
}
