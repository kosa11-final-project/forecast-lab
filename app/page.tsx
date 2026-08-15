import type { Metadata } from "next";
import { ExperimentTabs } from "./ExperimentTabs";

export const metadata: Metadata = {
  title: "Stockit 수요예측 실험 보고서",
  description: "SKU·판매지점별 향후 90일 판매량 예측 모델의 개발 및 검증 결과",
};

const sections = [
  ["01", "프로젝트 개요", "overview"], ["02", "전체 실험 계획", "roadmap"],
  ["03", "데이터 구성", "data"], ["04", "검증 원칙", "design"],
  ["05", "이동평균 Baseline", "baseline"], ["06", "AutoML 결과", "automl"],
  ["07", "LightGBM 결과", "lightgbm"], ["08", "XGBoost 계획", "xgboost"],
  ["09", "모델 비교", "models"], ["10", "최종 Test", "test"], ["11", "운영 적용", "production"],
  ["12", "Cold Start", "cold-start"], ["13", "위험등급 연계", "risk"],
  ["14", "배치 적재", "batch"], ["15", "API 계약", "api-contract"],
];

const heroMetrics = [
  ["9,277", "운영 예측 시계열"], ["90일", "예측 Horizon"],
  ["834,930", "일별 Forecast 행"], ["9,277", "누적 Forecast 행"],
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
        <a className="brand" href="#overview"><span>ST</span> 수요예측 실험 보고서</a>
        <div className="nav-links">
          <a href="#overview">프로젝트 개요</a><a href="#automl">실험 결과</a><a href="#production">운영 결과</a><a href="#cold-start">Cold Start</a><a href="#api-contract">API 계약</a>
        </div>
        <span className="status"><i /> 운영 Forecast 완료</span>
      </nav>

      <section className="hero" id="overview">
        <div className="eyebrow">Stockit Demand Forecast Lab · 실험 진행 현황</div>
        <div className="hero-grid">
          <div><h1>Stockit 수요예측<br /><em>실험 보고서</em></h1><p className="hero-description">SKU·판매지점별 향후 90일 판매량을 예측하기 위한 모델 개발 및 검증 결과를 공유합니다.</p></div>
          <div className="status-summary" aria-label="현재 실험 상태">
            <div><span>운영 Forecast Run</span><strong>silver_wolf_0tl6s2x4ms · 완료</strong></div>
            <div><span>Azure Model</span><strong>stockit-demand-lightgbm:1</strong></div>
            <div><span>예측 기간</span><strong>2026.08.01 — 2026.10.29</strong></div>
            <div><span>다음 작업</span><strong>Cold Start · 위험등급 · Backend 연동</strong></div>
          </div>
        </div>
        <div className="metric-strip">
          {heroMetrics.map(([value, label], index) => <div className="metric" key={label}><small>0{index + 1}</small><div><strong>{value}</strong><span>{label}</span></div></div>)}
        </div>
      </section>

      <div className="page-shell">
        <aside className="side-index" aria-label="발표 목차"><p>발표 목차</p>{sections.map(([num, label, id]) => <a key={id} href={`#${id}`}><span>{num}</span>{label}</a>)}</aside>
        <div className="content">
          <section className="lab-section project" aria-labelledby="project-title">
            <header className="section-head"><span>프로젝트 개요</span><h2 id="project-title">프로젝트 목표</h2></header>
            <div className="two-col">
              <p className="lead">Stockit Demand Forecast Lab은 SKU·판매지점별 90일 수요를 예측하고, 해당 결과를 재고 조회와 위험재고 판단에 활용하기 위한 모델 개발 프로젝트입니다. 모델 성능뿐만 아니라 데이터 분할, 데이터 누수 방지, 실험 재현성, 운영 적재 형식까지 함께 검증합니다.</p>
              <dl className="spec-list"><div><dt>Grain</dt><dd>sku_id × sales_point_id × day</dd></div><div><dt>Target</dt><dd>net_sales_qty</dd></div><div><dt>Time</dt><dd>sales_date</dd></div><div><dt>Objective</dt><dd>90일 일별 수요예측</dd></div></dl>
            </div>
          </section>

          <section className="lab-section roadmap-section" id="roadmap" aria-labelledby="roadmap-title">
            <header className="section-head"><span>실험 로드맵</span><h2 id="roadmap-title">현재 실험 진행 계획</h2><p>최종 Test와 운영 Forecast를 완료하고 Azure Model을 등록했습니다. 모델 실험 단계는 종료했으며, 현재는 신규 SKU Cold Start와 위험등급·배치·비동기 API의 Backend 연동 계약을 설계합니다.</p></header>
            <ExperimentTabs />
          </section>

          <section className="lab-section" id="data" aria-labelledby="data-title">
            <header className="section-head"><span>데이터 구성</span><h2 id="data-title">데이터 구성 및 분할</h2><p>1,096일의 데이터를 동일한 고정 시점 기준으로 Train, Validation, Test로 분할했습니다.</p></header>
            <div className="data-total"><strong>10,167,592</strong><span>전체 건수</span><b>2023.08.01 — 2026.07.31</b></div>
            <div className="split-bar" aria-label="데이터 분할 비율"><i className="train" /><i className="validation" /><i className="test" /></div>
            <div className="split-grid">
              <article><span className="dot train-dot" />TRAIN <strong>8,497,732건</strong><small>2023.08.01 — 2026.02.01</small></article>
              <article><span className="dot validation-dot" />VALIDATION <strong>834,930건</strong><small>2026.02.02 — 2026.05.02</small></article>
              <article><span className="dot test-dot" />TEST · 최종 평가 완료 <strong>834,930건</strong><small>2026.05.03 — 2026.07.31</small></article>
            </div>
            <div className="guardrail"><span>별도 검증 대상</span><p>전체 기간 판매량이 항상 0인 시계열은 38개로 전체의 0.41%입니다. 전체 성능과 별도로 해당 그룹의 오차 및 음수 예측 발생률을 확인합니다.</p></div>
          </section>

          <section className="lab-section" id="design" aria-labelledby="design-title">
            <header className="section-head"><span>실험 설계</span><h2 id="design-title">실험 비교 및 검증 원칙</h2><p>모든 모델과 Feature 조합을 동일한 조건으로 비교하고 Test 데이터의 반복 사용을 방지합니다.</p></header>
            <div className="principles four">
              <article><b>01</b><h3>동일한 기간 분할</h3><p>모든 실험에서 동일한 Train, Validation, Test 기간을 사용합니다.</p></article>
              <article><b>02</b><h3>데이터 누수 방지</h3><p>Lag와 Rolling Feature는 예측 시점 이전 데이터만 사용해 생성합니다.</p></article>
              <article><b>03</b><h3>90일 기준 평가</h3><p>모든 모델을 90일 Forecast Horizon과 재귀 예측 방식으로 평가합니다.</p></article>
              <article><b>04</b><h3>Test 1회 평가</h3><p>Validation에서 후보를 결정한 후 Test는 최종 후보 하나에만 사용합니다.</p></article>
            </div>
          </section>

          <section className="lab-section" id="baseline" aria-labelledby="baseline-title">
            <header className="section-head"><span>Baseline · 완료</span><h2 id="baseline-title">이동평균 Baseline 평가 결과</h2><p>MA(7), MA(14), MA(30)을 Validation 90일 fixed-origin recursive 방식으로 평가했습니다. 실제 Validation Target은 이력에 넣지 않았으며 Train에서 항상 0인 38개 시계열은 0으로 예측했습니다.</p></header>
            <div className="table-wrap baseline-table"><table><thead><tr><th>모델</th><th>MAE</th><th>RMSE</th><th>R²</th><th>Macro NRMSE</th><th>판단</th></tr></thead><tbody><tr><td>MA(7)</td><td>1.401764</td><td>2.250167</td><td>0.579921</td><td>0.271146</td><td>기준선</td></tr><tr><td>MA(14)</td><td>1.328307</td><td>2.150143</td><td>0.616438</td><td>0.260025</td><td>기준선</td></tr><tr className="current"><td><b>MA(30)</b></td><td>1.293393</td><td>2.100677</td><td>0.633883</td><td>0.254418</td><td><b>최강 MA 기준선</b></td></tr></tbody></table></div>
            <div className="baseline-conclusion"><span>해석 및 결정</span><p>Window가 길어질수록 네 지표가 모두 개선됐습니다. MA(30)을 공식 이동평균 기준선으로 사용하며, E1 LightGBM 상시 0 정책은 MA(30) 대비 MAE 약 6.0%, RMSE 약 2.68% 개선했습니다.</p></div>
          </section>

          <section className="lab-section" id="automl" aria-labelledby="automl-title">
            <header className="section-head"><span>AutoML · 완료</span><h2 id="automl-title">AutoML 실험 결과</h2><p>Azure AutoML을 사용해 기본 시계열 모델의 성능과 실행 가능성을 검증했습니다.</p></header>
            <div className="table-wrap automl-table"><table><thead><tr><th>구분</th><th>E0 Baseline</th><th>E1 Calendar</th></tr></thead><tbody><tr><td>선정 모델</td><td>VotingEnsemble</td><td>VotingEnsemble</td></tr><tr><td>MAE</td><td>1.3287</td><td>1.3287</td></tr><tr><td>RMSE</td><td>2.0933</td><td>2.0933</td></tr><tr><td>R²</td><td>0.63569</td><td>0.63569</td></tr><tr><td>NRMSE</td><td>0.24892</td><td>0.24892</td></tr><tr><td>판단</td><td><b>기준 모델 유지</b></td><td>후보 제외</td></tr></tbody></table></div>
            <details className="feature-details"><summary>E1 Calendar Feature 12개 보기</summary><div className="feature-cloud">{calendarFeatures.map(feature => <code key={feature}>{feature}</code>)}</div></details>
            <div className="report-blocks">
              <article><span>결과 해석</span><p>E1에서는 12개의 Calendar Feature를 추가했지만 E0와 예측 결과 및 평가 지표가 동일했습니다. 실행된 5개 Trial이 Naive, SeasonalNaive, Average, SeasonalAverage 및 VotingEnsemble로 구성되어 추가 Feature를 사용하는 회귀 모델이 탐색되지 않았기 때문입니다.</p></article>
              <article><span>실험 결정</span><ul><li>E0를 이후 실험의 Validation 비교 기준으로 유지</li><li>E1은 등록 및 배포하지 않음</li><li>AutoML Trial 확대 실험은 진행하지 않음</li><li>LightGBM을 고정하여 Feature 효과를 직접 비교</li></ul></article>
            </div>
          </section>

          <section className="lab-section model-plan" id="lightgbm" aria-labelledby="lgbm-title">
            <header className="section-head"><span>LightGBM · Ablation 완료 · 후보 선정</span><h2 id="lgbm-title">E1 LightGBM Feature 검증 결과</h2><p>동일한 데이터·파라미터·재귀 검증 조건에서 Calendar, Lag, Rolling Feature의 기여도를 분리해 확인했습니다. Test는 사용하지 않았고 모델 등록·배포도 진행하지 않았습니다.</p><i className="planned done">후보 선정</i></header>
            <div className="run-summary"><div><span>Azure Job ID</span><strong>tough_ship_2n7nk8qrwz</strong></div><div><span>Train</span><strong>stockit-demand-e0-train:3 · 8,497,732행</strong></div><div><span>Validation</span><strong>stockit-demand-e0-validation:2 · 834,930행</strong></div><div><span>시계열</span><strong>9,277개</strong></div></div>
            <div className="table-wrap ablation-table"><table><thead><tr><th>Variant</th><th>Feature set</th><th>Azure Job</th><th>MAE</th><th>RMSE</th><th>R²</th><th>Macro NRMSE</th></tr></thead><tbody><tr><td>LGBM-0</td><td>ID + Calendar</td><td>honest_morning_6l1x2bh51l</td><td>1.386455</td><td>2.225179</td><td>0.589199</td><td>0.268132</td></tr><tr><td>LGBM-1</td><td>ID + Calendar + Lag</td><td>brave_boniato_8dtnqwprbq</td><td>1.274493</td><td>2.083455</td><td>0.639862</td><td>0.261626</td></tr><tr className="review"><td><b>LGBM-2</b></td><td><b>ID + Calendar + Lag + Rolling</b></td><td>tough_ship_2n7nk8qrwz</td><td><b>1.215846</b></td><td><b>2.044311</b></td><td><b>0.653267</b></td><td><b>0.255497</b></td></tr></tbody></table></div>
            <div className="ablation-conclusion"><span>Feature 기여도</span><p>Lag 추가 시 Calendar-only 대비 MAE 8.08%, RMSE 6.37%가 개선됐습니다. Rolling 추가 시 Lag-only 대비 MAE 4.60%, RMSE 1.88%가 다시 개선되어 LGBM-2를 Validation 후보로 선정했습니다.</p></div>
            <div className="table-wrap lgbm-comparison"><table><thead><tr><th>Validation 지표</th><th>E0 VotingEnsemble</th><th>E1-L 상시 0 정책</th><th>E0 대비 변화</th></tr></thead><tbody><tr><td>MAE</td><td>1.328700</td><td><b>1.215846</b></td><td className="improved">8.49% 개선</td></tr><tr><td>RMSE</td><td>2.093300</td><td><b>2.044311</b></td><td className="improved">2.34% 개선</td></tr><tr><td>R²</td><td>0.635690</td><td><b>0.653267</b></td><td className="improved">+0.017577</td></tr><tr><td>Macro NRMSE</td><td>0.248920</td><td>0.255497*</td><td>계산 정의 상이</td></tr></tbody></table></div>
            <div className="metric-caution"><b>* 지표 비교 주의</b><p>E0 NRMSE 0.248920은 Azure AutoML 계산이고 E1-L 0.255497은 constant-range 시계열에 unit denominator를 사용하는 custom evaluator 결과입니다. 완전히 동일한 구현이 아니므로 방향성 참고로만 사용합니다.</p></div>
            <div className="lgbm-detail-grid">
              <article className="feature-importance"><h3>Feature importance · gain 기준</h3><div><span>rolling_mean_28</span><i><b style={{ width: "77.67%" }} /></i><strong>77.67%</strong></div><div><span>rolling_mean_14</span><i><b style={{ width: "7.79%" }} /></i><strong>7.79%</strong></div><div><span>rolling_std_28</span><i><b style={{ width: "4.66%" }} /></i><strong>4.66%</strong></div><div><span>day_of_week</span><i><b style={{ width: "2.66%" }} /></i><strong>2.66%</strong></div><div><span>lag_56</span><i><b style={{ width: "2.25%" }} /></i><strong>2.25%</strong></div></article>
              <article className="zero-rule"><span>상시 0 정책 · 적용</span><h3>Train 기준 38개 시계열의 예측을 0으로 고정</h3><dl><div><dt>MAE</dt><dd>1.215846</dd></div><div><dt>RMSE</dt><dd>2.044311</dd></div><div><dt>R²</dt><dd>0.653267</dd></div><div><dt>Macro NRMSE</dt><dd>0.255497</dd></div></dl><p>이 정책은 이동평균 Baseline과 E1 LightGBM에 동일하게 적용했습니다.</p></article>
            </div>
            <div className="leakage-note"><span>누수 방지 검증</span><p>Validation 90일을 날짜 순서로 예측하며 실제 Validation Target을 이력에 넣지 않습니다. 이전 날짜의 예측값만 다음 날짜 Lag/Rolling Feature에 재귀 입력했습니다.</p></div>
          </section>

          <section className="lab-section model-plan muted" id="xgboost" aria-labelledby="xgb-title">
            <header className="section-head"><span>XGBoost · 보류</span><h2 id="xgb-title">XGBoost 비교 실험</h2><p>LightGBM ablation에서 Feature 효과와 Validation 후보가 명확해졌으므로 현재는 XGBoost를 추가 실행하지 않습니다. 별도 비교 필요성이 생길 때만 동일 Feature와 평가 기준으로 한 번 수행합니다.</p><i className="planned">조건부 보류</i></header>
            <div className="model-layout"><div className="lead small-lead">현재 실행 결과는 없습니다. Test 이전의 추가 튜닝 범위를 넓히지 않고 선정된 LGBM-2 구성을 고정합니다.</div><div className="recipe"><h3>현재 판단</h3><p><span>01</span>공식 MA Baseline 평가 완료</p><p><span>02</span>LightGBM ablation 및 후보 선정 완료</p><p><span>03</span>XGBoost 추가 학습은 필요 시 별도 실험</p></div></div>
          </section>

          <section className="lab-section" id="models" aria-labelledby="models-title">
            <header className="section-head"><span>모델 비교</span><h2 id="models-title">모델 성능 비교</h2></header>
            <div className="table-wrap"><table><thead><tr><th>MODEL / SPLIT</th><th>상태</th><th>MAE</th><th>RMSE</th><th>R²</th><th>Macro NRMSE ↓</th></tr></thead><tbody><tr className="current"><td>E0 · VotingEnsemble / Validation</td><td><b>기준 모델</b></td><td>1.328700</td><td>2.093300</td><td>0.635690</td><td>0.248920*</td></tr><tr><td>E1-C · Calendar AutoML / Validation</td><td>후보 제외</td><td>1.328700</td><td>2.093300</td><td>0.635690</td><td>0.248920*</td></tr><tr><td>B0 · MA(7) / Validation</td><td>평가 완료</td><td>1.401764</td><td>2.250167</td><td>0.579921</td><td>0.271146</td></tr><tr><td>B0 · MA(14) / Validation</td><td>평가 완료</td><td>1.328307</td><td>2.150143</td><td>0.616438</td><td>0.260025</td></tr><tr><td>B0 · MA(30) / Validation</td><td>최강 MA 기준선</td><td>1.293393</td><td>2.100677</td><td>0.633883</td><td>0.254418</td></tr><tr><td>LGBM-0 · Calendar-only / Validation</td><td>ablation 완료</td><td>1.386455</td><td>2.225179</td><td>0.589199</td><td>0.268132</td></tr><tr><td>LGBM-1 · Calendar + Lag / Validation</td><td>ablation 완료</td><td>1.274493</td><td>2.083455</td><td>0.639862</td><td>0.261626</td></tr><tr className="review"><td>LGBM-2 · Lag + Rolling / Validation</td><td><b>후보 선정</b></td><td>1.215846</td><td>2.044311</td><td>0.653267</td><td>0.255497*</td></tr><tr className="final-result"><td>LGBM-2 · Lag + Rolling / Test</td><td><b>최종 성능 동결</b></td><td>1.338165</td><td>2.247809</td><td>0.627253</td><td>0.257574*</td></tr><tr><td>XGBoost</td><td>조건부 보류</td><td>—</td><td>—</td><td>—</td><td>—</td></tr></tbody></table></div>
            <div className="evaluation"><h3>평가 기준</h3><ul><li><b>행 단위 지표</b> MAE, RMSE, R²</li><li><b>시계열 균형 지표</b> Macro NRMSE</li><li>지표 계산 정의 일치 여부</li><li>항상 0인 38개 시계열 성능</li><li>음수 예측 발생률</li><li>D+7, D+14, D+30, D+60, D+90 누적 오차</li></ul><p>* E0는 Azure AutoML 계산, LGBM은 constant-range 시계열에 unit denominator를 사용하는 custom 계산입니다. NRMSE의 직접 비교에는 주의가 필요하지만, 동일 custom evaluator를 사용한 LightGBM 세 변형에서는 LGBM-2가 가장 우수했습니다.</p></div>
          </section>

          <section className="lab-section" id="test" aria-labelledby="test-title">
            <header className="section-head"><span>최종 Test · 완료 · 결과 동결</span><h2 id="test-title">최종 Test 평가 결과</h2><p>선정된 LGBM-2 구성을 Train v3와 Validation v2로 재학습하고 Test v4를 90일 fixed-origin recursive 방식으로 단 한 번 평가했습니다.</p></header>
            <div className="run-summary test-summary"><div><span>Azure Job ID</span><strong>stoic_deer_h8qqd422qz</strong></div><div><span>재학습 데이터</span><strong>Train + Validation · 9,332,662행</strong></div><div><span>Test 예측</span><strong>834,930행 · 결측치 0개</strong></div><div><span>시계열</span><strong>9,277개 · 상시 0 정책 36개</strong></div></div>
            <div className="table-wrap test-comparison"><table><thead><tr><th>Split</th><th>MAE</th><th>RMSE</th><th>R²</th><th>Macro NRMSE</th></tr></thead><tbody><tr><td>Validation candidate</td><td>1.215846</td><td>2.044311</td><td>0.653267</td><td>0.255497</td></tr><tr className="final-result"><td><b>Final Test</b></td><td><b>1.338165</b></td><td><b>2.247809</b></td><td><b>0.627253</b></td><td><b>0.257574</b></td></tr></tbody></table></div>
            <div className="test-lock completed"><span>최종 일반화 성능</span><strong>MAE 1.338165 · R² 0.627253</strong><p>Validation 대비 Test MAE는 10.06%, RMSE는 9.95% 증가했고 R²는 0.026 감소했습니다. 일반화 성능은 유지됐으며 이 결과를 최종 값으로 동결합니다.</p><i>Test 기반 재튜닝 금지</i></div>
          </section>

          <section className="lab-section" id="production" aria-labelledby="production-title">
            <header className="section-head"><span>운영 적용 · Forecast 완료</span><h2 id="production-title">운영 90일 예측 결과</h2><p>전체 이력으로 고정 모델을 재학습해 2026.08.01부터 90일의 일별·누적 예측을 생성하고 Azure Model을 등록했습니다. Backend DB 적재와 Cold Start 라우팅은 별도 연동 범위입니다.</p><i className="planned done">완료</i></header>
            <div className="run-summary production-summary"><div><span>Forecast Run</span><strong>silver_wolf_0tl6s2x4ms</strong></div><div><span>Azure Model</span><strong>stockit-demand-lightgbm:1</strong></div><div><span>전체 학습 이력</span><strong>10,167,592행 · 2023.08.01~2026.07.31</strong></div><div><span>미래 예측 구간</span><strong>2026.08.01~2026.10.29 · 90일</strong></div></div>
            <div className="production-contract"><article><span>일별 산출물</span><h3>future_daily_predictions.csv</h3><p>SKU·판매지점·예측일별 <code>predicted_qty</code> 834,930행을 생성했습니다. 미래 실제값 없이 이전 예측만 Lag/Rolling에 재귀 입력합니다.</p></article><article><span>누적 산출물</span><h3>demand_forecast.csv</h3><p>9,277개 시계열의 D+7·14·30·60·90 누적 예측을 생성했습니다. 서비스 적재 전 행별 품질 메타데이터를 결합해야 합니다.</p></article></div>
            <div className="quality-strip"><div><strong>0</strong><span>결측</span></div><div><strong>0</strong><span>음수</span></div><div><strong>0</strong><span>중복</span></div><div><strong>0</strong><span>누적 단조 위반</span></div></div>
            <ol className="pipeline six"><li><b>01</b><span>최종 모델 등록</span><p>stockit-demand-<br />lightgbm:1</p></li><li><b>02</b><span>일별 예측 생성</span><p>834,930행<br />생성 완료</p></li><li><b>03</b><span>품질 검증</span><p>결측·음수·중복<br />위반 0건</p></li><li><b>04</b><span>누적 수요 계산</span><p>D+7 · D+14 · D+30<br />D+60 · D+90</p></li><li><b>05</b><span>Cold Start 보완</span><p>신규·단기 이력<br />행별 Fallback</p></li><li><b>06</b><span>Staging 검증</span><p>Coverage·FK·Schema<br />검증 후 Publish</p></li><li><b>07</b><span>위험등급 재계산</span><p>예측 신뢰도와 재고<br />요소를 함께 반영</p></li></ol>
          </section>

          <section className="lab-section" id="cold-start" aria-labelledby="cold-start-title">
            <header className="section-head"><span>운영 연동 설계</span><h2 id="cold-start-title">신규 SKU Cold Start 라우팅</h2><p>판매 이력 56일 미만은 오류나 전체 롤백 사유가 아닙니다. 활성 SKU × 판매 가능 판매처 또는 현재 재고 조합으로 예측 Universe를 먼저 만들고 판매 이력을 LEFT JOIN해 행별 예측 경로를 선택합니다.</p></header>
            <div className="universe-rule"><span>예측 Universe</span><strong>활성 SKU × 판매 가능 판매처</strong><b>또는</b><strong>현재 재고가 존재하는 SKU × 판매처</strong><p>SALES_DAILY에 이미 존재하는 조합만 사용하는 방식은 신규 SKU가 누락되므로 금지합니다.</p></div>
            <div className="table-wrap routing-table"><table><thead><tr><th>조건</th><th>예측 경로</th><th>저장 source</th><th>기본 신뢰도</th></tr></thead><tbody><tr className="final-result"><td>이력 56일 이상</td><td>등록 LightGBM</td><td>LIGHTGBM</td><td>HIGH</td></tr><tr><td>같은 SKU가 다른 판매처에 이력 있음</td><td>타 판매처 패턴 × 판매처 규모 보정</td><td>SAME_SKU_OTHER_POINT</td><td>MEDIUM</td></tr><tr><td>완전 신규 SKU</td><td>동일 카테고리·판매처 중앙값, 가능하면 가격·포장 유사군</td><td>CATEGORY_MEDIAN</td><td>LOW</td></tr><tr><td>해당 판매처 유사 이력 없음</td><td>카테고리 전체 중앙값 × 판매처 규모</td><td>CATEGORY_MEDIAN</td><td>LOW</td></tr><tr className="manual-row"><td>근거 데이터 없음</td><td>초기값 입력 또는 수동 검토</td><td>MANUAL_INITIAL</td><td>LOW</td></tr></tbody></table></div>
            <div className="no-zero-rule"><b>임의 0 예측 금지</b><p>신규 SKU를 0으로 예측하면 부족 위험이 숨겨질 수 있습니다. Fallback 근거가 없으면 0을 채우지 않고 수동 검토 대상으로 남깁니다.</p></div>
            <div className="metadata-grid"><article><span>forecast_source</span><p>LIGHTGBM · SAME_SKU_OTHER_POINT · CATEGORY_MEDIAN · MANUAL_INITIAL</p></article><article><span>confidence_level</span><p>HIGH · MEDIUM · LOW</p></article><article><span>history_days</span><p>SKU·판매처 조합에서 실제 확보된 이력 일수</p></article><article><span>fallback_reason</span><p>Fallback 세부 원인과 선택된 보정 경로</p></article></div>
            <p className="contract-note">이 값은 모델 버전 전체가 아니라 예측 행마다 달라지므로 <code>DEMAND_FORECAST</code> 또는 별도 Quality 테이블에 저장해야 합니다.</p>
          </section>

          <section className="lab-section" id="risk" aria-labelledby="risk-title">
            <header className="section-head"><span>위험등급 연계</span><h2 id="risk-title">예측은 위험 판단의 한 입력입니다</h2><p>수요예측만으로 위험등급을 결정하지 않습니다. 현재고·예약재고·입고예정·소비기한·stock_days와 예측 신뢰도를 함께 사용합니다.</p></header>
            <div className="risk-inputs"><code>현재고</code><code>예약재고</code><code>입고예정</code><code>소비기한</code><code>stock_days</code><code>수요예측</code><code>confidence_level</code></div>
            <div className="confidence-policy"><article className="high"><b>HIGH</b><h3>기존 위험등급 계산</h3><p>충분한 이력과 LightGBM 예측을 사용해 기존 재고 위험 규칙을 적용합니다.</p></article><article className="medium"><b>MEDIUM</b><h3>계산 결과 + 불확실성</h3><p>위험등급은 계산하되 화면과 응답에 보완 예측임을 명확히 표시합니다.</p></article><article className="low"><b>LOW</b><h3>GOOD 판정 금지</h3><p>최소 WARNING 또는 REVIEW_REQUIRED로 올리고 담당자 검토를 요구합니다.</p></article></div>
          </section>

          <section className="lab-section" id="batch" aria-labelledby="batch-title">
            <header className="section-head"><span>배치 적재 및 롤백</span><h2 id="batch-title">새 버전을 검증한 뒤 원자적으로 Publish</h2><p>Cold Start는 정상 Fallback으로 처리합니다. 새 배치가 실패하면 기존 ACTIVE Forecast를 유지하며 기존 값을 먼저 삭제했다가 복원하는 방식은 사용하지 않습니다.</p></header>
            <ol className="batch-flow"><li><b>01</b><span>Universe 생성</span></li><li><b>02</b><span>판매 이력 LEFT JOIN</span></li><li><b>03</b><span>모델 / Fallback 라우팅</span></li><li><b>04</b><span>Staging 적재</span></li><li><b>05</b><span>Coverage·제약 검증</span></li><li><b>06</b><span>Forecast 버전 Publish</span></li><li><b>07</b><span>위험등급 재계산</span></li></ol>
            <div className="error-policy"><article><span>정상 처리</span><h3>Cold Start / 단기 이력</h3><p>Fallback 예측과 품질 메타데이터를 생성하고 배치를 계속합니다.</p></article><article><span>전체 배치 실패</span><h3>Fatal 오류만</h3><p>CSV 스키마 손상, DB 연결 실패, 중복, 비정상 수치, FK 불일치에만 적용합니다.</p></article><article><span>실패 시 보존</span><h3>기존 ACTIVE 유지</h3><p>새 버전 Publish 전까지 운영 중인 Forecast를 절대 지우지 않습니다.</p></article></div>
          </section>

          <section className="lab-section" id="api-contract" aria-labelledby="api-title">
            <header className="section-head"><span>Backend / UI 계약 · 설계</span><h2 id="api-title">비동기 Forecast Job 상태 표시</h2><p>실제 구현은 별도 Backend 저장소에서 진행합니다. 이 화면은 요청·조회 계약과 완료 후 반드시 보여줄 Coverage 지표를 정의합니다.</p></header>
            <div className="api-grid"><article><span>작업 생성</span><code>POST /api/v1/demand-forecast-jobs</code><strong>202 Accepted + jobId</strong></article><article><span>상태 조회</span><code>GET /api/v1/demand-forecast-jobs/{`{jobId}`}</code><strong>status · duration · forecast period</strong></article></div>
            <div className="coverage-preview"><header><div><span>Forecast Job 완료 화면</span><h3>모델 Coverage와 검토 대상을 함께 표시</h3></div><b>COMPLETED</b></header><div><article><span>totalRows</span><strong>전체 예측 행</strong></article><article><span>modelForecastRows</span><strong>LightGBM 적용</strong></article><article><span>fallbackForecastRows</span><strong>보완 예측</strong></article><article><span>manualReviewRows</span><strong>수동 검토</strong></article><article><span>rejectedRows</span><strong>거부 행</strong></article></div><p>모델 성능뿐 아니라 모델/보완 예측 비율, LOW confidence와 수동검토 건수를 운영 화면의 핵심 지표로 제공합니다.</p></div>
          </section>

          <footer className="site-footer"><div><span>ST</span><b>Stockit 수요예측 실험 보고서</b></div><p>Baseline → Feature 비교 → 모델 선정 → Test → 운영 적용</p><a href="#overview">맨 위로 ↑</a></footer>
        </div>
      </div>
    </main>
  );
}
