# Typers

한국 타이핑 배틀 플랫폼. 학교를 선택하고 65초 동안 한국어·영어 타이핑으로 학교의 명예를 건다.

---

## 핵심 기능

- **학교대항전** — 전국 초·중·고·대학교 선택 후 65초 혼합 타이핑 배틀 (한국어 40초 → 영어 20초)
- **자모 단위 타이핑 엔진** — IME 우회, 키 입력 즉시 판정, 실시간 음절 조합 시각화
- **학교별 랭킹** — localStorage 기반 학교 평균 CPM 집계 및 순위 산정
- **NEIS API 연동** — 전국 초·중·고 실시간 검색, 200여 개 대학교 내장 데이터

## 기술 스택

| 분류 | 사용 기술 |
|------|----------|
| Framework | React 19, TypeScript 6 |
| Bundler | Vite 8 |
| Routing | React Router 7 |
| Chart | Recharts |
| 외부 API | NEIS 교육정보 개방 포털 |
| 상태 관리 | React Hooks (useState, useRef, useMemo) |
| 영속성 | localStorage |

백엔드 없음. 모든 기록은 브라우저 localStorage에 저장.

## 시작하기

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 프로덕션 빌드
npm run lint
```

## 프로젝트 구조

```
src/
├── pages/
│   ├── Home.tsx              # 메인 (모드 선택, 활동 차트)
│   └── Battle/
│       ├── index.tsx         # 3단계 플로우 오케스트레이터
│       ├── SchoolSelect.tsx  # 학교 검색 + 닉네임 입력
│       ├── BattleArena.tsx   # 타이핑 엔진 (65초)
│       └── BattleResult.tsx  # 점수 + 학교 랭킹
├── utils/
│   ├── jamoUtils.ts          # 한글 자모 분해·합성 핵심 로직
│   ├── keystrokes.ts         # 타 수 계산 (CPM 환산)
│   ├── schoolApi.ts          # NEIS API + 대학교 데이터
│   └── battleStorage.ts      # localStorage CRUD, 학교 통계
└── data/
    └── texts.ts              # 타이핑 샘플 텍스트 풀
```

## 한글 타이핑 엔진

한국어 타이핑의 핵심 문제는 브라우저 IME가 음절 조합 과정을 가로채기 때문에 `keydown` 이벤트만으로는 정확한 입력 판정이 불가능하다는 점이다. Typers는 IME를 완전히 우회하는 자체 엔진을 구현했다.

### 동작 원리

**1. 사전 분해 (decomposeText)**

목표 텍스트를 음절 단위가 아닌 자모 시퀀스로 분해한다.

```
"봄날" → ['ㅂ','ㅗ','ㅁ','ㄴ','ㅏ','ㄹ']
```

겹모음(ㅘ → ㅗ+ㅏ)과 겹받침(ㄳ → ㄱ+ㅅ)까지 단일 자모로 분해한다.

**2. 키 입력 즉시 판정**

`keydown` 이벤트에서 `e.code`로 물리 키를 읽고, 두벌식 배열 맵(`CODE_TO_QWERTY` → `KOREAN_KEY_TO_JAMO`)을 거쳐 자모로 변환한다. IME가 개입하기 전에 판정이 끝난다.

```
KeyS → 's' → 'ㄴ'
```

**3. 실시간 음절 합성 (composePartialJamos)**

현재 음절에서 입력한 자모들을 합성해 진행 중인 음절을 시각적으로 표시한다.

```
['ㅂ']           → 'ㅂ'  (초성만)
['ㅂ','ㅗ']      → '보'  (초성 + 중성)
['ㅂ','ㅗ','ㅁ'] → '봄'  (완성)
```

**4. 레이아웃 고정**

자모(ㅂ)와 음절(봄)은 폰트 렌더링 폭이 달라 주변 글자가 밀린다. 각 글자 `<span>`에 `display: inline-block; width: 1em`을 적용해 칸 크기를 고정한다. 영어 구간은 자연 가변 폭을 유지한다.

### CPM 계산

단순 글자 수가 아닌 실제 타 수를 기준으로 계산한다. 겹모음·겹받침은 여러 번의 키 입력이 필요하므로 `keystrokes.ts`에서 음절별 실제 키입력 횟수를 산출해 CPM을 환산한다.

## 설계 결정

| 결정 | 이유 |
|------|------|
| 백엔드 없음 | 포트폴리오 배포 편의성, 학교 대항전 특성상 단일 기기 내 경쟁으로도 충분 |
| 대학교 하드코딩 | NEIS API가 대학교 데이터를 미지원. 200여 개 주요 대학 내장으로 API 의존 제거 |
| 학교 색상 해시 결정 | 동일 학교는 항상 동일한 색상 유지. 서버 없이도 일관성 보장 |
| IME 우회 | `input` 이벤트 기반 접근은 조합 중 문자를 판정할 수 없어 `keydown` 기반으로 전환 |
