"use client";

import { useState } from "react";

type Stage = {
  id: string; title: string; status: string; purpose: string; settings: string[];
  result: string; interpretation: string; decision: string; next: string;
  columns: { label: string; values: string[]; planned?: boolean }[];
};

const stages: Stage[] = [
  {
    id: "E0", title: "AutoML Baseline", status: "완료 · 기준 모델",
    purpose: "Azure AutoML의 기본 시계열 성능과 실행 가능성을 확인합니다.",
    settings: ["Forecast Horizon 90일", "Grain: sku_id × sales_point_id", "AutoML 5 trials"],
    result: "VotingEnsemble · MAE 1.3287 · RMSE 2.0933 · R² 0.63569 · NRMSE 0.24892",
    interpretation: "후속 실험의 Validation 비교 기준값을 확보했습니다.",
    decision: "stockit-demand-e0:1로 등록하고 기준 모델로 유지합니다.",
    next: "동일 분할에서 명시적 Feature 모델과 비교합니다.",
    columns: [{ label: "식별자·시간", values: ["sales_date", "sku_id", "sales_point_id"] }, { label: "Target", values: ["net_sales_qty"] }],
  },
  {
    id: "E1-C", title: "Calendar AutoML", status: "완료 · 후보 제외",
    purpose: "Calendar Feature를 AutoML 입력에 추가했을 때의 성능 변화를 확인합니다.",
    settings: ["Calendar Feature 12개", "E0와 동일한 분할·Horizon", "AutoML 5 trials"],
    result: "E0와 예측 결과 및 평가 지표가 동일했습니다.",
    interpretation: "Trial이 추가 Feature를 사용하지 않는 통계 기반 모델로 구성되어 Feature 효과가 검증되지 않았습니다.",
    decision: "등록·배포하지 않고 AutoML Trial 확대도 진행하지 않습니다.",
    next: "LightGBM으로 Lag/Rolling Feature 효과를 직접 평가합니다.",
    columns: [{ label: "Calendar", values: ["day_of_week", "is_weekend", "day_of_month", "week_of_year", "month_of_year", "quarter_of_year", "is_month_start", "is_month_end", "holiday_code", "is_public_holiday", "is_day_before_public_holiday", "is_day_after_public_holiday"] }],
  },
  {
    id: "E1-L", title: "LightGBM Lag/Rolling v2", status: "완료 · 후보 선정",
    purpose: "누수 방지 Lag/Rolling Feature를 사용한 LightGBM의 Validation 성능을 E0와 비교합니다.",
    settings: ["Job: tough_ship_2n7nk8qrwz", "90일 고정 Forecast Origin", "이전 예측값을 다음 날짜 Feature에 재귀 입력"],
    result: "상시 0 정책 적용 · MAE 1.215846 · RMSE 2.044311 · R² 0.653267 · Custom Macro NRMSE 0.255497",
    interpretation: "E0 대비 MAE 8.49%, RMSE 2.34% 개선이며 MA(30)보다 MAE·RMSE·R²가 모두 우수합니다. 단, E0 NRMSE와 계산 정의는 완전히 같지 않습니다.",
    decision: "Ablation의 모든 지표에서 가장 우수해 LightGBM Validation 후보로 선정했습니다.",
    next: "최종 Test 결과를 동결하고 모델 등록 및 미래 90일 예측 단계로 이동합니다.",
    columns: [
      { label: "ID·Calendar", values: ["sku_id_code", "sales_point_id_code", "day_of_week", "is_weekend", "month_of_year", "quarter_of_year", "week_of_year", "day_of_month", "is_month_start", "is_month_end"] },
      { label: "Lag", values: ["lag_7", "lag_14", "lag_28", "lag_56"] },
      { label: "Rolling", values: ["rolling_mean_7", "rolling_mean_14", "rolling_mean_28", "rolling_std_7", "rolling_std_28"] },
    ],
  },
  {
    id: "B0", title: "MA(7/14/30) Baseline", status: "완료",
    purpose: "학습 모델의 개선 폭을 판단할 수 있는 재현 가능한 공식 기준선을 확보합니다.",
    settings: ["MA(7), MA(14), MA(30)", "고정 Forecast Origin", "Validation 90일 재귀 예측"],
    result: "MA(7) NRMSE 0.271146 · MA(14) 0.260025 · MA(30) 0.254418",
    interpretation: "세 이동평균 중 MA(30)이 가장 우수했지만 E1-L의 MAE·RMSE·R²보다 낮은 성능입니다.",
    decision: "MA(30)을 공식 이동평균 기준선으로 사용합니다.",
    next: "선정된 LightGBM 후보의 최종 Test 평가로 이동합니다.",
    columns: [{ label: "입력", values: ["sales_date", "sku_id", "sales_point_id", "net_sales_qty"], planned: true }, { label: "Window", values: ["7일", "14일", "30일"], planned: true }],
  },
  {
    id: "A1", title: "LightGBM Ablation", status: "완료 · LGBM-2 선정",
    purpose: "Calendar, Lag, Rolling Feature의 개별 기여도를 동일 모델에서 분리해 검증합니다.",
    settings: ["Calendar-only", "Calendar + Lag", "Calendar + Lag + Rolling"],
    result: "LGBM-0 MAE 1.386455 → LGBM-1 1.274493 → LGBM-2 1.215846",
    interpretation: "Lag 추가로 MAE 8.08%·RMSE 6.37%, Rolling 추가로 MAE 4.60%·RMSE 1.88%가 추가 개선됐습니다.",
    decision: "네 핵심 지표가 단계적으로 개선된 LGBM-2를 Validation 후보로 선정했습니다.",
    next: "선정된 LGBM-2의 최종 Test 평가까지 완료했습니다.",
    columns: [
      { label: "LGBM-0", values: ["ID", "calendar"] },
      { label: "LGBM-1", values: ["ID", "calendar", "lag_7", "lag_14", "lag_28", "lag_56"] },
      { label: "LGBM-2", values: ["ID", "calendar", "lag", "rolling_mean", "rolling_std"] },
    ],
  },
  {
    id: "Final", title: "최종 Test", status: "완료 · 결과 동결",
    purpose: "Validation에서 선정한 후보 하나의 일반화 성능을 확인합니다.",
    settings: ["Job: stoic_deer_h8qqd422qz", "Train v3 + Validation v2 재학습", "Test v4 · 90일 fixed-origin recursive"],
    result: "MAE 1.338165 · RMSE 2.247809 · R² 0.627253 · Macro NRMSE 0.257574",
    interpretation: "Validation 대비 MAE 10.06%, RMSE 9.95% 증가했지만 R² 0.627253으로 일반화 성능을 유지했습니다.",
    decision: "Test 결과를 최종 일반화 성능으로 동결하며 Test 기반 추가 튜닝은 하지 않습니다.",
    next: "최종 모델 등록, 미래 90일 예측 생성과 DEMAND_FORECAST 변환을 진행합니다.",
    columns: [{ label: "고정 Feature", values: ["ID", "calendar", "lag_7/14/28/56", "rolling_mean_7/14/28", "rolling_std_7/28"], planned: true }],
  },
  {
    id: "운영", title: "예측 및 DB 변환", status: "완료 · 연동 설계",
    purpose: "최종 모델의 90일 예측 결과를 서비스 적재 형식으로 전환합니다.",
    settings: ["전체 이력 10,167,592행 재학습", "2026.08.01~10.29 미래 90일 재귀 예측", "D+7/14/30/60/90 누적 변환"],
    result: "Run silver_wolf_0tl6s2x4ms 완료 · Model stockit-demand-lightgbm:1 등록 · 일별 834,930행 생성",
    interpretation: "결측·음수·중복·누적 단조 위반이 모두 0이며 9,277개 시계열의 운영 예측을 생성했습니다.",
    decision: "기존 이력 대상 모델은 확정하고 신규·단기 이력 대상 Cold Start 라우팅을 Backend 계약으로 분리합니다.",
    next: "행별 예측 근거·신뢰도와 원자적 Forecast 버전 publish를 Backend에 구현합니다.",
    columns: [
      { label: "일별 예측", values: ["sku_id", "sales_point_id", "forecast_date", "predicted_qty"] },
      { label: "DEMAND_FORECAST", values: ["base_date", "predicted_qty_d7", "predicted_qty_d14", "predicted_qty_d30", "predicted_qty_d60", "predicted_qty_d90"] },
      { label: "품질 메타데이터", values: ["forecast_source", "confidence_level", "history_days", "fallback_reason"] },
    ],
  },
];

