import { withIdentation } from "./wasm/emitter";
import { toWat } from "./transpiler";
import CodeMirror from "codemirror";

(function init(): void {
  const initialRockstar = `
My desire is a lovestruck ladykiller
Whisper my desire
`;

  const watFormatter = withIdentation(2);

  const editorOptions: CodeMirror.EditorConfiguration = {
    theme: "eclipse",
    lineNumbers: true,
    tabSize: 2,
    lineWrapping: true
  };

  const outputArea = document.getElementById("emitted-wat") as HTMLTextAreaElement;
  const outputEditor = CodeMirror.fromTextArea(outputArea, {
    ...editorOptions,
    readOnly: true
  });

  const inputArea = document.getElementById("rockstar-source") as HTMLTextAreaElement;
  const inputEditor = CodeMirror.fromTextArea(inputArea, {
    ...editorOptions,
    autofocus: true
  });

  inputEditor.on("keyup", () => {
    const source = inputEditor.getValue();
    let output: string;
    try {
      output = toWat(source, watFormatter);
    } catch (err) {
      output = err.toString();
    }
    outputEditor.setValue(output);
  });

  inputEditor.setValue(initialRockstar.trim());
})();
