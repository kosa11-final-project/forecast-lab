"use client";

import { useState } from "react";

type Stage = {
  id: string;
  title: string;
  status: string;
  summary: string;
  execution: string[];
  result: string;
  decision: string;
  columns: { label: string; values: string[]; planned?: boolean }[];
};

const stages: Stage[] = [
  {
    id: "E0", title: "AutoML Baseline", status: "완료 · 기준 모델",
    summary: "추가 Feature 없이 Azure AutoML의 기본 시계열 성능과 실행 가능성을 확인한 단계입니다.",
    execution: ["Time series forecasting / 90일 Horizon", "Grain: sku_id × sales_point_id", "5 trials · VotingEnsemble 선정"],
    result: "MAE 1.3287 · RMSE 2.0933 · R² 0.63569 · NRMSE 0.24892",
    decision: "stockit-demand-e0:1로 등록하고 이후 실험의 비교 기준으로 유지합니다.",
    columns: [{ label: "ID / Time", values: ["sales_date", "sku_id", "sales_point_id"] }, { label: "Target", values: ["net_sales_qty"] }],
  },
  {
    id: "E1", title: "Calendar Features", status: "완료 · 승격 안 함",
    summary: "미래에도 확정적으로 알 수 있는 달력 정보를 명시적으로 추가해 효과를 확인했습니다.",
    execution: ["12개 Calendar Feature 추가", "E0와 동일한 분할·Horizon", "Standard_E8s_v3 · 64 GiB RAM"],
    result: "E0와 지표 완전 동일 · 외생 Feature를 쓰는 학습 모델이 Trial에 포함되지 않음",
    decision: "AutoML 확장을 중단하고 Feature 사용이 명시적인 모델 실험으로 전환합니다.",
    columns: [
      { label: "Base", values: ["sales_date", "sku_id", "sales_point_id", "net_sales_qty"] },
      { label: "Calendar", values: ["day_of_week", "is_weekend", "day_of_month", "week_of_year", "month_of_year", "quarter_of_year", "is_month_start", "is_month_end"] },
      { label: "Holiday", values: ["holiday_code", "is_public_holiday", "is_day_before_public_holiday", "is_day_after_public_holiday"] },
    ],
  },
  {
    id: "E2", title: "Lag & Rolling", status: "다음 · LightGBM",
    summary: "과거 수요 패턴을 누수 없이 직접 표현하고 LightGBM으로 Feature 효과를 검증합니다.",
    execution: ["Fixed-origin 90일 재귀 예측", "LightGBM 우선 학습", "시계열별 오차·음수 예측률 추가 평가"],
    result: "실험 예정 · E0 NRMSE 0.24892보다 낮은지 확인",
    decision: "Validation 개선과 안정성이 확인되면 XGBoost Challenger로 진행합니다.",
    columns: [
      { label: "Lag", values: ["lag_7", "lag_14", "lag_28", "lag_56"], planned: true },
      { label: "Rolling mean", values: ["rolling_mean_7", "rolling_mean_14", "rolling_mean_28"], planned: true },
      { label: "Rolling std", values: ["rolling_std_7", "rolling_std_28"], planned: true },
      { label: "Calendar", values: ["day_of_week", "is_weekend", "month_of_year"], planned: true },
    ],
  },
  {
    id: "E3", title: "Minimum Master", status: "계획 · 조건부",
    summary: "E2가 유효할 때만 상품·판매처의 최소 정적 정보를 추가해 일반화 효과를 비교합니다.",
    execution: ["LightGBM / XGBoost 동일 조건 비교", "Cardinality와 결측률 사전 검증", "E2 대비 순증분 성능 측정"],
    result: "E2 완료 후 진행 여부 결정",
    decision: "복잡도 대비 개선이 작으면 Master Feature는 운영 모델에서 제외합니다.",
    columns: [{ label: "Master", values: ["category", "storage_type", "package_qty", "sales_channel"], planned: true }],
  },
  {
    id: "EN", title: "Final & Production", status: "최종 · 예정",
    summary: "Validation 후보 하나를 확정한 뒤 잠긴 Test를 한 번 평가하고 운영 적재 형식으로 변환합니다.",
    execution: ["Test 2026.05.03 — 2026.07.31", "90일 일별 예측과 D7/14/30/60/90 누적", "DEMAND_FORECAST 계약 검증"],
    result: "최종 후보 선정 후 단 한 번 기록",
    decision: "선정 Feature와 버전을 feature_definition_json에 남기고 운영 파이프라인으로 이관합니다.",
    columns: [{ label: "Final input", values: ["Validation에서 확정된 Feature set"], planned: true }, { label: "Output", values: ["forecast_date", "predicted_qty", "D7 / D14 / D30 / D60 / D90"], planned: true }],
  },
];

export function ExperimentTabs() {
  const [activeId, setActiveId] = useState("E0");
  const active = stages.find((stage) => stage.id === activeId) ?? stages[0];

  return (
    <div className="stage-tabs">
      <div className="tab-list" role="tablist" aria-label="실험 단계">
        {stages.map((stage) => (
          <button key={stage.id} role="tab" aria-selected={activeId === stage.id} onClick={() => setActiveId(stage.id)}>
            <b>{stage.id}</b><span>{stage.title}</span><small>{stage.status}</small>
          </button>
        ))}
      </div>
      <article className="stage-panel" role="tabpanel" key={active.id}>
        <header><div><span>{active.id} / EXPERIMENT STAGE</span><h3>{active.title}</h3></div><b>{active.status}</b></header>
        <p className="stage-summary">{active.summary}</p>
        <div className="stage-facts">
          <section><h4>실행</h4><ul>{active.execution.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>결과</h4><p>{active.result}</p></section>
          <section><h4>판단</h4><p>{active.decision}</p></section>
        </div>
        <div className="column-summary">
          <div className="column-heading"><h4>Feature / Column Summary</h4><span>{active.columns.some((group) => group.planned) ? "예정 컬럼 포함" : "실제 사용 컬럼"}</span></div>
          {active.columns.map((group) => (
            <div className="column-group" key={group.label}><b>{group.label}{group.planned ? " · PLANNED" : ""}</b><div>{group.values.map((value) => <code key={value}>{value}</code>)}</div></div>
          ))}
        </div>
      </article>
    </div>
  );
}
