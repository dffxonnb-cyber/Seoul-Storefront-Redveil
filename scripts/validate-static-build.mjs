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
  "v2/redveil-v2.css",
  "v2/redveil-v2.js",
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
  "REDVEIL V2 MAP DASHBOARD",
  "data-v2-risk-map",
  "선택 자치구",
  "후보 비교",
  "LIMITATIONS",
  'src="../website_payload.js"',
  'src="./redveil-v2.js"',
];

for (const marker of v2RequiredMarkers) {
  if (!v2Html.includes(marker)) {
    throw new Error(`v2/index.html is missing marker: ${marker}`);
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
