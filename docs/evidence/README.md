# Redveil Production Evidence

이 폴더는 Redveil의 현재 public Production 상태를 빠르게 검토할 수 있는 public-safe evidence를 보관합니다.

Evidence date: **2026-06-15 KST**

## Representative URLs

- Primary live demo: https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/
- Alternate deployment: https://redveil.vercel.app/

GitHub Pages는 repository의 `Deploy Pages` workflow가 `main`에서 직접 검증·배포하는 공식 representative URL입니다. Vercel은 동일한 정적 페이지를 제공하는 alternate deployment로 유지합니다.

2026-06-15 확인 시 홈, 매물 검토, 3분 진단, 후보 비교, 구별 리포트 HTML의 GitHub Pages/Vercel SHA-256이 각각 동일했습니다.

## Current Evidence

- [V2 decision artifact evidence](v2-decision-artifact.md)
- [Production verification summary](production-verification-2026-06-15.md)
- [Public payload metadata](public-payload-metadata-2026-06-15.json)
- [Deploy Pages PASS](deploy-pages-verification-2026-06-15.json)
- [Production home](redveil-production-home-2026-06-15.png)
- [Production district report](redveil-production-districts-2026-06-15.png)

## Evidence Boundary

현재 evidence는 다음을 확인합니다.

- primary GitHub Pages가 정상 응답함
- 홈과 구별 리포트가 public payload를 사용해 렌더링됨
- 현재 public payload의 데이터 기간과 coverage
- 저표본 경고와 의사결정 보조 한계가 화면·문서에 존재함
- repository `Deploy Pages` verify/deploy jobs가 통과함

현재 evidence는 다음을 증명하지 않습니다.

- 실제 투자 성과 또는 수익률
- buy/sell recommendation의 정확성
- 인과적 사업 성과
- 개별 건물의 임대차·공실·법률 상태
- 전체 원천 데이터의 완전성 또는 실시간성

## Public-safe Policy

- 캡처에는 공개 aggregate와 화면에 이미 공개된 예시만 포함합니다.
- Metadata evidence는 tracked public payload의 summary와 데이터 기간만 기록합니다.
- 원천 CSV, service key, secret 환경 값, private dataset은 포함하지 않습니다.
- 점수는 매입 추천이 아니라 추가 검토가 필요한 보류 신호로만 설명합니다.
