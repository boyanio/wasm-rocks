export type Comment = {
  instructionType: "comment";
  value: string;
};

export type Identifier = string;

export type ValueType = "f32" | "i32";

export type ResultType = "f32" | "i32" | null;

export type FunctionType = {
  params?: ValueType[];
  result?: ResultType;
};

export type Local = {
  index: number;
  localType: ValueType;
};

export type Function = {
  id: Identifier;
  functionType?: FunctionType;
  locals?: Local[];
  instructions?: Instruction[];
};

export type VariableInstruction = {
  instructionType: "variable";
  operation: "set" | "get" | "tee";
  index: number;
};

export type ConstInstruction = {
  instructionType: "const";
  value: number;
  valueType: ValueType;
};

export type BinaryOperationInstruction = {
  instructionType: "binaryOperation";
  operation: "f32.add" | "f32.mul";
};

export type UnaryOperationInstruction = {
  instructionType: "unaryOperation";
  operation: "f32.nearest";
};

export type NumericInstruction =
  | ConstInstruction
  | BinaryOperationInstruction
  | UnaryOperationInstruction;

export type CallControlInstruction = {
  instructionType: "call";
  id: Identifier;
};

export type ControlInstruction = CallControlInstruction;

export type Instruction = VariableInstruction | NumericInstruction | ControlInstruction | Comment;

export type MemoryType = {
  minSize: number;
  maxSize?: number;
};

export type Memory = {
  id: Identifier;
  memoryType: MemoryType;
};

export type ExportType = "func" | "table" | "memory" | "global";

export type Export = {
  name: string;
  exportType: ExportType;
  id: Identifier;
};

export type FunctionImportType = {
  name: "func";
  id: Identifier;
  functionType: FunctionType;
};

export type MemoryImportType = {
  name: "memory";
  id: Identifier;
  memoryType: MemoryType;
};

export type ImportType = FunctionImportType | MemoryImportType;

export type Import = {
  module: string;
  name: string;
  importType: ImportType;
};

export type Module = {
  functions?: Function[];
  exports?: Export[];
  imports?: Import[];
  memories?: Memory[];
};