export function ExperimentTabs() {
  const [activeId, setActiveId] = useState("운영");
  const active = stages.find((stage) => stage.id === activeId) ?? stages[0];
  return <div className="stage-tabs">
    <div className="tab-list" role="tablist" aria-label="실험 단계">{stages.map((stage) => <button key={stage.id} role="tab" aria-selected={activeId === stage.id} onClick={() => setActiveId(stage.id)}><b>{stage.id}</b><span>{stage.title}</span><small>{stage.status}</small></button>)}</div>
    <article className="stage-panel" role="tabpanel" key={active.id}>
      <header><div><span>실험 단계 {active.id}</span><h3>{active.title}</h3></div><b>{active.status}</b></header>
      <div className="stage-report"><section className="stage-purpose"><h4>목적</h4><p>{active.purpose}</p></section><section><h4>설정</h4><ul>{active.settings.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>결과</h4><p>{active.result}</p></section><section><h4>해석</h4><p>{active.interpretation}</p></section><section><h4>결정</h4><p>{active.decision}</p></section><section><h4>다음 작업</h4><p>{active.next}</p></section></div>
      <div className="column-summary"><div className="column-heading"><h4>Feature 및 컬럼 요약</h4><span>{active.columns.some((group) => group.planned) ? "예정 컬럼 포함" : "실제 사용 컬럼"}</span></div>{active.columns.map((group) => <div className="column-group" key={group.label}><b>{group.label}{group.planned ? " · 예정" : ""}</b><div>{group.values.map((value) => <code key={value}>{value}</code>)}</div></div>)}</div>
    </article>
  </div>;
}
