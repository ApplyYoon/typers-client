// Korean syllable → jamo decomposition + 2-set keyboard mapping

const HANGUL_BASE = 0xAC00;

const CHOSEONG  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNGSEONG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONGSEONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

// 겹모음 → 단모음 분해 (ㅘ = ㅗ+ㅏ 등)
const JUNGSEONG_DECOMP: Record<string, [string, string]> = {
  'ㅘ':['ㅗ','ㅏ'], 'ㅙ':['ㅗ','ㅐ'], 'ㅚ':['ㅗ','ㅣ'],
  'ㅝ':['ㅜ','ㅓ'], 'ㅞ':['ㅜ','ㅔ'], 'ㅟ':['ㅜ','ㅣ'],
  'ㅢ':['ㅡ','ㅣ'],
};

// 겹받침 → 단자음 분해 (ㄳ = ㄱ+ㅅ 등)
const JONGSEONG_DECOMP: Record<string, [string, string]> = {
  'ㄳ':['ㄱ','ㅅ'], 'ㄵ':['ㄴ','ㅈ'], 'ㄶ':['ㄴ','ㅎ'],
  'ㄺ':['ㄹ','ㄱ'], 'ㄻ':['ㄹ','ㅁ'], 'ㄼ':['ㄹ','ㅂ'],
  'ㄽ':['ㄹ','ㅅ'], 'ㄾ':['ㄹ','ㅌ'], 'ㄿ':['ㄹ','ㅍ'],
  'ㅀ':['ㄹ','ㅎ'], 'ㅄ':['ㅂ','ㅅ'],
};

function syllableToJamos(char: string): string[] {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return [char]; // 한글 음절 아님 → 그대로

  const offset = code - HANGUL_BASE;
  const jongIdx = offset % 28;
  const jungIdx = Math.floor(offset / 28) % 21;
  const choIdx  = Math.floor(offset / 28 / 21);

  const cho  = CHOSEONG[choIdx];
  const jung = JUNGSEONG[jungIdx];
  const jong = JONGSEONG[jongIdx];

  const result: string[] = [cho];

  if (JUNGSEONG_DECOMP[jung]) {
    result.push(...JUNGSEONG_DECOMP[jung]);
  } else {
    result.push(jung);
  }

  if (jong) {
    if (JONGSEONG_DECOMP[jong]) {
      result.push(...JONGSEONG_DECOMP[jong]);
    } else {
      result.push(jong);
    }
  }

  return result;
}

export interface TextJamoInfo {
  jamoSequence: string[];                          // 전체 자모 배열
  syllableRanges: { start: number; end: number }[]; // 음절 i → jamoSequence의 [start, end)
}

export function decomposeText(text: string): TextJamoInfo {
  const jamoSequence: string[] = [];
  const syllableRanges: { start: number; end: number }[] = [];

  for (const char of text) {
    const start = jamoSequence.length;
    jamoSequence.push(...syllableToJamos(char));
    syllableRanges.push({ start, end: jamoSequence.length });
  }

  return { jamoSequence, syllableRanges };
}

// 두벌식 QWERTY → 한글 자모
export const KOREAN_KEY_TO_JAMO: Record<string, string> = {
  'r':'ㄱ', 'R':'ㄲ', 's':'ㄴ', 'e':'ㄷ', 'E':'ㄸ', 'f':'ㄹ',
  'a':'ㅁ', 'q':'ㅂ', 'Q':'ㅃ', 't':'ㅅ', 'T':'ㅆ', 'd':'ㅇ',
  'w':'ㅈ', 'W':'ㅉ', 'c':'ㅊ', 'z':'ㅋ', 'x':'ㅌ', 'v':'ㅍ', 'g':'ㅎ',
  'k':'ㅏ', 'o':'ㅐ', 'O':'ㅒ', 'i':'ㅑ', 'j':'ㅓ', 'p':'ㅔ', 'P':'ㅖ',
  'u':'ㅕ', 'h':'ㅗ', 'y':'ㅛ', 'n':'ㅜ', 'b':'ㅠ', 'm':'ㅡ', 'l':'ㅣ',
};

// e.code → QWERTY 기본 문자 (shift 무관)
export const CODE_TO_QWERTY: Record<string, string> = {
  'KeyA':'a','KeyB':'b','KeyC':'c','KeyD':'d','KeyE':'e',
  'KeyF':'f','KeyG':'g','KeyH':'h','KeyI':'i','KeyJ':'j',
  'KeyK':'k','KeyL':'l','KeyM':'m','KeyN':'n','KeyO':'o',
  'KeyP':'p','KeyQ':'q','KeyR':'r','KeyS':'s','KeyT':'t',
  'KeyU':'u','KeyV':'v','KeyW':'w','KeyX':'x','KeyY':'y',
  'KeyZ':'z','Space':' ',
};

export const isKoreanJamo = (c: string): boolean => {
  const code = c.charCodeAt(0);
  return code >= 0x3131 && code <= 0x3163;
};
