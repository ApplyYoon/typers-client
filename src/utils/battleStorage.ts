import type { Lang } from '../data/texts';

export interface BattleRecord {
  schoolId: string;
  username: string;
  score: number; // 타/분 for ko, WPM for en
  accuracy: number;
  lang: Lang;
  timestamp: number;
}

export interface SchoolStat {
  schoolId: string;
  avgScore: number;
  topScore: number;
  count: number;
}

const KEY = 'typers_battle_records';

export function saveRecord(record: BattleRecord): void {
  const records = getRecords();
  records.push(record);
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function getRecords(): BattleRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function getSchoolStats(lang: Lang): SchoolStat[] {
  const records = getRecords().filter((r) => r.lang === lang);
  const map = new Map<string, number[]>();

  for (const r of records) {
    if (!map.has(r.schoolId)) map.set(r.schoolId, []);
    map.get(r.schoolId)!.push(r.score);
  }

  return Array.from(map.entries())
    .map(([schoolId, scores]) => ({
      schoolId,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      topScore: Math.max(...scores),
      count: scores.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

export function seedDemoData(): void {
  if (getRecords().length > 0) return;

  const schoolIds = ['snu', 'yonsei', 'korea', 'sogang', 'hanyang', 'hongik'];
  const langs: Lang[] = ['ko', 'en'];
  const records: BattleRecord[] = [];

  for (const schoolId of schoolIds) {
    for (const lang of langs) {
      const base = lang === 'ko'
        ? 300 + Math.floor(Math.random() * 300)
        : 60 + Math.floor(Math.random() * 60);
      for (let i = 0; i < 3 + Math.floor(Math.random() * 5); i++) {
        records.push({
          schoolId,
          username: `user_${Math.random().toString(36).slice(2, 6)}`,
          score: base + Math.floor(Math.random() * 100) - 50,
          accuracy: 85 + Math.floor(Math.random() * 15),
          lang,
          timestamp: Date.now() - Math.floor(Math.random() * 86400000),
        });
      }
    }
  }

  localStorage.setItem(KEY, JSON.stringify(records));
}
