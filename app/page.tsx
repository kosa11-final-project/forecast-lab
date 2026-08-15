import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stockit Demand Forecast Lab",
  description: "Stockit 90일 수요예측 실험 기록과 모델 비교",
  other: { "codex-preview": "development" },
};

const sections = [
  ["01", "프로젝트 개요", "overview"], ["02", "데이터 구성", "data"],
  ["03", "실험 설계", "design"], ["04", "Baseline", "baseline"],
  ["05", "AutoML 실험", "automl"], ["06", "LightGBM 실험", "lightgbm"],
  ["07", "XGBoost 실험", "xgboost"], ["08", "모델 비교", "models"],
  ["09", "최종 Test", "test"], ["10", "운영 적용", "production"],
];

const heroMetrics = [
  ["9,277", "시계열"], ["90일", "예측 Horizon"],
  ["1.3287", "Validation MAE"], ["0.63569", "Validation R²"],
];

const calendarFeatures = [
  "day_of_week", "is_weekend", "day_of_month", "week_of_year", "month_of_year", "quarter_of_year",
  "is_month_start", "is_month_end", "holiday_code", "is_public_holiday",
  "is_day_before_public_holiday", "is_day_after_public_holiday",
];

export default function Home() {
  return (
    <main>
      <nav className="topbar" aria-label="주요 탐색">
        <a className="brand" href="#overview"><span>ST</span> Forecast Lab</a>
        <div className="nav-links"><a href="#automl">Experiments</a><a href="#models">Models</a><a href="#production">Roadmap</a></div>
        <span className="status"><i /> E1 complete</span>
      </nav>

      <section className="hero" id="overview">
        <div className="eyebrow">STOCKIT · DEMAND INTELLIGENCE / 2026</div>
        <div className="hero-grid">
          <div><p className="kicker">Forecasting inventory,<br />one signal at a time.</p><h1>Demand<br /><em>Forecast Lab</em></h1></div>
          <div className="hero-aside">
            <p>SKU와 판매지점 단위의 일별 수요를 90일 앞서 예측합니다. 재현 가능한 실험과 명확한 의사결정으로 운영 가능한 모델을 찾습니다.</p>
            <div className="phase"><span>현재 단계</span><strong>AutoML 진단 완료</strong><b>LightGBM 실험 준비 중 →</b></div>
          </div>
        </div>
        <div className="metric-strip">
          {heroMetrics.map(([value, label], index) => <div className="metric" key={label}><small>0{index + 1}</small><strong>{value}</strong><span>{label}</span></div>)}
        </div>
      </section>

      <div className="page-shell">
        <aside className="side-index" aria-label="섹션 목차">
          <p>LAB INDEX</p>
          {sections.map(([num, label, id]) => <a key={id} href={`#${id}`}><span>{num}</span>{label}</a>)}
        </aside>

        <div className="content">
          <section className="lab-section project" aria-labelledby="project-title">
            <header className="section-head"><span>MISSION</span><h2 id="project-title">예측을 넘어,<br />재고 의사결정으로.</h2></header>
            <div className="two-col">
              <p className="lead">Stockit Demand Forecast Lab은 모델 점수만 기록하지 않습니다. 데이터 분할, 누수 방지, 실험 비용과 실패까지 남겨 실제 운영에 쓸 수 있는 90일 수요예측 파이프라인을 설계합니다.</p>
              <dl className="spec-list"><div><dt>Grain</dt><dd>sku_id × sales_point_id × day</dd></div><div><dt>Target</dt><dd>net_sales_qty</dd></div><div><dt>Time</dt><dd>sales_date</dd></div><div><dt>Objective</dt><dd>90-day daily demand</dd></div></dl>
            </div>
          </section>

          <section className="lab-section" id="data" aria-labelledby="data-title">
            <header className="section-head"><span>02 / DATA</span><h2 id="data-title">데이터 구성</h2><p>1,096일의 이력을 고정 시점 기준으로 분리했습니다.</p></header>
            <div className="data-total"><strong>10,167,592</strong><span>total observations</span><b>2023.08.01 — 2026.07.31</b></div>
            <div className="split-bar" aria-label="데이터 분할 비율"><i className="train" /><i className="validation" /><i className="test" /></div>
            <div className="split-grid">
              <article><span className="dot train-dot" />TRAIN <strong>8,497,732</strong><small>2023.08.01 — 2026.02.01</small></article>
              <article><span className="dot validation-dot" />VALIDATION <strong>834,930</strong><small>2026.02.02 — 2026.05.02</small></article>
              <article><span className="dot test-dot" />TEST · LOCKED <strong>834,930</strong><small>2026.05.03 — 2026.07.31</small></article>
            </div>
            <div className="guardrail"><span>DATA GUARDRAIL 01</span><p>38개 시계열(0.41%)은 전체 기간 수요가 항상 0입니다. 전체 점수와 함께 이 그룹의 오차·음수 예측률을 별도로 확인합니다.</p></div>
          </section>

          <section className="lab-section" id="design" aria-labelledby="design-title">
            <header className="section-head"><span>03 / EXPERIMENT DESIGN</span><h2 id="design-title">한 번의 Test,<br />같은 조건의 비교.</h2></header>
            <div className="principles">
              <article><b>01</b><h3>Fixed origin</h3><p>E0와 모든 후속 모델이 동일한 Train / Validation / Test 경계를 사용합니다.</p></article>
              <article><b>02</b><h3>Leakage safe</h3><p>Lag와 Rolling은 예측 시점 이전 값으로만 만들고 90일 재귀 예측으로 검증합니다.</p></article>
              <article><b>03</b><h3>Single test</h3><p>Validation으로 후보 하나를 선택한 뒤 잠근 Test 90일을 단 한 번 평가합니다.</p></article>
            </div>
          </section>

          <section className="lab-section" id="baseline" aria-labelledby="baseline-title">
            <header className="section-head"><span>04 / BASELINE</span><h2 id="baseline-title">가장 단순한 모델이<br />우리의 기준점.</h2></header>
            <div className="baseline-row"><div><span>MA</span><strong>07</strong><small>최근 7일 평균</small></div><div><span>MA</span><strong>14</strong><small>최근 14일 평균</small></div><div><span>MA</span><strong>30</strong><small>최근 30일 평균</small></div><p>예정<br /><b>Local reproducible baseline</b></p></div>
          </section>

          <section className="lab-section" id="automl" aria-labelledby="automl-title">
            <header className="section-head"><span>05 / AUTOML</span><h2 id="automl-title">두 번의 실험,<br />하나의 결과.</h2><p>AutoML은 빠른 기준선과 플랫폼 적합성 진단에 사용했습니다.</p></header>
            <div className="experiment-grid">
              <article className="experiment-card selected"><header><span>E0 · BASELINE</span><b>REGISTERED</b></header><h3>VotingEnsemble</h3><p>AutoML 기본 시계열 실험</p><div className="mini-metrics"><div><small>MAE</small><strong>1.3287</strong></div><div><small>RMSE</small><strong>2.0933</strong></div><div><small>R²</small><strong>0.63569</strong></div><div><small>NRMSE</small><strong>0.24892</strong></div></div><footer>stockit-demand-e0:1</footer></article>
              <article className="experiment-card"><header><span>E1 · CALENDAR</span><b>NOT PROMOTED</b></header><h3>VotingEnsemble</h3><p>12개 명시적 달력 Feature 추가</p><div className="mini-metrics"><div><small>MAE</small><strong>1.3287</strong></div><div><small>RMSE</small><strong>2.0933</strong></div><div><small>R²</small><strong>0.63569</strong></div><div><small>NRMSE</small><strong>0.24892</strong></div></div><footer>Metrics identical to E0</footer></article>
            </div>
            <div className="feature-cloud">{calendarFeatures.map(feature => <code key={feature}>{feature}</code>)}</div>
            <div className="decision"><span>DECISION / 2026.08.15</span><h3>AutoML 확장을 여기서 중단합니다.</h3><p>5개 Trial이 Naive·SeasonalNaive·Average·SeasonalAverage·VotingEnsemble에 소진됐고, 외생 변수를 활용하는 학습 모델이 선택되지 않았습니다. 달력 Feature를 추가했지만 E0와 모든 핵심 지표가 동일했습니다.</p><ul><li>AutoML 자체가 날짜 기반 Feature를 자동 생성</li><li>명시적 Feature 효과를 분리해 검증하기 어려움</li><li>64 GiB VM으로 비용·메모리 요구량 증가</li></ul></div>
          </section>

          <section className="lab-section model-plan" id="lightgbm" aria-labelledby="lgbm-title">
            <header className="section-head"><span>06 / PRIMARY MODEL</span><h2 id="lgbm-title">LightGBM</h2><i className="planned">NEXT</i></header>
            <div className="model-layout"><div><p className="lead">Feature 효과가 모델에 직접 반영되는 첫 번째 명시적 학습 실험입니다. 속도와 메모리 효율을 우선해 주 모델 후보로 선정합니다.</p></div><div className="recipe"><h3>EXPERIMENT RECIPE</h3><p><span>Lag</span>7 · 14 · 28 · 56</p><p><span>Rolling mean</span>7 · 14 · 28</p><p><span>Rolling std</span>7 · 28</p><p><span>Calendar</span>weekday · weekend · month</p><p><span>Validation</span>90-day recursive</p></div></div>
          </section>

          <section className="lab-section model-plan muted" id="xgboost" aria-labelledby="xgb-title">
            <header className="section-head"><span>07 / CHALLENGER</span><h2 id="xgb-title">XGBoost</h2><i className="planned">QUEUED</i></header>
            <div className="model-layout"><p className="lead">LightGBM의 유효성이 확인된 뒤 동일한 Feature와 분할로 비교합니다. 목적은 모델 수를 늘리는 것이 아니라 편향이 다른 강력한 Challenger를 확보하는 것입니다.</p><div className="recipe"><h3>ENTRY CONDITION</h3><p><span>01</span>LightGBM 파이프라인 안정화</p><p><span>02</span>Validation 지표 개선 확인</p><p><span>03</span>동일 Feature / 동일 Budget</p></div></div>
          </section>

          <section className="lab-section" id="models" aria-labelledby="models-title">
            <header className="section-head"><span>08 / SCOREBOARD</span><h2 id="models-title">모델 비교</h2></header>
            <div className="table-wrap"><table><thead><tr><th>MODEL</th><th>STATUS</th><th>MAE</th><th>RMSE</th><th>R²</th><th>NRMSE ↓</th></tr></thead><tbody><tr className="current"><td>E0 · VotingEnsemble</td><td><b>Candidate</b></td><td>1.3287</td><td>2.0933</td><td>0.63569</td><td>0.24892</td></tr><tr><td>E1 · Calendar AutoML</td><td>Not promoted</td><td>1.3287</td><td>2.0933</td><td>0.63569</td><td>0.24892</td></tr><tr><td>MA(7/14/30)</td><td>Planned</td><td>—</td><td>—</td><td>—</td><td>—</td></tr><tr><td>LightGBM</td><td>Next</td><td>—</td><td>—</td><td>—</td><td>—</td></tr><tr><td>XGBoost</td><td>Queued</td><td>—</td><td>—</td><td>—</td><td>—</td></tr></tbody></table></div>
            <p className="score-note">주 지표는 NRMSE. MAE·RMSE·R²와 시계열별 오차, 항상 0인 시계열, 음수 예측률을 함께 판단합니다.</p>
          </section>

          <section className="lab-section" id="test" aria-labelledby="test-title">
            <header className="section-head"><span>09 / FINAL TEST</span><h2 id="test-title">잠긴 90일,<br />단 한 번의 평가.</h2></header>
            <div className="test-lock"><span>TEST WINDOW</span><strong>2026.05.03 — 2026.07.31</strong><p>Validation 기준으로 최종 후보 1개를 선정하기 전까지 열지 않습니다.</p><i>LOCKED</i></div>
          </section>

          <section className="lab-section" id="production" aria-labelledby="production-title">
            <header className="section-head"><span>10 / PRODUCTION</span><h2 id="production-title">예측에서 적재까지.</h2></header>
            <ol className="pipeline"><li><b>01</b><span>Forecast</span><p>SKU × 판매지점별<br />90일 일별 예측</p></li><li><b>02</b><span>Post-process</span><p>음수 예측 분리 확인<br />필요 시 0으로 Clip</p></li><li><b>03</b><span>Aggregate</span><p>D7 · D14 · D30<br />D60 · D90 누적</p></li><li><b>04</b><span>Load</span><p>DEMAND_FORECAST<br />적재 형식 변환</p></li></ol>
            <div className="production-notes"><div><span>TRACEABILITY</span><p>사용 Feature와 버전을 <code>feature_definition_json</code>으로 기록합니다.</p></div><div><span>INTEGRATION GATE</span><p>Backend Repository의 조회 방식과 일별·기간 누적 저장 계약을 최종 확인합니다.</p></div></div>
          </section>

          <footer className="site-footer"><div><span>ST</span><b>Stockit Demand Forecast Lab</b></div><p>Baseline → AutoML → Explicit Models → Test → Production</p><a href="#overview">Back to top ↑</a></footer>
        </div>
      </div>
    </main>
  );
}
