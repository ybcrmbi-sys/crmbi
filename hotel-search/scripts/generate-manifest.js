#!/usr/bin/env node
/**
 * generate-manifest.js
 * 
 * parquet1 폴더 구조를 스캔하여 manifest.json을 생성합니다.
 * 실행: node scripts/generate-manifest.js
 * 
 * 폴더 구조 예시:
 *   public/parquet1/COUNTRY_CODE=KR/part-00000.parquet
 *   public/parquet1/COUNTRY_CODE=JP/part-00000.parquet
 */

const fs = require('fs');
const path = require('path');

// 국가코드 → 국가명 매핑
const COUNTRY_NAMES = {
  AE: '아랍 에미리트 연합', AL: '알바니아', AM: '아르메니아', AR: '아르헨티나',
  AT: '오스트리아', AU: '호주', AZ: '아제르바이잔', BE: '벨기에',
  BG: '불가리아', BR: '브라질', BW: '보츠와나', CA: '캐나다',
  CI: '코트디브와르', CN: '중국', CY: '키프로스', DE: '독일',
  DK: '덴마크', ES: '스페인', FR: '프랑스', GB: '영국',
  GH: '가나', GR: '그리스', HK: '홍콩', HR: '크로아티아',
  HU: '헝가리', ID: '인도네시아', IE: '아일랜드', IN: '인도',
  IS: '아이슬랜드', IT: '이탈리아', JO: '요르단', JP: '일본',
  KH: '캄보디아', KR: '한국', KZ: '카자흐스탄', LK: '스리랑카',
  MA: '모로코', MX: '멕시코', MY: '말레이시아', NL: '네덜란드',
  NP: '네팔', PH: '필리핀', PL: '폴란드', PR: '푸에르토리코',
  PT: '포르투갈', PY: '파라과이', RU: '러시아 연방', SE: '스웨덴',
  SG: '싱가포르', TH: '태국', TR: '터키', TW: '대만',
  US: '미국', VN: '베트남', ZA: '남아프리카 공화국',
};

const parquetBase = path.join(__dirname, '..', 'public', 'parquet1');

if (!fs.existsSync(parquetBase)) {
  console.error(`❌ 폴더가 존재하지 않습니다: ${parquetBase}`);
  console.error('   public/parquet1/ 폴더에 COUNTRY_CODE=XX 형태의 하위 폴더와 parquet 파일을 넣어주세요.');
  process.exit(1);
}

const entries = fs.readdirSync(parquetBase);
const countries = [];

for (const entry of entries) {
  const match = entry.match(/^COUNTRY_CODE=(.+)$/);
  if (!match) continue;

  const code = match[1];
  const folderPath = path.join(parquetBase, entry);
  const stat = fs.statSync(folderPath);
  if (!stat.isDirectory()) continue;

  const files = fs.readdirSync(folderPath)
    .filter(f => f.endsWith('.parquet'))
    .map(f => `parquet1/${entry}/${f}`);

  if (files.length === 0) continue;

  countries.push({
    code,
    name: COUNTRY_NAMES[code] || code,
    files,
  });
}

if (countries.length === 0) {
  console.warn('⚠️  parquet 파일을 찾지 못했습니다. 폴더 구조를 확인하세요.');
}

const manifest = { countries };
const outPath = path.join(__dirname, '..', 'public', 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');

console.log(`✅ manifest.json 생성 완료: ${countries.length}개 국가`);
countries.forEach(c => {
  console.log(`   ${c.code} (${c.name}): ${c.files.length}개 파일`);
});
