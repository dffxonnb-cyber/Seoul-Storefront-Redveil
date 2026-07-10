import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const payloadSource = fs.readFileSync(path.join(root, "app/site/website_payload.js"), "utf8");
const commonSource = fs.readFileSync(path.join(root, "app/site/common.js"), "utf8");

assert.equal(commonSource.includes("```"), false, "common.js must not contain Markdown code fences");

class ElementStub {
  matches() {
    return false;
  }

  closest() {
    return null;
  }

  setAttribute() {}

  removeAttribute() {}
}

const storage = new Map([["redveil-selected-district", "11530"]]);
const documentStub = {
  body: { dataset: { page: "assessment" } },
  head: { appendChild() {} },
  createElement() {
    return {
      dataset: {},
      style: {},
      className: "",
      textContent: "",
      hidden: false,
      appendChild() {},
      setAttribute() {},
    };
  },
  getElementById() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  addEventListener() {},
};

const context = {
  console,
  URL,
  URLSearchParams,
  Date,
  Math,
  Number,
  String,
  Array,
  Object,
  JSON,
  RegExp,
  Intl,
  Set,
  Element: ElementStub,
  document: documentStub,
  localStorage: {
    getItem(key) {
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
  },
  location: {
    href: "https://example.test/assessment.html",
    pathname: "/assessment.html",
    search: "",
  },
  history: { replaceState() {} },
  setTimeout() {
    return 1;
  },
  clearTimeout() {},
};

context.window = context;
context.globalThis = context;
context.window.location = context.location;
context.window.history = context.history;
context.window.setTimeout = context.setTimeout;

vm.createContext(context);
vm.runInContext(payloadSource, context, { filename: "website_payload.js" });
vm.runInContext(commonSource, context, { filename: "common.js" });

const api = context.RedveilV2;
assert.ok(api, "RedveilV2 API must be exposed");
assert.equal(context.__REDVEIL_PAYLOAD__.districts[0].code, "11530", "stored district must become the initial district");

const guro = api.buildAssessment({ districtCode: "11530", holdingMonths: 36, priority: "balanced" });
assert.ok(guro, "Guro assessment must be created");
assert.equal(guro.districtCode, "11530");
assert.equal(guro.districtName, "구로구");
assert.equal(typeof guro.riskExplanation, "object");
assert.ok(Array.isArray(guro.riskExplanation.mainReasons));

const review = api.createReviewRecord({
  assetName: '<img src=x onerror="alert(1)">',
  districtCode: "11530",
  adminDongName: "구로동",
});
assert.ok(review, "review record must be created");
assert.equal(review.assetName.includes("<img"), false, "user input must be escaped before innerHTML rendering");
assert.equal(review.assetName.includes("&lt;img"), true);

console.log("Redveil client runtime check passed");
