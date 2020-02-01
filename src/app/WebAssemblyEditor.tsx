import { h, Component, createRef, Fragment } from "preact";
import { rockstarToWat, rockstarToWasm } from "../../src/compiler";
import { identedFormatter } from "../../src/wasm/emitter";
import CodeMirror from "codemirror";
import { initWebAssembly } from "./initWebAssembly";

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

const toHex = (num: number): string => {
  let str = num.toString(16);
  if (str.length === 1) str = "0" + str;
  return str;
};

interface Props {
  rockstarSource: string;
}

type Tab = "wat" | "wasm" | "output";

interface State {
  wasmOutput: string;
  activeTab: Tab;
}

export class WebAssemblyEditor extends Component<Props, State> {
  watEditor: CodeMirror.Editor | null = null;
  wasmEditor: CodeMirror.Editor | null = null;
  watTextareaRef = createRef();
  wasmTextareaRef = createRef();

  constructor(props: Props) {
    super(props);
    this.handleCompileToWasmClick = this.handleCompileToWasmClick.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.state = { wasmOutput: "", activeTab: "wat" };
  }

  componentDidMount(): void {
    const editorOptions: CodeMirror.EditorConfiguration = {
      theme: "eclipse",
      lineNumbers: true,
      tabSize: 2,
      lineWrapping: true,
      readOnly: true
    };

    this.watEditor = CodeMirror.fromTextArea(
      this.watTextareaRef.current as HTMLTextAreaElement,
      editorOptions
    );

    this.wasmEditor = CodeMirror.fromTextArea(
      this.wasmTextareaRef.current as HTMLTextAreaElement,
      editorOptions
    );
  }

  componentDidUpdate(): void {
    if (this.watEditor) {
      this.watEditor.setValue(compileToWat(this.props.rockstarSource));
    }

    if (this.wasmEditor) {
      this.wasmEditor.setValue(
        [...rockstarToWasm(this.props.rockstarSource).values()].map(toHex).join("\n")
      );
    }
  }

  handleCompileToWasmClick(): void {
    if (this.watEditor) {
      const buffer = rockstarToWasm(this.props.rockstarSource);

      initWebAssembly(buffer, (value: string) => this.setState({ wasmOutput: value })).then(() =>
        this.setState({ activeTab: "output" })
      );
    }
  }

  handleTabClick(e: Event, activeTab: Tab): void {
    e.preventDefault();
    this.setState({ activeTab });
  }

  render(): h.JSX.Element {
    const tabClassName = (tab: Tab): string =>
      "nav-link" + (this.state.activeTab === tab ? " active" : "");

    return (
      <Fragment>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              className={tabClassName("wat")}
              href="#"
              onClick={(e): void => this.handleTabClick(e, "wat")}
            >
              WebAssembly (text)
            </a>
          </li>
          <li className="nav-item">
            <a
              className={tabClassName("wasm")}
              href="#"
              onClick={(e): void => this.handleTabClick(e, "wasm")}
            >
              WebAssembly (binary)
            </a>
          </li>
          <li className="nav-item">
            <a
              className={tabClassName("output")}
              href="#"
              onClick={(e): void => this.handleTabClick(e, "output")}
            >
              Output
            </a>
          </li>
        </ul>
        <div className={this.state.activeTab === "wat" ? "" : "d-none"}>
          <textarea className="form-control" readOnly={true} ref={this.watTextareaRef}></textarea>
        </div>
        <div className={this.state.activeTab === "wasm" ? "" : "d-none"}>
          <textarea className="form-control" readOnly={true} ref={this.wasmTextareaRef}></textarea>
        </div>
        <div className={this.state.activeTab === "output" ? "" : "d-none"}>
          <p
            className="wasm-output"
            dangerouslySetInnerHTML={{ __html: this.state.wasmOutput || "" }}
          ></p>
        </div>
        <p className={this.state.activeTab !== "output" ? "" : "d-none"}>
          <button
            type="button"
            className="btn btn-primary mt-2"
            onClick={this.handleCompileToWasmClick}
          >
            Compile &amp; run
          </button>
        </p>
      </Fragment>
    );
  }
}
