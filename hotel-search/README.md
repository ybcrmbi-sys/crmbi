# 🏨 Hotel Search — DuckDB-WASM + Parquet + Vercel

국가별 드롭다운과 호텔명 검색 기능을 갖춘 호텔 정보 조회 웹사이트입니다.  
브라우저에서 DuckDB-WASM을 통해 Parquet 파일을 직접 쿼리합니다.

---

## 📁 프로젝트 구조

```
hotel-search/
├── public/
│   ├── index.html          ← 메인 SPA (DuckDB-WASM)
│   ├── manifest.json       ← 자동 생성됨 (국가/파일 목록)
│   └── parquet1/
│       ├── COUNTRY_CODE=KR/
│       │   ├── part-00000.parquet
│       │   └── part-00001.parquet
│       ├── COUNTRY_CODE=JP/
│       │   └── part-00000.parquet
│       └── ...
├── scripts/
│   └── generate-manifest.js   ← manifest.json 생성 스크립트
├── vercel.json
└── package.json
```

---

## 🚀 배포 방법 (GitHub + Vercel)

### 1단계: Parquet 파일 배치

```bash
# 기존 parquet1 폴더를 public/ 하위로 복사
cp -r /your/path/parquet1 ./public/parquet1
```

폴더 구조는 다음과 같아야 합니다:
```
public/parquet1/COUNTRY_CODE=KR/part-00000.parquet
public/parquet1/COUNTRY_CODE=JP/part-00000.parquet
```

### 2단계: manifest.json 생성 (로컬 테스트 시)

```bash
node scripts/generate-manifest.js
```

생성 결과 예시:
```
✅ manifest.json 생성 완료: 55개 국가
   KR (한국): 3개 파일
   JP (일본): 2개 파일
   ...
```

### 3단계: GitHub에 업로드

```bash
git init
git add .
git commit -m "초기 배포"
git remote add origin https://github.com/YOUR_USERNAME/hotel-search.git
git push -u origin main
```

> ⚠️ Parquet 파일이 크다면 [Git LFS](https://git-lfs.com/) 사용을 권장합니다.

### 4단계: Vercel 연결

1. [vercel.com](https://vercel.com) 로그인
2. **"Add New Project"** → GitHub 저장소 선택
3. 설정 확인:
   - **Build Command**: `node scripts/generate-manifest.js`
   - **Output Directory**: `public`
4. **Deploy** 클릭

Vercel이 자동으로:
- `generate-manifest.js`를 실행하여 `manifest.json` 생성
- `public/` 폴더를 정적 사이트로 배포
- 필요한 CORS/COOP 헤더 설정 (DuckDB SharedArrayBuffer 필요)

---

## 💻 로컬 개발

```bash
# 의존성 없음 (순수 정적 파일)
npx serve public -p 3000
# 또는
python3 -m http.server 3000 --directory public
```

> ⚠️ **주의**: DuckDB-WASM은 `SharedArrayBuffer`를 사용하므로  
> 로컬에서는 HTTPS 또는 COOP/COEP 헤더가 있는 서버가 필요합니다.  
> `npx serve`는 자동으로 처리합니다.

---

## 🔍 검색 방법

| 기능 | 설명 |
|------|------|
| **국가 선택** | 드롭다운에서 국가 선택 |
| **호텔명 검색** | `HOTEL_NAME_SEARCH` 컬럼 기준 부분 검색 (대소문자 무시) |
| **검색 버튼** | 선택한 국가의 모든 Parquet 파일을 DuckDB로 쿼리 |
| **호텔 선택** | 목록에서 클릭 시 오른쪽에 상세 정보 표시 |

---

## 🗃️ 데이터 컬럼

| 컬럼 | 설명 |
|------|------|
| `HOTEL_CODE` | 호텔 고유 코드 |
| `COUNTRY_CODE` | 국가 코드 (파티션 기준) |
| `HOTEL_NAME_KO` | 한국어 호텔명 |
| `HOTEL_NAME_EN` | 영문 호텔명 |
| `HOTEL_NAME_SEARCH` | 검색용 복합 필드 |
| `STAR_RATING` | 성급 |
| `ALL_AVERAGE` | 전체 평점 (0~5) |
| `DEFAULT_PHOTO_URL` | 대표 이미지 URL |
| `CHECK_IN_TIME` | 체크인 시간 |
| `CHECK_OUT_TIME` | 체크아웃 시간 |
| `FACILITY_LIST` | 편의시설 목록 |

---

## 🛠️ 기술 스택

- **DuckDB-WASM** v1.29.0 — 브라우저 내 SQL 쿼리 엔진
- **Apache Parquet** — 컬럼형 데이터 포맷 (국가별 파티셔닝)
- **Vercel** — 정적 사이트 호스팅 + 헤더 설정
- **GitHub** — 소스 코드 및 데이터 파일 관리

---

## ❓ 문제 해결

| 증상 | 해결 방법 |
|------|-----------|
| `manifest.json not found` | `node scripts/generate-manifest.js` 실행 |
| 검색 결과 없음 | parquet 폴더 구조 확인 (`COUNTRY_CODE=XX` 형식) |
| 브라우저 오류 | COOP/COEP 헤더 확인 (vercel.json 설정 필요) |
| 이미지 로드 실패 | 외부 이미지 URL이 만료되었을 수 있음 (정상) |
