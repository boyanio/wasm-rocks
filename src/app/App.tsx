import { h, Component } from "preact";
import { RockstarEditor } from "./RockstarEditor";
import { WebAssemblyEditor } from "./WebAssemblyEditor";

interface State {
  rockstarSource: string;
}

export class App extends Component<{}, State> {
  constructor() {
    super();
    this.handleSourceChange = this.handleSourceChange.bind(this);
    this.state = { rockstarSource: "" };
  }

  handleSourceChange(source: string): void {
    this.setState({ rockstarSource: source });
  }

  render(): h.JSX.Element {
    return (
      <div className="row">
        <div className="col-xl-6">
          <RockstarEditor onSourceChange={this.handleSourceChange} />
        </div>

        <div className="col-xl-6">
          <WebAssemblyEditor rockstarSource={this.state.rockstarSource} />
        </div>
      </div>
    );
  }
}
