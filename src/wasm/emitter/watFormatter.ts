export type WatFormatter = (header: string, body?: string[]) => string;

const enclose = (what: string): string => `(${what})`;

export const noFormat = (): WatFormatter => (header: string, body?: string[]): string =>
  enclose([header, ...(body || [])].join(" "));

export const withIdentation = (identation: number): WatFormatter => (
  header: string,
  body?: string[]
): string => {
  const whitespace = " ".repeat(identation);
  const nlWithWhitespace = `\n${whitespace}`;
  const finalNL = body && body.length > 0 ? `\n` : "";
  return enclose(
    `${[header, ...(body || [])]
      .map(x => x.replace(/\n/g, nlWithWhitespace))
      .join(nlWithWhitespace)}`.trim() + finalNL
  );
};
