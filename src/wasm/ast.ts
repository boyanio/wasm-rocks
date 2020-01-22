export type Comment = {
  instructionType: "comment";
  value: string;
};

export type Identifier = number | string;

export type ValueType = "f32" | "i32";

export type ResultType = "f32" | "i32" | null;

export type Param = {
  valueType: ValueType;
  id?: Identifier;
};

export type FunctionType = {
  params: Param[];
  result?: ResultType;
};

export type Local = {
  id?: Identifier;
  valueType: ValueType;
};

export type Function = {
  id: Identifier;
  functionType: FunctionType;
  locals: Local[];
  instructions: Instruction[];
};

export type VariableInstructionOperation = "get" | "set" | "tee";

export type VariableInstruction = {
  instructionType: "variable";
  operation: VariableInstructionOperation;
  id: Identifier;
};

export type ConstInstruction = {
  instructionType: "const";
  value: number;
  valueType: ValueType;
};

export type BinaryOperation =
  | "i32.add"
  | "i32.mul"
  | "i32.sub"
  | "i32.div"
  | "i32.eq"
  | "i32.ne"
  | "i32.lt_s"
  | "i32.le_s"
  | "i32.gt_s"
  | "i32.ge_s";

export type BinaryOperationInstruction = {
  instructionType: "binaryOperation";
  operation: BinaryOperation;
};

export type UnaryOperation =
  | "f32.nearest"
  | "f32.ceil"
  | "f32.floor"
  | "f32.convert_i32_s"
  | "i32.trunc_f32_s";

export type UnaryOperationInstruction = {
  instructionType: "unaryOperation";
  operation: UnaryOperation;
};

export type NumericInstruction =
  | ConstInstruction
  | BinaryOperationInstruction
  | UnaryOperationInstruction;

export type CallControlInstruction = {
  instructionType: "call";
  id: Identifier;
};

export type IfInstruction = {
  instructionType: "if";
  then: Instruction[];
  $else?: Instruction[];
};

export type ControlInstruction = CallControlInstruction;

export type Instruction =
  | VariableInstruction
  | NumericInstruction
  | ControlInstruction
  | Comment
  | IfInstruction;

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
  functions: Function[];
  exports: Export[];
  imports: Import[];
  memories: Memory[];
};
