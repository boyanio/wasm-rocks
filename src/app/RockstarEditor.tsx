import { h, Component, createRef, Fragment } from "preact";
import CodeMirror from "codemirror";

const initialRockstar = `
Midnight takes your heart and your soul
While your heart is as high as your soul
Put your heart without your soul into your heart

Give back your heart

Desire is a lovestruck ladykiller
My world is nothing
Fire is ice
Hate is water
Until my world is Desire,
Build my world up
If Midnight taking my world, Fire is nothing and Midnight taking my world, Hate is nothing
Shout "FizzBuzz!"
Take it to the top

If Midnight taking my world, Fire is nothing
Shout "Fizz!"
Take it to the top

If Midnight taking my world, Hate is nothing
Shout "Buzz!"
Take it to the top

Whisper my world
`;

interface Props {
  onSourceChange: (source: string) => void;
}

export class RockstarEditor extends Component<Props> {
  editor: CodeMirror.Editor | null = null;
  textareRef = createRef();

  constructor(props: Props) {
    super(props);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  componentDidMount(): void {
    const inputArea = this.textareRef.current as HTMLTextAreaElement;
    this.editor = CodeMirror.fromTextArea(inputArea, {
      theme: "eclipse",
      lineNumbers: true,
      tabSize: 2,
      lineWrapping: true,
      autofocus: true
    });
    this.editor.setValue(initialRockstar.trim());

    this.editor.on("keyup", this.handleKeyUp);

    this.props.onSourceChange(initialRockstar.trim());
  }

  componentWillUnmount(): void {
    if (this.editor) this.editor.off("keyup", this.handleKeyUp);
  }

  handleKeyUp(editor: CodeMirror.Editor): void {
    const source = editor.getValue();
    this.props.onSourceChange(source);
  }

  render(): h.JSX.Element {
    return (
      <Fragment>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a className="nav-link active" href="#">
              Rockstar
            </a>
          </li>
        </ul>
        <textarea className="form-control" ref={this.textareRef}></textarea>
      </Fragment>
    );
  }
}
