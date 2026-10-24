// Text folded for matching what people type against labels: case, accents and width ignored, so "lodz" finds "Łódź",
// "strasse" finds "Straße", "ｔｏｋｙｏ" finds "Tokyo" and "トウキョウ" finds "ﾄｳｷｮｳ". NFKD splits accents off
// and maps full- and half-width forms to the usual ones; a few letters don't decompose and get a table.
const LETTERS: Record<string, string> = { "ł": "l", "đ": "d", "ð": "d", "ø": "o", "æ": "ae", "œ": "oe", "ß": "ss", "ħ": "h", "ı": "i", "þ": "th", "ŧ": "t", "ŋ": "n", "ĸ": "k" };

/** Lowercased, without accents or width differences, with ł→l, ø→o, æ→ae, ß→ss and the like. */
export function fold(s: string): string {
  return s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[łđðøæœßħıþŧŋĸ]/g, (c) => LETTERS[c]);
}
