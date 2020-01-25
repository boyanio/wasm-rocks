import {
  ConstInstruction,
  BinaryOperationInstruction,
  BinaryOperation,
  UnaryOperation,
  UnaryOperationInstruction,
  VariableInstructionOperation,
  VariableInstruction,
  CallInstruction,
  Local,
  Identifier,
  Param,
  ValueType,
  Comment,
  IfInstruction,
  Instruction,
  BreakInstruction,
  BreakIfInstruction
} from "./ast";

export const astFactory = {
  const: (valueType: ValueType, value: number): ConstInstruction => ({
    instructionType: "const",
    value,
    valueType
  }),

  binaryOperation: (operation: BinaryOperation): BinaryOperationInstruction => ({
    instructionType: "binaryOperation",
    operation
  }),

  unaryOperation: (operation: UnaryOperation): UnaryOperationInstruction => ({
    instructionType: "unaryOperation",
    operation
  }),

  variable: (id: Identifier, operation: VariableInstructionOperation): VariableInstruction => ({
    instructionType: "variable",
    operation,
    id
  }),

  call: (id: Identifier): CallInstruction => ({
    instructionType: "call",
    id
  }),

  local: (valueType: ValueType, id?: Identifier): Local => ({
    valueType,
    id
  }),

  param: (valueType: ValueType, id?: Identifier): Param => ({
    valueType,
    id
  }),

  comment: (value: string): Comment => ({
    instructionType: "comment",
    value
  }),

  if: (condition: Instruction[], then: Instruction[], $else?: Instruction[]): IfInstruction => ({
    instructionType: "if",
    condition,
    then,
    $else
  }),

  break: (labelIndex?: number): BreakInstruction => ({
    instructionType: "br",
    labelIndex
  }),

  breakIf: (labelIndex?: number): BreakIfInstruction => ({
    instructionType: "br_if",
    labelIndex
  })
};
