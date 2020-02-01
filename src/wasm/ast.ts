export type Comment = {
  instructionType: "comment";
  value: string;
};

export type Identifier = number | string;

export type ValueType = "f32" | "i32";

export type Param = {
  valueType: ValueType;
  id: Identifier;
};

export type FunctionType = {
  params: Param[];
  resultType?: ValueType;
};

export type Local = {
  id: Identifier;
  valueType: ValueType;
};

export type Function = {
  id: Identifier;
  functionType: FunctionType;
  locals: Local[];
  instructions: Instruction[];
};

export type VariableInstructionOperation = "local.get" | "local.set" | "local.tee";

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
  | "i32.div_s"
  | "i32.eq"
  | "i32.ne"
  | "i32.lt_s"
  | "i32.le_s"
  | "i32.gt_s"
  | "i32.ge_s"
  | "i32.and"
  | "i32.or"
  | "i32.xor";

export type BinaryOperationInstruction = {
  instructionType: "binaryOperation";
  operation: BinaryOperation;
};

export type UnaryOperation =
  | "f32.nearest"
  | "f32.ceil"
  | "f32.floor"
  | "f32.convert_i32_s"
  | "i32.trunc_f32_s"
  | "i32.eqz";

export type UnaryOperationInstruction = {
  instructionType: "unaryOperation";
  operation: UnaryOperation;
};

export type NumericInstruction =
  | ConstInstruction
  | BinaryOperationInstruction
  | UnaryOperationInstruction;

export type CallInstruction = {
  instructionType: "call";
  id: Identifier;
};

export type BlockInstruction = {
  instructionType: "block";
  resultType?: ValueType;
  instructions: Instruction[];
};

export type BreakInstruction = {
  instructionType: "br";
  labelIndex: number;
};

export type BreakIfInstruction = {
  instructionType: "br_if";
  labelIndex: number;
};

export type IfInstruction = {
  instructionType: "if";
  condition: Instruction[];
  then: Instruction[];
  $else?: Instruction[];
};

export type LoopInstruction = {
  instructionType: "loop";
  instructions: Instruction[];
};

export type ControlInstruction =
  | CallInstruction
  | BreakInstruction
  | BreakIfInstruction
  | BlockInstruction;

export type Instruction =
  | VariableInstruction
  | NumericInstruction
  | ControlInstruction
  | Comment
  | IfInstruction
  | LoopInstruction;

export type MemoryType = {
  minSize: number;
  maxSize?: number;
};

export type Memory = {
  id: Identifier;
  memoryType: MemoryType;
};

export type ExportType = "func" | "memory";

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

export type DataSegment = {
  offset: ConstInstruction;
  string: string;
};

export type Module = {
  functions: Function[];
  exports: Export[];
  imports: Import[];
  memories: Memory[];
  dataSegments: DataSegment[];
};
