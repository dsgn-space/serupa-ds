// Phone numbers without a metadata library: one row per country with its calling code, the trunk prefix people
// type at home (the "0" in 0812…), the usual grouping of a mobile number, and the national number's lengths.
// It formats and checks lengths; it doesn't tell a mobile number from a landline. No "use client": these
// helpers work on the server too.

/** One country PhoneInput knows: its ISO 3166 code, calling code, trunk prefix, grouping and national lengths. */
export interface PhoneCountry {
  /** ISO 3166-1 alpha-2, such as "ID". */
  code: string;
  /** The calling code without "+", such as "62". */
  dial: string;
  /** The prefix dialled at home and dropped after the calling code ("0" in most places, "8" in Russia, "" where there is none). */
  trunk: string;
  /** The grouping, with # for a digit, such as "###-####-####". Digits past the last # follow it without a space. */
  pattern: string;
  /** The shortest and longest national number, without the trunk prefix. */
  min: number;
  max: number;
}

// code, dial, trunk, pattern, min, max. Countries that share a calling code list the main one first: a pasted
// "+1…" picks US unless CA is the country already picked.
const ROWS = "US 1 - (###)_###-#### 10 10|CA 1 - (###)_###-#### 10 10|GB 44 0 ####_###### 10 10|IE 353 0 ##_###_#### 9 9" +
  "|AU 61 0 ###_###_### 9 9|NZ 64 0 ##_###_#### 8 10|DE 49 0 ###_######## 6 11|FR 33 0 #_##_##_##_## 9 9" +
  "|ES 34 - ###_##_##_## 9 9|IT 39 - ###_###_#### 6 11|NL 31 0 #_######## 9 9|BE 32 0 ###_##_##_## 8 9" +
  "|CH 41 0 ##_###_##_## 9 9|AT 43 0 ###_####### 4 13|SE 46 0 ##-###_##_## 7 10|NO 47 - ###_##_### 8 8" +
  "|DK 45 - ##_##_##_## 8 8|FI 358 0 ##_###_#### 5 12|PL 48 - ###_###_### 9 9|PT 351 - ###_###_### 9 9" +
  "|GR 30 - ###_###_#### 10 10|TR 90 0 ###_###_##_## 10 10|RU 7 8 ###_###-##-## 10 10|UA 380 0 ##_###_##_## 9 9" +
  "|IL 972 0 ##-###-#### 8 9|SA 966 0 ##_###_#### 9 9|AE 971 0 ##_###_#### 8 9|EG 20 0 ###_###_#### 9 10" +
  "|NG 234 0 ###_###_#### 10 10|KE 254 0 ###_###### 9 9|ZA 27 0 ##_###_#### 9 9|IN 91 0 #####_##### 10 10" +
  "|PK 92 0 ###_####### 10 10|BD 880 0 ####-###### 10 10|CN 86 0 ###_####_#### 11 11|HK 852 - ####_#### 8 8" +
  "|TW 886 0 ###_###_### 9 9|JP 81 0 ##-####-#### 9 10|KR 82 0 ##-####-#### 9 10|SG 65 - ####_#### 8 8" +
  "|MY 60 0 ##-###_#### 9 10|ID 62 0 ###-####-#### 9 12|PH 63 0 ###_###_#### 10 10|TH 66 0 ##_###_#### 8 9" +
  "|VN 84 0 ###_###_### 9 10|MX 52 - ##_####_#### 10 10|BR 55 0 ##_#####-#### 10 11|AR 54 0 ##_####-#### 10 10" +
  "|CL 56 - #_####_#### 9 9|CO 57 - ###_####### 10 10|PE 51 - ###_###_### 9 9";

/** Every country PhoneInput knows, in the order above (main country first for a shared calling code). */
export const PHONE_COUNTRIES: readonly PhoneCountry[] = ROWS.split("|").map(function (row) {
  const [code, dial, trunk, pattern, min, max] = row.split(" ");
  return { code, dial, trunk: trunk === "-" ? "" : trunk, pattern: pattern.replace(/_/g, " "), min: +min, max: +max };
});

const BY_CODE = new Map(PHONE_COUNTRIES.map((c) => [c.code, c]));
/** The country with this ISO code (any case), or undefined. */
export const phoneCountry = (code: string | undefined): PhoneCountry | undefined => (code ? BY_CODE.get(code.toUpperCase()) : undefined);

/** Groups the national digits by the country's pattern: "81234567890" in ID is "812-3456-7890". Partial numbers stop after their last digit. */
export function formatNational(digits: string, country: PhoneCountry): string {
  let out = "", i = 0;
  for (const ch of country.pattern) {
    if (i >= digits.length) break;
    out += ch === "#" ? digits[i++] : ch;
  }
  return out + digits.slice(i);
}

/** The result of reading an international number. */
export interface ParsedPhone {
  country: PhoneCountry;
  /** The national number, digits only, without the trunk prefix. */
  national: string;
}

/** Reads "+62 812-3456-7890" (or "0062…"): the country from its calling code (preferring `prefer` when it shares one) and the national digits. Undefined when no known calling code matches. */
export function parsePhone(value: string, prefer?: string): ParsedPhone | undefined {
  const digits = value.trim().replace(/^00/, "+").replace(/[^\d+]/g, "");
  if (digits[0] !== "+") return undefined;
  const rest = digits.slice(1).replace(/\D/g, "");
  let best: PhoneCountry | undefined;
  for (const c of PHONE_COUNTRIES) {
    if (!rest.startsWith(c.dial)) continue;
    // The longest calling code wins (+1 against +12…); among equals, the preferred country, then the first.
    if (!best || c.dial.length > best.dial.length || (c.dial === best.dial && c.code === prefer?.toUpperCase())) best = c;
  }
  if (!best) return undefined;
  return { country: best, national: stripTrunk(rest.slice(best.dial.length), best) };
}

/** The national digits with a typed trunk prefix taken off ("0812…" in ID becomes "812…"). */
export function stripTrunk(digits: string, country: PhoneCountry): string {
  return country.trunk && digits.startsWith(country.trunk) ? digits.slice(country.trunk.length) : digits;
}

/** The E.164 form, "+6281234567890", or "" with no digits. */
export const toE164 = (national: string, country: PhoneCountry): string => (national ? "+" + country.dial + national : "");

/** Whether the national number has a length the country uses. */
export const isPhoneComplete = (national: string, country: PhoneCountry): boolean => national.length >= country.min && national.length <= country.max;

/** Formats an E.164 number for reading: "+6281234567890" is "+62 812-3456-7890". A number with no known calling code comes back as it was. */
export function formatPhone(e164: string, prefer?: string): string {
  const p = parsePhone(e164, prefer);
  return p ? "+" + p.country.dial + " " + formatNational(p.national, p.country) : e164;
}
