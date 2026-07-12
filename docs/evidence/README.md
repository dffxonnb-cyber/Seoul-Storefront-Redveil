# Redveil Production Evidence

이 폴더는 Redveil의 공개 배포 상태, 데이터 범위, 검증 결과와 대표 화면을 보관하는 public-safe evidence archive입니다.

Current representative release: **Redveil V2 · 2026-07-12 KST**

## Representative URLs

- 공식 대표 데모: https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/v2/
- 대체 배포: https://redveil.vercel.app/v2/
- V1 Legacy: https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/

GitHub Pages는 repository의 `Deploy Pages` workflow가 `main`을 직접 검증하고 `app/site`를 배포하는 공식 representative URL입니다. Vercel은 동일한 V2 정적 제품의 alternate deployment로 유지합니다.

## Current V2 Evidence

- [V2 release evidence · 2026-07-12](v2-release-2026-07-12.md)
- [V2 decision artifact evidence](v2-decision-artifact.md)
- [V2 desktop map dashboard](redveil-v2-desktop-home-2026-07-12.png)
- [V2 mobile map dashboard](redveil-v2-mobile-home-2026-07-12.png)
- [V2 property review](redveil-v2-property-review-2026-07-12.png)
- [V2 3-minute assessment](redveil-v2-assessment-2026-07-12.png)
- [V2 candidate compare](redveil-v2-candidate-compare-2026-07-12.png)
- [V2 district report](redveil-v2-district-report-2026-07-12.png)

## Archived V1 Evidence

- [Production verification summary · 2026-06-15](production-verification-2026-06-15.md)
- [Public payload metadata](public-payload-metadata-2026-06-15.json)
- [Deploy Pages PASS](deploy-pages-verification-2026-06-15.json)
- [V1 production home](redveil-production-home-2026-06-15.png)
- [V1 production district report](redveil-production-districts-2026-06-15.png)

## Evidence Boundary

현재 V2 evidence는 다음을 확인합니다.

- `/v2/`가 공식 대표 제품 경로임
- 지도 홈·매물 검토·3분 진단·후보 비교·구별 리포트가 같은 V2 셸에서 작동함
- 선택 자치구가 URL과 브라우저 저장 상태를 통해 화면 사이에서 유지됨
- 서울 25개 자치구 GeoJSON 경계와 공개 payload가 렌더링됨
- 잘못된 URL, 손상된 저장값, payload·경계 데이터 실패 상태가 복구 가능하게 처리됨
- 360·390·430·768px과 데스크톱 화면에서 반응형 검증을 통과함
- repository `Deploy Pages` verify workflow가 Python·정적 빌드·runtime·smoke·Chromium E2E를 수행함

현재 evidence는 다음을 증명하지 않습니다.

- 실제 투자 성과 또는 수익률
- 매수·매도 추천의 정확성
- 인과적 사업 성과
- 개별 건물의 임대차·공실·법률 상태
- 전체 원천 데이터의 완전성 또는 실시간성
- 현장 조사와 법률·세무·금융·중개 전문가 검토의 대체 가능성

## Public-safe Policy

- 화면 캡처에는 공개 aggregate와 제품에 이미 포함된 예시만 사용합니다.
- Metadata evidence는 tracked public payload의 summary와 데이터 기간만 기록합니다.
- 원천 CSV, service key, secret 환경 값, private dataset은 포함하지 않습니다.
- 점수는 매입 추천이 아니라 추가 검토가 필요한 보류 신호로만 설명합니다.
