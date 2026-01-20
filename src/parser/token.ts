export enum TokenType {
  Whitespace = "Whitespace",
  Identifier = "Identifier",
  Number = "Number",
  String = "String",
  Template = "Template",
  Boolean = "Boolean",
  Null = "Null",

  Behavior = "Behavior",
  Use = "Use",
  State = "State",
  On = "On",
  Construct = "Construct",
  Destruct = "Destruct",
  Return = "Return",
  If = "If",
  Else = "Else",
  For = "For",
  While = "While",
  Try = "Try",
  Catch = "Catch",
  Assert = "Assert",

  LBrace = "LBrace",
  RBrace = "RBrace",
  LParen = "LParen",
  RParen = "RParen",
  LBracket = "LBracket",
  RBracket = "RBracket",

  Colon = "Colon",
  Semicolon = "Semicolon",
  Comma = "Comma",

  Ellipsis = "Ellipsis",
  Dot = "Dot",
  Hash = "Hash",
  Greater = "Greater",
  Less = "Less",
  Plus = "Plus",
  Minus = "Minus",
  Tilde = "Tilde",
  Star = "Star",
  Slash = "Slash",
  Percent = "Percent",

  Equals = "Equals",
  Arrow = "Arrow",
  DoubleEquals = "DoubleEquals",
  TripleEquals = "TripleEquals",
  NotEquals = "NotEquals",
  StrictNotEquals = "StrictNotEquals",
  LessEqual = "LessEqual",
  GreaterEqual = "GreaterEqual",
  And = "And",
  Or = "Or",
  Pipe = "Pipe",
  NullishCoalesce = "NullishCoalesce",
  OptionalChain = "OptionalChain",
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
