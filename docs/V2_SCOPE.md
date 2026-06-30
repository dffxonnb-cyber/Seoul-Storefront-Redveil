# Redveil V2 Scope

Redveil V2는 “상권 리스크 점수를 보여주는 사이트”를 넘어, 후보 검토 결과를 복사·저장·공유 가능한 decision artifact로 정리하는 단계입니다.

V2의 목표는 매입 추천을 자동화하는 것이 아니라, 사용자가 더 천천히 판단하고, 보류 사유와 재확인 항목을 남기게 만드는 것입니다.

## V2 Goal

Redveil V2는 다음 질문에 답합니다.

이 후보를 바로 결정하지 않고, 무엇을 근거로 보류·비교·전문가 검토로 넘길 것인가?

## In Scope

V2에서 구현하거나 문서화할 범위는 다음과 같습니다.

- Hold Memo 복사 / export
- Compare Memo 복사 / export
- 후보 A/B/C 비교 상태를 URL query로 유지
- Professional Review Checklist 추가
- Review result와 Compare result를 decision artifact로 정리
- V2 evidence 문서 작성
- README와 portfolio case study의 V2 상태 갱신

## Out of Scope

V2에서 주장하거나 구현하지 않는 범위는 다음과 같습니다.

- 부동산 투자 추천
- 수익률 예측
- 매입 / 매도 판단 자동화
- 법률·세무·금융 자문
- 로그인 / 계정 / 서버 저장
- 유료 서비스
- 실제 투자 성과 검증
- 개별 매물의 실제 정확도 보장

## V2 Product Principle

Redveil은 사용자를 빠르게 확신시키는 도구가 아니라, 판단을 늦추는 도구입니다.

따라서 V2의 핵심 출력은 “추천”이 아니라 다음 세 가지입니다.

1. 왜 보류해야 하는가
2. 무엇을 다시 확인해야 하는가
3. 어떤 후보와 비교해야 하는가

## Decision Artifact

V2에서 생성되는 Hold Memo는 다음 형식을 따릅니다.

Hold Decision
- 후보명:
- 지역:
- 리스크 점수:
- 보류 판단:
- 핵심 근거:
- 재확인 항목:
- 대체 후보:
- claim boundary:

비교 메모는 다음 형식을 따릅니다.

Comparison Memo
- 후보 조합:
- 가장 보수적으로 볼 후보:
- 가장 낮은 리스크 후보:
- 가장 큰 차이를 만든 리스크 축:
- 다음 액션:
- claim boundary:

## Professional Review Checklist

V2의 체크리스트는 실제 결정을 대체하지 않고, 전문가·현장 검토로 넘기기 위한 확인 항목입니다.

- 최근 실거래 / 호가 재확인
- 공실 가능성 확인
- 임대 조건 확인
- 권리금 / 관리비 확인
- 대출 조건 확인
- 동일 업종 과밀도 현장 확인
- 유동인구 시간대별 편차 확인
- 법률 / 세무 / 중개 전문가 검토

## Evidence Boundary

Redveil V2는 다음을 주장하지 않습니다.

- 이 후보가 좋은 투자처라고 주장하지 않음
- 이 후보를 사야 하거나 팔아야 한다고 주장하지 않음
- 리스크 점수가 실제 수익률을 예측한다고 주장하지 않음
- 대체 후보가 더 좋은 매입처라고 주장하지 않음
- professional checklist가 실제 법률·세무·금융 검토를 대체한다고 주장하지 않음

## V2 Completion Criteria

V2 1차 완료 기준은 다음과 같습니다.

- docs/V2_SCOPE.md 작성
- Review page에서 Hold Memo 복사 또는 export 가능
- Compare page에서 Comparison Memo 복사 또는 export 가능
- Professional Review Checklist가 결과 화면에 표시됨
- V2 evidence 문서가 docs/evidence/에 추가됨
- README의 V2 Roadmap이 구현 상태 기준으로 갱신됨
- smoke / build 검증 통과
