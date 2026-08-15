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
    id: "E1-L", title: "LightGBM Lag/Rolling v2", status: "완료 · 후보 검토",
    purpose: "누수 방지 Lag/Rolling Feature를 사용한 LightGBM의 Validation 성능을 E0와 비교합니다.",
    settings: ["Job: tough_ship_2n7nk8qrwz", "90일 고정 Forecast Origin", "이전 예측값을 다음 날짜 Feature에 재귀 입력"],
    result: "상시 0 정책 적용 · MAE 1.215846 · RMSE 2.044311 · R² 0.653267 · Custom Macro NRMSE 0.255497",
    interpretation: "E0 대비 MAE 8.49%, RMSE 2.34% 개선이며 MA(30)보다 MAE·RMSE·R²가 모두 우수합니다. 단, E0 NRMSE와 계산 정의는 완전히 같지 않습니다.",
    decision: "행 단위 지표 개선을 확인했지만 Validation 후보는 ablation 이후 확정합니다.",
    next: "Calendar-only, +Lag, +Rolling ablation을 수행합니다.",
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
    next: "LightGBM Feature ablation을 수행합니다.",
    columns: [{ label: "입력", values: ["sales_date", "sku_id", "sales_point_id", "net_sales_qty"], planned: true }, { label: "Window", values: ["7일", "14일", "30일"], planned: true }],
  },
  {
    id: "A1", title: "LightGBM Ablation", status: "예정",
    purpose: "Calendar, Lag, Rolling Feature의 개별 기여도를 동일 모델에서 분리해 검증합니다.",
    settings: ["Calendar-only", "Calendar + Lag", "Calendar + Lag + Rolling"],
    result: "미실행 · 결과 수치 없음",
    interpretation: "지표 변화와 Feature importance를 함께 확인합니다.",
    decision: "Validation 기준으로 최종 Feature 조합과 후보 모델 하나를 선정합니다.",
    next: "후보가 확정된 이후에만 Test를 평가합니다.",
    columns: [{ label: "검증 조합", values: ["calendar-only", "+lag", "+rolling"], planned: true }],
  },
  {
    id: "Final", title: "최종 Test", status: "미평가",
    purpose: "Validation에서 선정한 후보 하나의 일반화 성능을 확인합니다.",
    settings: ["Test: 2026.05.03~2026.07.31", "최종 후보 한 개", "90일 1회 평가"],
    result: "Test 미사용 · 결과 수치 없음",
    interpretation: "Test 결과를 확인한 뒤 모델이나 Feature를 다시 선택하지 않습니다.",
    decision: "평가 전까지 모델 등록·배포를 진행하지 않습니다.",
    next: "성능 확인 후 최종 모델 등록과 미래 90일 예측을 수행합니다.",
    columns: [{ label: "최종 입력", values: ["Validation에서 확정된 Feature set"], planned: true }],
  },
  {
    id: "운영", title: "예측 및 DB 변환", status: "예정",
    purpose: "최종 모델의 90일 예측 결과를 서비스 적재 형식으로 전환합니다.",
    settings: ["미래 90일 일별 예측", "D+7/14/30/60/90 누적", "DEMAND_FORECAST 변환"],
    result: "미실행 · 모델 등록 및 배포 없음",
    interpretation: "운영 계약 검증 후에만 DB 적재를 진행합니다.",
    decision: "Feature 정의와 모델 버전을 함께 기록합니다.",
    next: "Backend 조회 계약을 검증하고 적재 파이프라인을 확정합니다.",
    columns: [{ label: "출력", values: ["forecast_date", "predicted_qty", "D+7", "D+14", "D+30", "D+60", "D+90"], planned: true }],
  },
];

export function ExperimentTabs() {
  const [activeId, setActiveId] = useState("E1-L");
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
