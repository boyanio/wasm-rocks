import { WatVectorEncoder } from "../types";

const enclose = (what: string): string => `(${what})`;

const filterData = (data: (string | number | undefined)[]): string[] =>
  data.reduce<string[]>(
    (result, item) => (item != null ? [...result, item.toString()] : result),
    []
  );

export const watSingleLineVectorEncoder = (): WatVectorEncoder => (
  ...data: (string | number | undefined)[]
): string => enclose(filterData(data).join(" "));

export const watIdentedVectorEncoder = (identation: number): WatVectorEncoder => (
  ...data: (string | number | undefined)[]
): string => {
  const filteredData = filterData(data);

  if (filteredData.length === 1) return filteredData[0];

  let header = "";
  let body = "";
  let footer = "";

  const whitespace = " ".repeat(identation);
  const nlWithWhitespace = `\n${whitespace}`;

  switch (filteredData[0]) {
    case "module": {
      header = "(module" + nlWithWhitespace;
      footer = "\n)";
      body = filteredData
        .slice(1)
        .map(x => x.replace(/\n/g, nlWithWhitespace))
        .join(nlWithWhitespace);
      break;
    }
    case "func": {
      const paramsAndResultData = filteredData
        .slice(2)
        .filter(x => x.startsWith("(param ") || x.startsWith("(result "));
      const bodyData = filteredData.slice(2 + paramsAndResultData.length);
      const hasBody = bodyData.length > 0;

      header = `(func ${filteredData[1]} ${paramsAndResultData.join(" ")}`.trim();
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
      body = filteredData.join(" ");
      break;
    }
  }

  return header + body + footer;
};
