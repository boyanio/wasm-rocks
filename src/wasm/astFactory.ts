import {
  ConstInstruction,
  BinaryOperationInstruction,
  BinaryOperation,
  UnaryOperation,
  UnaryOperationInstruction,
  VariableInstructionOperation,
  VariableInstruction,
  CallControlInstruction,
  Local
} from "./ast";
import { Identifier } from "src/rockstar/ast";

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

  variable: (index: number, operation: VariableInstructionOperation): VariableInstruction => ({
    instructionType: "variable",
    operation,
    index
  }),

  call: (id: Identifier): CallControlInstruction => ({
    instructionType: "call",
    id
  }),

  local: (): Local => ({
    valueType: "i32"
  })
};
