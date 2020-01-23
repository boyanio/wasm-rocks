export type WatFormatter = (data: unknown[]) => string;

// remove null / undefined / empty array items
const filter = (data: unknown[]): unknown[] =>
  data.reduce<unknown[]>((filtered, item) => {
    if (Array.isArray(item)) {
      const filteredItem = filter(item);
      return filteredItem.length ? [...filtered, filteredItem] : filtered;
    } else {
      const isValid = item != null;
      return isValid ? [...filtered, item] : filtered;
    }
  }, []);

const formatFilteredDataAsSingleLine = (data: unknown[]): string => {
  if (data.length === 1) return data[0] as string;

  const firstArrayItemIndex = data.findIndex(Array.isArray);
  const arrayItems = (firstArrayItemIndex < 0
    ? []
    : data.splice(firstArrayItemIndex)) as unknown[][];
  const nonArrayItems = data;

  return (
    `(${nonArrayItems.join(" ")}` +
    (arrayItems.length ? " " + arrayItems.map(formatFilteredDataAsSingleLine).join(" ") : "") +
    ")"
  );
};

const formatFilteredDataWithIdentation = (
  data: unknown[],
  scope: number,
  identation: number
): string => {
  const whitespace = " ".repeat(identation * scope);
  if (data.length === 1) return (scope > 0 ? "\n" : "") + `${whitespace}(${data[0]})`;

  const firstItem = data[0] as string;

  // param / result vectors should be on the same line with the func
  if (["param", "result"].includes(firstItem)) return " " + formatFilteredDataAsSingleLine(data);

  // import / export vectors should be on the same line
  if (["import", "export"].includes(firstItem))
    return "\n" + whitespace + formatFilteredDataAsSingleLine(data);

  let result = "";
  if (scope > 0) {
    result += "\n";
  }
  result += whitespace;

  let i = 0;
  for (; i < data.length; i++) {
    if (Array.isArray(data[i])) break;

    result += (i === 0 ? "(" : " ") + data[i];
  }

  if (i < data.length) {
    for (; i < data.length; i++) {
      result += formatFilteredDataWithIdentation(data[i] as unknown[], scope + 1, identation);
    }
    result += "\n" + whitespace;
  }
  result += ")";
  return result;
};

export const singleLineFormatter = (data: unknown[]): string =>
  formatFilteredDataAsSingleLine(filter(data));

export const identedFormatter = (identation: number): WatFormatter => (data: unknown[]): string =>
  formatFilteredDataWithIdentation(filter(data), 0, identation);
