"use client";

import { useState } from "react";

type Stage = {
  id: string;
  title: string;
  status: string;
  purpose: string;
  settings: string[];
  result: string;
  interpretation: string;
  decision: string;
  next: string;
  columns: { label: string; values: string[]; planned?: boolean }[];
};

const stages: Stage[] = [
  {
    id: "E0", title: "AutoML Baseline", status: "완료",
    purpose: "Azure AutoML의 기본 시계열 성능과 실행 가능성을 확인합니다.",
    settings: ["Forecast Horizon 90일", "Grain: sku_id × sales_point_id", "AutoML 5 trials"],
    result: "VotingEnsemble 선정 · MAE 1.3287 · RMSE 2.0933 · R² 0.63569 · NRMSE 0.24892",
    interpretation: "후속 실험의 성능을 판단할 수 있는 Validation 기준값을 확보했습니다.",
    decision: "stockit-demand-e0:1로 등록하고 기준 후보로 유지합니다.",
    next: "동일 조건에서 Calendar Feature 추가 효과를 확인합니다.",
    columns: [{ label: "식별자·시간", values: ["sales_date", "sku_id", "sales_point_id"] }, { label: "Target", values: ["net_sales_qty"] }],
  },
  {
    id: "E1", title: "Calendar Feature", status: "완료 · 후보 제외",
    purpose: "미래 시점에도 확정적으로 알 수 있는 Calendar Feature의 추가 효과를 확인합니다.",
    settings: ["Calendar Feature 12개 추가", "E0와 동일한 분할·Horizon", "Standard_E8s_v3 · 64 GiB RAM"],
    result: "E0와 예측 결과 및 전체 평가 지표가 동일했습니다.",
    interpretation: "5개 Trial이 추가 Feature를 사용하지 않는 통계 기반 모델로 구성되어 Feature 효과가 검증되지 않았습니다.",
    decision: "E1은 등록하지 않고 AutoML Trial 확대도 진행하지 않습니다.",
    next: "이동평균 Baseline을 평가한 뒤 LightGBM을 고정하여 Feature 효과를 비교합니다.",
    columns: [
      { label: "기본", values: ["sales_date", "sku_id", "sales_point_id", "net_sales_qty"] },
      { label: "Calendar", values: ["day_of_week", "is_weekend", "day_of_month", "week_of_year", "month_of_year", "quarter_of_year", "is_month_start", "is_month_end"] },
      { label: "공휴일", values: ["holiday_code", "is_public_holiday", "is_day_before_public_holiday", "is_day_after_public_holiday"] },
    ],
  },
  {
    id: "B0", title: "MA(7/14/30) Baseline", status: "다음 작업",
    purpose: "복잡한 학습 모델의 개선 폭을 판단할 수 있는 재현 가능한 단순 기준선을 확보합니다.",
    settings: ["MA(7), MA(14), MA(30)", "고정 Forecast Origin", "Validation 90일 재귀 예측"],
    result: "미실행 · 결과 수치 없음",
    interpretation: "평가 완료 후 E0와 각 이동평균의 NRMSE를 동일 기준으로 비교합니다.",
    decision: "검증 결과를 모든 명시적 모델 실험의 추가 기준선으로 사용합니다.",
    next: "LightGBM 기본 Feature 실험을 시작합니다.",
    columns: [{ label: "입력", values: ["sales_date", "sku_id", "sales_point_id", "net_sales_qty"], planned: true }, { label: "Window", values: ["7일", "14일", "30일"], planned: true }],
  },
  {
    id: "E2", title: "LightGBM Lag & Rolling", status: "예정",
    purpose: "LightGBM을 고정하고 Feature 조합별 성능 기여도를 직접 비교합니다.",
    settings: ["LGBM-M0~M4 단계 실험", "동일 데이터 분할·평가 기준", "90일 재귀 예측"],
    result: "미실행 · 결과 수치 없음",
    interpretation: "각 단계의 NRMSE 변화로 Calendar, Lag/Rolling, Master Feature의 순증분 효과를 판단합니다.",
    decision: "Validation 성능과 안정성이 가장 좋은 Feature 조합을 선택합니다.",
    next: "선정 Feature 조합으로 XGBoost 비교 실험을 준비합니다.",
    columns: [
      { label: "Lag", values: ["lag_7", "lag_14", "lag_28", "lag_56"], planned: true },
      { label: "Rolling mean", values: ["rolling_mean_7", "rolling_mean_14", "rolling_mean_28"], planned: true },
      { label: "Rolling std", values: ["rolling_std_7", "rolling_std_28"], planned: true },
      { label: "Calendar", values: ["day_of_week", "is_weekend", "month_of_year"], planned: true },
    ],
  },
  {
    id: "E3", title: "Minimum Master Feature", status: "조건부 진행",
    purpose: "최소 정적 Master Feature가 E2 대비 성능을 추가로 개선하는지 확인합니다.",
    settings: ["결측률·Cardinality 사전 검증", "E2 최적 조합에 Master Feature 추가", "동일 Validation 기준"],
    result: "미실행 · E2 결과에 따라 진행",
    interpretation: "Feature 복잡도와 운영 결합 비용을 성능 개선 폭과 함께 판단합니다.",
    decision: "순증분 개선이 작으면 운영 모델 입력에서 제외합니다.",
    next: "조건 충족 시 XGBoost 비교 실험으로 이동합니다.",
    columns: [{ label: "Master", values: ["category", "storage_type", "package_qty", "sales_channel"], planned: true }],
  },
  {
    id: "E4", title: "XGBoost 비교", status: "대기",
    purpose: "LightGBM 최적 Feature 조합을 동일하게 적용하여 알고리즘 차이를 비교합니다.",
    settings: ["LightGBM 파이프라인 검증 후 실행", "최적 Feature 조합 고정", "동일 분할·평가 기준"],
    result: "미실행 · 결과 수치 없음",
    interpretation: "LightGBM과 XGBoost의 NRMSE 및 시계열별 안정성을 함께 비교합니다.",
    decision: "Validation 기준으로 최종 Test에 사용할 후보 하나를 선정합니다.",
    next: "최종 후보 선정 후 Test 구간을 한 번 평가합니다.",
    columns: [{ label: "입력", values: ["LightGBM에서 선정된 최적 Feature 조합"], planned: true }],
  },
  {
    id: "Final", title: "최종 Test 및 운영 적용", status: "예정",
    purpose: "선정 모델의 일반화 성능을 확인하고 운영 적재 형식으로 전환합니다.",
    settings: ["Test: 2026.05.03~2026.07.31", "최종 후보 한 개만 평가", "D+7/14/30/60/90 누적"],
    result: "미평가 · 최종 후보 선정 전 사용 금지",
    interpretation: "Test 확인 후 모델이나 Feature를 다시 선택하지 않습니다.",
    decision: "성능과 운영 계약을 확인한 뒤 DEMAND_FORECAST 적재 여부를 결정합니다.",
    next: "feature_definition_json 기록 및 Backend 조회 계약 검증을 수행합니다.",
    columns: [{ label: "최종 입력", values: ["Validation에서 확정된 Feature set"], planned: true }, { label: "출력", values: ["forecast_date", "predicted_qty", "D+7 / D+14 / D+30 / D+60 / D+90"], planned: true }],
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
        <header><div><span>실험 단계 {active.id}</span><h3>{active.title}</h3></div><b>{active.status}</b></header>
        <div className="stage-report">
          <section className="stage-purpose"><h4>목적</h4><p>{active.purpose}</p></section>
          <section><h4>설정</h4><ul>{active.settings.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>결과</h4><p>{active.result}</p></section>
          <section><h4>해석</h4><p>{active.interpretation}</p></section>
          <section><h4>결정</h4><p>{active.decision}</p></section>
          <section><h4>다음 작업</h4><p>{active.next}</p></section>
        </div>
        <div className="column-summary">
          <div className="column-heading"><h4>Feature 및 컬럼 요약</h4><span>{active.columns.some((group) => group.planned) ? "예정 컬럼 포함" : "실제 사용 컬럼"}</span></div>
          {active.columns.map((group) => (
            <div className="column-group" key={group.label}><b>{group.label}{group.planned ? " · 예정" : ""}</b><div>{group.values.map((value) => <code key={value}>{value}</code>)}</div></div>
          ))}
        </div>
      </article>
    </div>
  );
}
