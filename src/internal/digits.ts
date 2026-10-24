// Digits people type in other scripts, read as ASCII so Number() and the date and time parsers understand them.

/** Any decimal digits (Arabic-Indic ٢٢, Persian ۲۲, Bengali ২২, Thai ๒๒, full-width ２２) as ASCII. */
export function latinDigits(text: string): string {
  return text.replace(/\p{Nd}/gu, (c) => {
    const cp = c.codePointAt(0)!;
    if (cp < 128) return c;
    let zero = cp;
    while (/\p{Nd}/u.test(String.fromCodePoint(zero - 1))) zero--;
    return String((cp - zero) % 10);
  });
}
