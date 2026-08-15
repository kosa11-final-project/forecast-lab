# Stockit Demand Forecast Lab

SKU·판매지점별 향후 90일 수요예측 실험과 운영 연동 설계를 공유하는 정적 기술 보고서입니다.

## 배포 사이트

[Stockit Demand Forecast Lab](https://stockit-demand-forecast-lab.dnwls0723.chatgpt.site/)

## 주요 내용

- E0 Azure AutoML 기준선
- 이동평균 MA(7/14/30) Baseline
- LightGBM Calendar·Lag·Rolling Feature ablation
- 누수 방지 90일 재귀 Validation 및 최종 Test
- 운영 90일 Forecast와 Azure Model 등록 결과
- 신규 SKU Cold Start 및 행별 신뢰도 설계
- 위험등급, 원자적 배치 Publish, 비동기 API/UI 계약

## 로컬 실행

Node.js `22.13.0` 이상이 필요합니다.

```bash
npm install
npm run dev
```

배포용 빌드 검증:

```bash
npm run build
```

## 기술 구성

- React / TypeScript
- vinext / Vite
- Cloudflare Workers 호환 빌드
- Pretendard Variable

## 저장소 범위

이 저장소에는 보고서 웹사이트와 운영 계약 문서만 포함합니다. 실제 ML 학습 코드, 데이터와 Backend 구현은 별도 저장소에서 관리합니다.
