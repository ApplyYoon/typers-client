export interface BattleRecord {
  schoolId: string;    // NEIS 학교코드
  schoolName: string;  // 학교명
  username: string;
  score: number;       // CPM
  accuracy: number;
  timestamp: number;
}

export interface SchoolStat {
  schoolId: string;
  schoolName: string;
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

export function getSchoolStats(): SchoolStat[] {
  const records = getRecords();
  const map = new Map<string, { scores: number[]; name: string }>();

  for (const r of records) {
    if (!map.has(r.schoolId)) map.set(r.schoolId, { scores: [], name: r.schoolName });
    map.get(r.schoolId)!.scores.push(r.score);
  }

  return Array.from(map.entries())
    .map(([schoolId, { scores, name }]) => ({
      schoolId,
      schoolName: name,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      topScore: Math.max(...scores),
      count: scores.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

export function clearRecords(): void {
  localStorage.removeItem(KEY);
}
