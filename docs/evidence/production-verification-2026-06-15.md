# Redveil Production Verification

Evidence date: **2026-06-15 KST**

## URL Decision

- Primary live demo: https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/
- Alternate deployment: https://redveil.vercel.app/

GitHub Pages를 representative URL로 사용합니다. `main` push 시 `Deploy Pages` workflow가 tests, public payload build, site smoke check를 수행한 뒤 `app/site`를 직접 배포하기 때문입니다.

Vercel은 working alternate deployment로 유지합니다. 2026-06-15 확인 시 다음 HTML이 GitHub Pages와 동일했습니다.

```text
index.html
review.html
assessment.html
compare.html
districts.html
```

## Production UI Evidence

### Home decision surface

![Redveil Production home](redveil-production-home-2026-06-15.png)

확인 내용:

- pause-first risk-screening positioning
- 투자 추천이 아니라 보류 신호라는 문구
- 홈, 매물 검토, 3분 진단, 후보 비교, 구별 리포트 경로
- 공개 예시 점수와 리스크 축

### District report

![Redveil Production district report](redveil-production-districts-2026-06-15.png)

확인 내용:

- 서울 25개 구 comparison
- 선택 구의 보류 사유와 대체 후보
- 데이터 신뢰도와 기반 표본
- 가격 부담, 변동성, 과밀, 유동성 리스크 축

두 페이지 모두 browser smoke test에서 console error/warning이 없었고, 1280px viewport에서 horizontal overflow가 확인되지 않았습니다.

## Public Payload Evidence

현재 tracked public payload:

| Item | Value |
| --- | ---: |
| Transaction window | `2025.04~2026.03` |
| Seoul commercial-district demand | `2025년 4분기` |
| Store competition file | `2026.03.31 기준` |
| Transactions | `12,074` |
| Districts | `25` |
| Trade areas | `1,520` |
| Admin dongs | `427` |
| Low-sample districts | `8` |

See [public-payload-metadata-2026-06-15.json](public-payload-metadata-2026-06-15.json).

## Deployment Evidence

The representative GitHub Pages deployment was verified through:

https://github.com/dffxonnb-cyber/Seoul-Storefront-Redveil/actions/runs/27378847127

The `Deploy Pages` run completed successfully for head SHA `0c6fbe497f5bd24dc2ca01b836347a109a3cde81`.

- verify job: tests, payload build, site smoke check, generated payload check passed
- deploy job: payload build, Pages artifact upload, GitHub Pages deploy passed

See [deploy-pages-verification-2026-06-15.json](deploy-pages-verification-2026-06-15.json).

## What Was Not Verified

This evidence does not validate:

- actual investment performance
- causal business outcomes
- individual property legal or lease conditions
- complete raw-data rebuild without excluded local inputs
- future public-data releases or long-term deployment SLA

The smoke test verifies the public review surface and deployment boundary at the recorded time. It does not prove the quality or freshness of every upstream row.

## Why This Evidence Is Public-safe

- Screenshots contain only public aggregate data and public UI examples.
- Metadata is derived from tracked `app/site/website_payload.js`.
- Deployment evidence uses a public GitHub Actions run.
- No secrets, private datasets, raw excluded files, or environment values are included.
