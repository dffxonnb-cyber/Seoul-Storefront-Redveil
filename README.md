# Redveil

<p>
  <img
    width="1536"
    height="1024"
    alt="레드베일 로고 디자인"
    src="https://github.com/user-attachments/assets/0aee87c2-a7cb-443a-bea7-c0916b825896"
  />
</p>

`Redveil`은 서울 소형 상가 매입 전에 숨은 리스크를 빠르게 점검하는 서비스입니다.  
가격 부담, 거래 둔화, 상권 과밀, 수요 취약 신호를 한 화면에서 확인하고, 매입 보류 판단과 대체 후보 비교까지 이어지도록 설계했습니다.

- 브랜드명: `Redveil`
- 한글 부제: `서울 소형 상가 매입 리스크 판별 서비스`
- 영문 슬로건: `Uncover hidden risks before acquisition.`
- GitHub: [Seoul-Storefront-Redveil](https://github.com/dffxonnb-cyber/Seoul-Storefront-Redveil)
- 웹사이트: [GitHub Pages](https://dffxonnb-cyber.github.io/Seoul-Storefront-Redveil/)

## 프로젝트 한눈에 보기

| 항목 | 내용 |
|------|------|
| 유형 | 개인 포트폴리오 프로젝트 |
| 핵심 질문 | 지금 검토 중인 상가를 사도 되는가 |
| 대상 사용자 | 서울 소형 상가 매입을 검토하는 개인 투자자 |
| 제공 방식 | 공공데이터 수집, 리스크 점수 계산, 매물 검토 UI, 공개 웹사이트 |
| 분석 범위 | 서울 25개 구, 행정동 428개, 수요 취약 상권 1,570개 |

## 이 프로젝트가 해결하려는 문제

- 좋아 보이는 매물을 추천하기보다, 먼저 사지 말아야 할 근거를 보여줍니다.
- 구 단위 리스크를 점수로만 끝내지 않고, 매물 검토 메모와 대체 후보 비교로 연결합니다.
- 분석 결과를 내부 대시보드에 머무르게 하지 않고, 공개 가능한 웹사이트 경험으로 옮겼습니다.

## 주요 기능

- `내 매물 검토`
  검토 중인 매물의 구와 희망 가격을 입력하면 리스크 점수, 리스크 유형, 보류 메모를 확인할 수 있습니다.
- `3분 진단`
  빠른 입력만으로 현재 매입 판단을 미리 점검할 수 있습니다.
- `후보 비교`
  검토 중인 후보 구를 나란히 비교하고, 대체 후보를 확인할 수 있습니다.
- `구 리포트`
  서울 25개 구의 리스크 등급, 유형, 주요 근거를 한눈에 볼 수 있습니다.
- `케이스 스터디`
  상위 위험 구를 실제 검토 언어로 읽고, 현장 확인 질문까지 이어집니다.

## 데이터와 분석 축

사용 데이터:

- 국토교통부 상업업무용 부동산 매매 실거래가 API
- 서울시 상권분석 서비스
- 소상공인시장진흥공단 상가(상권) 정보

분석 축:

- 가격 부담 리스크
- 거래 유동성 리스크
- 상권 과밀 리스크
- 수요 취약 리스크

현재 공개 기준:

- 거래 원천 데이터 `12,074건`
- 서울 `25개 구` 비교
- 행정동 `428개` 커버
- 수요 취약 상권 `1,570개` 분석

## 폴더 구조

| 경로 | 설명 |
|------|------|
| `app/site/` | 공개 웹사이트 HTML, CSS, JS |
| `app/server.py` | 로컬 확인용 Python 서버 |
| `src/redveil/pipelines/` | 수집, 가공, 점수 계산, 사이트 payload 생성 |
| `docs/` | 전략, PRD, 사용자 여정, 검증 문서 |
| `dashboard/` | 캡처 이미지와 제출용 링크 |
| `tests/` | 파이프라인과 API 기본 테스트 |

## 실행 방법

1. 의존성 설치

```bash
pip install -r requirements.txt
```

2. 웹사이트 데이터 생성

```bash
python src/redveil/pipelines/export_website_payload.py
```

3. 로컬 서버 실행

```bash
python app/server.py --host 127.0.0.1 --port 8030
```

4. 브라우저 접속

```text
http://127.0.0.1:8030
http://127.0.0.1:8030/review.html
http://127.0.0.1:8030/assessment.html
http://127.0.0.1:8030/compare.html
http://127.0.0.1:8030/districts.html
```

## 공개 저장소 기준 주의점

- `data/` 원천 파일은 용량 문제로 저장소에 포함하지 않습니다.
- 공개 저장소는 코드, 문서, 사이트, 시각 자산 중심의 포트폴리오 버전입니다.
- 거래 데이터와 상권 수요 데이터의 시점이 완전히 같지는 않으므로 실제 매입 판단에서는 1차 필터로 활용하는 것이 적절합니다.

## 참고 문서

- [서비스 전략](./docs/SERVICE_STRATEGY.md)
- [사용자 여정](./docs/USER_JOURNEY.md)
- [검증 전략](./docs/VALIDATION_STRATEGY.md)
- [PRD](./docs/PRD_REDVEIL.md)
- [리스크 모델 정의](./docs/RISK_MODEL_SPEC.md)
