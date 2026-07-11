import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const siteRoot = path.join(projectRoot, "app", "site");

const requiredFiles = [
  "index.html",
  "review.html",
  "assessment.html",
  "compare.html",
  "districts.html",
  "styles.css",
  "website_payload.js",
  "common.js",
  "home.js",
  "review.js",
  "assessment.js",
  "compare.js",
  "districts.js",
  "v2/index.html",
  "v2/review.html",
  "v2/assessment.html",
  "v2/redveil-v2.css",
  "v2/redveil-v2-mobile.css",
  "v2/redveil-v2-shell.css",
  "v2/redveil-v2-shell.js",
  "v2/redveil-v2-feature.css",
  "v2/redveil-v2-review.js",
  "v2/redveil-v2-assessment.css",
  "v2/redveil-v2-assessment.js",
  "v2/redveil-v2.js",
  "v2/districts.html",
  "v2/redveil-v2-districts.js",
  "v2/data/seoul-districts.geojson",
];

for (const fileName of requiredFiles) {
  const filePath = path.join(siteRoot, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing static site file: app/site/${fileName}`);
  }
}

const indexHtml = fs.readFileSync(path.join(siteRoot, "index.html"), "utf8");
const requiredMarkers = [
  "PAUSE-FIRST",
  "리스크 요약",
  "보류 사유",
  "대체 후보",
  "데이터 기준과 한계",
  'src="./website_payload.js"',
  'src="./common.js"',
  'src="./home.js"',
];

for (const marker of requiredMarkers) {
  if (!indexHtml.includes(marker)) {
    throw new Error(`index.html is missing marker: ${marker}`);
  }
}

const v2Html = fs.readFileSync(path.join(siteRoot, "v2", "index.html"), "utf8");
const v2RequiredMarkers = [
  "레드베일 V2 지도 대시보드",
  "data-v2-risk-map",
  "서울 리스크 지도",
  "선택 자치구",
  "후보 비교",
  "이용 전 확인",
  'data-v2-view="map"',
  "data-v2-menu-open",
  'href="./redveil-v2-mobile.css',
  'href="./redveil-v2-shell.css',
  'src="./redveil-v2-shell.js',
  'src="../website_payload.js"',
  'src="./redveil-v2.js"',
];

for (const marker of v2RequiredMarkers) {
  if (!v2Html.includes(marker)) {
    throw new Error(`v2/index.html is missing marker: ${marker}`);
  }
}

const obsoleteV2Markers = ["REDVEIL V2 MAP DASHBOARD", "LIMITATIONS ·", "V1 서비스 홈"];
for (const marker of obsoleteV2Markers) {
  if (v2Html.includes(marker)) {
    throw new Error(`v2/index.html still contains obsolete marker: ${marker}`);
  }
}

const v2ReviewHtml = fs.readFileSync(path.join(siteRoot, "v2", "review.html"), "utf8");
const v2ReviewMarkers = [
  "추천 전에 보류 사유를 먼저 남깁니다.",
  'data-v2-view="review"',
  'id="v2-sidebar"',
  'id="review-form"',
  'id="review-example-list"',
  'id="review-history"',
  'href="./redveil-v2-shell.css',
  'href="./redveil-v2-feature.css',
  'src="../website_payload.js"',
  'src="../common.js"',
  'src="../review.js"',
  'src="./redveil-v2-shell.js',
  'src="./redveil-v2-review.js',
];

for (const marker of v2ReviewMarkers) {
  if (!v2ReviewHtml.includes(marker)) {
    throw new Error(`v2/review.html is missing marker: ${marker}`);
  }
}

const obsoleteV2ReviewMarkers = ["HOLD-FIRST REVIEW DESK", "Saved Reviews", "Local archive", "First Output", "Signal Scope"];
for (const marker of obsoleteV2ReviewMarkers) {
  if (v2ReviewHtml.includes(marker)) {
    throw new Error(`v2/review.html still contains obsolete marker: ${marker}`);
  }
}

const v2AssessmentHtml = fs.readFileSync(path.join(siteRoot, "v2", "assessment.html"), "utf8");
const v2AssessmentMarkers = [
  "매입 전, 3분 안에 보류 신호를 먼저 확인합니다.",
  'data-v2-view="assessment"',
  'id="v2-sidebar"',
  'id="assessment-form"',
  'id="district-code"',
  'id="assessment-result"',
  'href="./redveil-v2-shell.css',
  'href="./redveil-v2-feature.css',
  'href="./redveil-v2-assessment.css',
  'src="../website_payload.js"',
  'src="../common.js"',
  'src="../assessment.js"',
  'src="./redveil-v2-shell.js',
  'src="./redveil-v2-assessment.js',
];

for (const marker of v2AssessmentMarkers) {
  if (!v2AssessmentHtml.includes(marker)) {
    throw new Error(`v2/assessment.html is missing marker: ${marker}`);
  }
}

const obsoleteV2AssessmentMarkers = ["3-Minute Diagnosis", "Quick Risk Check", "Scenario Input", "District Snapshot", "Risk Breakdown"];
for (const marker of obsoleteV2AssessmentMarkers) {
  if (v2AssessmentHtml.includes(marker)) {
    throw new Error(`v2/assessment.html still contains obsolete marker: ${marker}`);
  }
}

const v2DistrictHtml = fs.readFileSync(path.join(siteRoot, "v2", "districts.html"), "utf8");
const v2DistrictMarkers = [
  "자치구 리스크 리포트",
  "v2-report-factor-grid",
  "v2-report-alternative-list",
  'data-v2-view="districts"',
  "data-v2-menu-open",
  'href="./redveil-v2-shell.css',
  'src="./redveil-v2-shell.js',
  'src="../website_payload.js"',
  'src="./redveil-v2-districts.js"',
];

for (const marker of v2DistrictMarkers) {
  if (!v2DistrictHtml.includes(marker)) {
    throw new Error(`v2/districts.html is missing marker: ${marker}`);
  }
}

const obsoleteV2DistrictMarkers = ["DISTRICT RISK REPORT", "V1 구별 리포트", "MODE", "District Report"];
for (const marker of obsoleteV2DistrictMarkers) {
  if (v2DistrictHtml.includes(marker)) {
    throw new Error(`v2/districts.html still contains obsolete marker: ${marker}`);
  }
}

const gitIgnoredBuildArtifacts = ["node_modules"];
for (const artifact of gitIgnoredBuildArtifacts) {
  const gitignore = fs.readFileSync(path.join(projectRoot, ".gitignore"), "utf8");
  if (!gitignore.includes(`${artifact}/`)) {
    throw new Error(`.gitignore must include ${artifact}/`);
  }
}

console.log("Redveil static build validation passed.");
