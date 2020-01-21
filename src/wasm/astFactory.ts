import {
  ConstInstruction,
  BinaryOperationInstruction,
  BinaryOperation,
  UnaryOperation,
  UnaryOperationInstruction,
  VariableInstructionOperation,
  VariableInstruction,
  CallControlInstruction,
  Local,
  Identifier,
  Param
} from "./ast";

export const astFactory = {
  const: (value: number): ConstInstruction => ({
    instructionType: "const",
    value,
    valueType: "i32"
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

  call: (id: Identifier): CallControlInstruction => ({
    instructionType: "call",
    id
  }),

  local: (id: Identifier): Local => ({
    valueType: "i32",
    id
  }),

  param: (id: Identifier): Param => ({
    valueType: "i32",
    id
  })
};
