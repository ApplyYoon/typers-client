const NEIS_BASE = 'https://open.neis.go.kr/hub/schoolInfo';

export type SchoolType = '초등학교' | '중학교' | '고등학교' | '대학교';

export const SCHOOL_TYPES: SchoolType[] = ['초등학교', '중학교', '고등학교', '대학교'];

export interface NeisSchool {
  SCHUL_NM: string;        // 학교명
  SD_SCHUL_CODE: string;   // 학교코드
  SCHUL_KND_SC_NM: string; // 학교종류
  LCTN_SC_NM: string;      // 소재지명 (서울특별시 등)
  ORG_RDNMA: string;       // 도로명주소
}

export async function searchSchools(
  name: string,
  type: SchoolType,
): Promise<NeisSchool[]> {
  if (!name.trim()) return [];

  const params = new URLSearchParams({
    Type: 'json',
    pIndex: '1',
    pSize: '20',
    SCHUL_NM: name.trim(),
    SCHUL_KND_SC_NM: type,
  });

  try {
    const res = await fetch(`${NEIS_BASE}?${params}`);
    const data = await res.json();
    // 결과 없을 때 NEIS는 { RESULT: { CODE, MESSAGE } } 반환
    if (data.RESULT) return [];
    return (data.schoolInfo?.[1]?.row ?? []) as NeisSchool[];
  } catch {
    return [];
  }
}

/** 학교코드 → 결정적 색상 (같은 학교는 항상 같은 색) */
const PALETTE = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#0891b2', '#9333ea',
  '#16a34a', '#ea580c', '#0284c7', '#be185d',
];

export function schoolColor(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
