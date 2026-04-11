const NEIS_BASE = 'https://open.neis.go.kr/hub/schoolInfo';

export type SchoolType = '초등학교' | '중학교' | '고등학교' | '대학교';

export const SCHOOL_TYPES: SchoolType[] = ['초등학교', '중학교', '고등학교', '대학교'];

export interface NeisSchool {
  SCHUL_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_KND_SC_NM: string;
  LCTN_SC_NM: string;
  ORG_RDNMA: string;
}

// NEIS API는 대학교 미포함 → 정적 목록으로 클라이언트 검색
const UNIVERSITIES: NeisSchool[] = [
  { SCHUL_NM: '서울대학교',        SD_SCHUL_CODE: 'univ_snu',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '연세대학교',        SD_SCHUL_CODE: 'univ_yonsei', SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '고려대학교',        SD_SCHUL_CODE: 'univ_korea',  SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '성균관대학교',      SD_SCHUL_CODE: 'univ_skku',   SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '한양대학교',        SD_SCHUL_CODE: 'univ_hanyang',SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '서강대학교',        SD_SCHUL_CODE: 'univ_sogang', SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '중앙대학교',        SD_SCHUL_CODE: 'univ_cau',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '이화여자대학교',    SD_SCHUL_CODE: 'univ_ewha',   SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '홍익대학교',        SD_SCHUL_CODE: 'univ_hongik', SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '건국대학교',        SD_SCHUL_CODE: 'univ_konkuk', SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '동국대학교',        SD_SCHUL_CODE: 'univ_dongguk',SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '숙명여자대학교',    SD_SCHUL_CODE: 'univ_sookmyung', SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '국민대학교',        SD_SCHUL_CODE: 'univ_kookmin',SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '세종대학교',        SD_SCHUL_CODE: 'univ_sejong', SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '광운대학교',        SD_SCHUL_CODE: 'univ_kwu',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '인하대학교',        SD_SCHUL_CODE: 'univ_inha',   SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '인천광역시', ORG_RDNMA: '' },
  { SCHUL_NM: '아주대학교',        SD_SCHUL_CODE: 'univ_ajou',   SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '경기도',    ORG_RDNMA: '' },
  { SCHUL_NM: '한국외국어대학교',  SD_SCHUL_CODE: 'univ_hufs',   SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '한국항공대학교',    SD_SCHUL_CODE: 'univ_kau',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '경기도',    ORG_RDNMA: '' },
  { SCHUL_NM: '경희대학교',        SD_SCHUL_CODE: 'univ_khu',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '숭실대학교',        SD_SCHUL_CODE: 'univ_ssu',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '인천대학교',        SD_SCHUL_CODE: 'univ_inu',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '인천광역시', ORG_RDNMA: '' },
  { SCHUL_NM: '부산대학교',        SD_SCHUL_CODE: 'univ_pnu',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '부산광역시', ORG_RDNMA: '' },
  { SCHUL_NM: '경북대학교',        SD_SCHUL_CODE: 'univ_knu',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '대구광역시', ORG_RDNMA: '' },
  { SCHUL_NM: '전남대학교',        SD_SCHUL_CODE: 'univ_chonnam',SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '광주광역시', ORG_RDNMA: '' },
  { SCHUL_NM: '충남대학교',        SD_SCHUL_CODE: 'univ_cnu',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '대전광역시', ORG_RDNMA: '' },
  { SCHUL_NM: '전북대학교',        SD_SCHUL_CODE: 'univ_jbnu',   SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '전라북도', ORG_RDNMA: '' },
  { SCHUL_NM: '카이스트',          SD_SCHUL_CODE: 'univ_kaist',  SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '대전광역시', ORG_RDNMA: '' },
  { SCHUL_NM: '포항공과대학교',    SD_SCHUL_CODE: 'univ_postech',SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '경상북도', ORG_RDNMA: '' },
  { SCHUL_NM: 'UNIST',             SD_SCHUL_CODE: 'univ_unist',  SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '울산광역시', ORG_RDNMA: '' },
  { SCHUL_NM: '한국기술교육대학교',SD_SCHUL_CODE: 'univ_koreatech', SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '충청남도', ORG_RDNMA: '' },
  { SCHUL_NM: '단국대학교',        SD_SCHUL_CODE: 'univ_dku',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '경기도', ORG_RDNMA: '' },
  { SCHUL_NM: '가천대학교',        SD_SCHUL_CODE: 'univ_gachon', SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '경기도', ORG_RDNMA: '' },
  { SCHUL_NM: '명지대학교',        SD_SCHUL_CODE: 'univ_mju',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '상명대학교',        SD_SCHUL_CODE: 'univ_smu',    SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '덕성여자대학교',    SD_SCHUL_CODE: 'univ_duksung',SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
  { SCHUL_NM: '성신여자대학교',    SD_SCHUL_CODE: 'univ_sungshin', SCHUL_KND_SC_NM: '대학교', LCTN_SC_NM: '서울특별시', ORG_RDNMA: '' },
];

export async function searchSchools(name: string, type: SchoolType): Promise<NeisSchool[]> {
  if (!name.trim()) return [];

  if (type === '대학교') {
    const q = name.trim().toLowerCase();
    return UNIVERSITIES.filter((u) => u.SCHUL_NM.includes(q) || u.LCTN_SC_NM.includes(q)).slice(0, 20);
  }

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
    if (data.RESULT) return [];
    return (data.schoolInfo?.[1]?.row ?? []) as NeisSchool[];
  } catch {
    return [];
  }
}

const PALETTE = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#0891b2', '#9333ea', '#16a34a',
  '#ea580c', '#0284c7', '#be185d', '#b45309',
];

export function schoolColor(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
