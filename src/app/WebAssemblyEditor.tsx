import { h, Component, createRef, Fragment } from "preact";
import { rockstarToWat } from "../../src/compiler";
import { identedFormatter } from "../../src/wasm/emitter";
import CodeMirror from "codemirror";
import { initializeWabt, WabtWrapper } from "./WabtTool";

const watFormatter = identedFormatter(2);

const compileToWat = (rockstarSource: string): string => {
  let output: string;
  try {
    output = rockstarToWat(rockstarSource, watFormatter);
  } catch (err) {
    output = err.toString();
  }
  return output;
};

interface Props {
  rockstarSource: string | null;
}

interface State {
  wasmOutput: string | null;
  canCompileToWasm: boolean;
  activeTab: "wat" | "output";
}

export class WebAssemblyEditor extends Component<Props, State> {
  editor: CodeMirror.Editor | null = null;
  textareaRef = createRef();
  wabt: WabtWrapper | null = null;

  constructor(props: Props) {
    super(props);
    this.handleCompileToWasmClick = this.handleCompileToWasmClick.bind(this);
    this.state = { wasmOutput: null, canCompileToWasm: false, activeTab: "wat" };
  }

  componentDidMount(): void {
    const inputArea = this.textareaRef.current as HTMLTextAreaElement;
    this.editor = CodeMirror.fromTextArea(inputArea, {
      theme: "eclipse",
      lineNumbers: true,
      tabSize: 2,
      lineWrapping: true,
      readOnly: true
    });

    initializeWabt((value: string) => this.setState({ wasmOutput: value })).then(wabt => {
      this.setState({ canCompileToWasm: true });
      this.wabt = wabt;
    });
  }

  componentDidUpdate(): void {
    if (this.editor) this.editor.setValue(compileToWat(this.props.rockstarSource || ""));
  }

  handleCompileToWasmClick(): void {
    if (this.wabt && this.editor) {
      this.wabt.compileToWasm(this.editor.getValue());
      this.setState({ activeTab: "output" });
    }
  }

  render(): h.JSX.Element {
    const watTabClassName = "nav-link" + (this.state.activeTab === "wat" ? " active" : "");
    const outputTabClassName =
      "nav-link" +
      (this.state.activeTab === "output"
        ? " active"
        : this.state.canCompileToWasm
        ? ""
        : " disabled");

    return (
      <Fragment>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              className={watTabClassName}
              href="#"
              onClick={(): void => this.setState({ activeTab: "wat" })}
            >
              WebAssembly
            </a>
          </li>
          <li className="nav-item">
            <a
              className={outputTabClassName}
              href="#"
              onClick={(): void => this.setState({ activeTab: "output" })}
            >
              Output
            </a>
          </li>
        </ul>
        <div className={this.state.activeTab === "wat" ? "" : "d-none"}>
          <textarea className="form-control" readOnly={true} ref={this.textareaRef}></textarea>
          <p>
            <button
              type="button"
              className="btn btn-primary mt-1"
              disabled={!this.state.canCompileToWasm}
              onClick={this.handleCompileToWasmClick}
            >
              Compile &amp; run
            </button>
          </p>
        </div>
        <div className={this.state.activeTab === "output" ? "" : "d-none"}>
          <p
            className="wasm-output"
            dangerouslySetInnerHTML={{ __html: this.state.wasmOutput || "" }}
          ></p>
        </div>
      </Fragment>
    );
  }
}
