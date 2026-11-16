import { graphemes } from './graphemes';

// Scripts whose letters join to the next one: a cut between two of them would show both in their unjoined forms.
const JOINS = /[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Nko}\p{Script=Mongolian}\p{Script=Mandaic}\p{Script=Adlam}\p{Script=Hanifi_Rohingya}]/u;
const LETTER = /[\p{L}\p{M}]/u;

/** Where a name's end part starts, counted in characters people see (graphemes, `chars`): the last 6 before the
 *  extension (up to 10 of it) stay; in a joining script the cut moves back to the start of the word it would split.
 *  Shared by MiddleCutName (Attachment, FileUpload) and TruncatedText's mode="middle". */
export function middleCutAt(name: string, chars: string[]): number {
  const dot = name.lastIndexOf('.'), ext = dot > 0 ? graphemes(name.slice(dot)).length : 0;
  let at = Math.max(0, chars.length - Math.min(chars.length, Math.min(ext, 10) + 6));
  if (at > 0 && JOINS.test(chars[at - 1] ?? '') && JOINS.test(chars[at] ?? '')) {
    while (at > 0 && LETTER.test(chars[at - 1] ?? '')) at--;
  }
  return at;
}
