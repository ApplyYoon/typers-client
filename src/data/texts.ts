export type Lang = 'ko' | 'en' | 'mixed';

export const TEXTS: Record<'ko' | 'en', string[]> = {
  ko: [
    '빠른 갈색 여우가 게으른 개를 뛰어 넘었습니다. 타이핑 연습을 매일 꾸준히 하면 실력이 빠르게 늘어납니다.',
    '오늘 하루도 열심히 타이핑 연습을 해서 손가락이 키보드 위에서 춤을 추는 날까지 포기하지 말고 계속 나아가 봅시다.',
    '포도알이 주렁주렁 열린 포도밭에서 포도 농부가 싱싱한 포도를 따며 즐거운 하루를 보내고 있습니다.',
    '하늘을 나는 새처럼 자유롭고 빠르게 타이핑하는 실력을 키우기 위해서는 꾸준한 연습만이 답입니다.',
    '세상에서 가장 빠른 타이피스트는 매일 꾸준히 연습한 결과로 그 자리에 오를 수 있었습니다.',
    '봄에는 꽃이 피고 여름에는 녹음이 우거지며 가을에는 단풍이 물들고 겨울에는 눈이 내립니다.',
    '컴퓨터 앞에 앉아 빠른 손가락으로 키보드를 두드리는 소리가 마치 음악처럼 들릴 때가 있습니다.',
    '열 손가락을 모두 활용하는 올바른 타이핑 자세를 익히면 속도와 정확도가 동시에 향상됩니다.',
  ],
  en: [
    'The quick brown fox jumps over the lazy dog. Practice typing every day to improve your speed and accuracy.',
    'To be or not to be that is the question whether tis nobler in the mind to suffer the slings and arrows.',
    'All that glitters is not gold often have you heard that told many a man his life hath sold.',
    'It was the best of times it was the worst of times it was the age of wisdom it was the age of foolishness.',
    'The only way to do great work is to love what you do if you have not found it yet keep looking.',
    'Two roads diverged in a wood and I took the one less traveled by and that has made all the difference.',
    'Ask not what your country can do for you ask what you can do for your country.',
    'In the beginning God created the heavens and the earth the earth was without form and void.',
  ],
};

export function getRandomText(lang: Lang): string {
  if (lang === 'mixed') {
    // 한글 70%, 영어 30%
    const pick = Math.random() < 0.7 ? 'ko' : 'en';
    const pool = TEXTS[pick];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const pool = TEXTS[lang];
  return pool[Math.floor(Math.random() * pool.length)];
}
