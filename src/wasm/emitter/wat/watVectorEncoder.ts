import { VectorEncoder } from "../types";

const enclose = (what: string): string => `(${what})`;

export const watSingleLineVectorEncoder = (): VectorEncoder<string, string> => (
  ...data: string[]
): string => enclose(data.join(" "));

export const watIdentedVectorEncoder = (identation: number): VectorEncoder<string, string> => (
  ...data: string[]
): string => {
  if (data.length === 1) return data[0];

  let header = "";
  let body = "";
  let footer = "";

  const whitespace = " ".repeat(identation);
  const nlWithWhitespace = `\n${whitespace}`;

  switch (data[0]) {
    case "module": {
      header = "(module" + nlWithWhitespace;
      footer = "\n)";
      body = data
        .slice(1)
        .map(x => x.replace(/\n/g, nlWithWhitespace))
        .join(nlWithWhitespace);
      break;
    }
    case "func": {
      const paramsAndResultData = data
        .slice(2)
        .filter(x => x.startsWith("(param ") || x.startsWith("(result "));
      const bodyData = data.slice(2 + paramsAndResultData.length);
      const hasBody = bodyData.length > 0;

      header = `(func ${data[1]} ${paramsAndResultData.join(" ")}`.trim();
      if (hasBody) {
        body = nlWithWhitespace + bodyData.join(nlWithWhitespace);
        footer = "\n)";
      } else {
        footer = ")";
      }
      break;
    }
    default: {
      header = "(";
      footer = ")";
      body = data.join(" ");
      break;
    }
  }

  return header + body + footer;
};
