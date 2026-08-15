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
  ["07", "LightGBM 계획", "lightgbm"], ["08", "XGBoost 계획", "xgboost"],
  ["09", "모델 비교", "models"], ["10", "최종 Test", "test"], ["11", "운영 적용", "production"],
];

const heroMetrics = [
  ["9,277", "시계열 수"], ["90일", "예측 Horizon"],
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
        <a className="brand" href="#overview"><span>ST</span> 수요예측 실험 보고서</a>
        <div className="nav-links">
          <a href="#overview">프로젝트 개요</a><a href="#data">데이터 구성</a><a href="#automl">실험 결과</a><a href="#models">모델 비교</a><a href="#production">운영 적용</a>
        </div>
        <span className="status"><i /> AutoML 진단 완료</span>
      </nav>

      <section className="hero" id="overview">
        <div className="eyebrow">Stockit Demand Forecast Lab · 실험 진행 현황</div>
        <div className="hero-grid">
          <div><h1>Stockit 수요예측<br /><em>실험 보고서</em></h1><p className="hero-description">SKU·판매지점별 향후 90일 판매량을 예측하기 위한 모델 개발 및 검증 결과를 공유합니다.</p></div>
          <div className="status-summary" aria-label="현재 실험 상태">
            <div><span>현재 진행 단계</span><strong>AutoML 진단 완료</strong></div>
            <div><span>현재 기준 모델</span><strong>E0 VotingEnsemble</strong></div>
            <div><span>다음 작업</span><strong>이동평균 Baseline 평가 및 LightGBM 실험</strong></div>
            <div><span>Validation NRMSE</span><strong>0.24892</strong></div>
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
            <header className="section-head"><span>실험 로드맵</span><h2 id="roadmap-title">전체 실험 계획</h2><p>동일한 데이터 분할과 평가 기준을 사용하여 Baseline, Feature 조합 및 모델별 성능을 비교합니다.</p></header>
            <ExperimentTabs />
          </section>

          <section className="lab-section" id="data" aria-labelledby="data-title">
            <header className="section-head"><span>데이터 구성</span><h2 id="data-title">데이터 구성 및 분할</h2><p>1,096일의 데이터를 동일한 고정 시점 기준으로 Train, Validation, Test로 분할했습니다.</p></header>
            <div className="data-total"><strong>10,167,592</strong><span>전체 건수</span><b>2023.08.01 — 2026.07.31</b></div>
            <div className="split-bar" aria-label="데이터 분할 비율"><i className="train" /><i className="validation" /><i className="test" /></div>
            <div className="split-grid">
              <article><span className="dot train-dot" />TRAIN <strong>8,497,732건</strong><small>2023.08.01 — 2026.02.01</small></article>
              <article><span className="dot validation-dot" />VALIDATION <strong>834,930건</strong><small>2026.02.02 — 2026.05.02</small></article>
              <article><span className="dot test-dot" />TEST · 미평가 <strong>834,930건</strong><small>2026.05.03 — 2026.07.31</small></article>
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
            <header className="section-head"><span>Baseline · 다음 작업</span><h2 id="baseline-title">이동평균 Baseline 평가</h2><p>복잡한 모델의 성능을 판단하기 전에 MA(7), MA(14), MA(30)을 동일한 Validation 구간에서 평가합니다.</p></header>
            <div className="baseline-row"><div><span>MA</span><strong>07</strong><small>최근 7일 평균</small></div><div><span>MA</span><strong>14</strong><small>최근 14일 평균</small></div><div><span>MA</span><strong>30</strong><small>최근 30일 평균</small></div><p>현재 상태: 평가 예정<br /><b>검증 방식: 고정 Forecast Origin 및 90일 재귀 예측</b></p></div>
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
            <header className="section-head"><span>LightGBM · 예정</span><h2 id="lgbm-title">LightGBM 실험 계획</h2><p>LightGBM을 고정한 상태에서 Feature 조합을 단계적으로 추가하여 각 Feature의 성능 기여도를 검증합니다.</p><i className="planned">예정</i></header>
            <div className="model-layout"><ol className="experiment-sequence"><li><b>LGBM-M0</b><span>기본 Feature</span></li><li><b>LGBM-M1</b><span>Calendar Feature</span></li><li><b>LGBM-M2</b><span>Lag 및 Rolling Feature</span></li><li><b>LGBM-M3</b><span>Calendar + Lag/Rolling</span></li><li><b>LGBM-M4</b><span>최소 Master Feature 추가</span></li></ol><div className="recipe"><h3>Feature 후보 및 검증 설정</h3><p><span>Lag</span>7 · 14 · 28 · 56</p><p><span>Rolling mean</span>7 · 14 · 28</p><p><span>Rolling std</span>7 · 28</p><p><span>Calendar</span>요일 · 주말 여부 · 월</p><p><span>Validation</span>90일 재귀 예측</p></div></div>
          </section>

          <section className="lab-section model-plan muted" id="xgboost" aria-labelledby="xgb-title">
            <header className="section-head"><span>XGBoost · 대기</span><h2 id="xgb-title">XGBoost 비교 실험</h2><p>LightGBM에서 성능이 가장 좋았던 Feature 조합을 XGBoost에 동일하게 적용하여 최종 후보 모델을 비교합니다.</p><i className="planned">대기</i></header>
            <div className="model-layout"><div className="lead small-lead">현재 결과 수치는 없습니다. LightGBM 실험과 Feature 조합 선정이 완료된 후 실행합니다.</div><div className="recipe"><h3>실행 조건</h3><p><span>01</span>LightGBM 파이프라인 검증 완료</p><p><span>02</span>최적 Feature 조합 선정</p><p><span>03</span>동일한 데이터 분할과 평가 기준 적용</p></div></div>
          </section>

          <section className="lab-section" id="models" aria-labelledby="models-title">
            <header className="section-head"><span>모델 비교</span><h2 id="models-title">모델 성능 비교</h2></header>
            <div className="table-wrap"><table><thead><tr><th>MODEL</th><th>상태</th><th>MAE</th><th>RMSE</th><th>R²</th><th>NRMSE ↓</th></tr></thead><tbody><tr className="current"><td>E0 · VotingEnsemble</td><td><b>기준 후보</b></td><td>1.3287</td><td>2.0933</td><td>0.63569</td><td>0.24892</td></tr><tr><td>E1 · Calendar AutoML</td><td>후보 제외</td><td>1.3287</td><td>2.0933</td><td>0.63569</td><td>0.24892</td></tr><tr><td>MA(7/14/30)</td><td>다음 작업</td><td>—</td><td>—</td><td>—</td><td>—</td></tr><tr><td>LightGBM</td><td>예정</td><td>—</td><td>—</td><td>—</td><td>—</td></tr><tr><td>XGBoost</td><td>대기</td><td>—</td><td>—</td><td>—</td><td>—</td></tr></tbody></table></div>
            <div className="evaluation"><h3>평가 기준</h3><ul><li><b>주 지표</b> NRMSE</li><li><b>보조 지표</b> MAE, RMSE, R²</li><li>SKU·판매지점별 오차 분포</li><li>항상 0인 시계열의 예측 성능</li><li>음수 예측 발생률</li><li>D+7, D+14, D+30, D+60, D+90 누적 오차</li></ul></div>
          </section>

          <section className="lab-section" id="test" aria-labelledby="test-title">
            <header className="section-head"><span>최종 Test · 미평가</span><h2 id="test-title">최종 Test 평가 계획</h2><p>Validation 결과로 최종 후보 모델 하나를 선정한 후, 2026.05.03~2026.07.31의 Test 구간을 한 번만 평가합니다. Test 결과를 확인한 뒤 모델이나 Feature를 다시 선택하지 않습니다.</p></header>
            <div className="test-lock"><span>Test 평가 구간</span><strong>2026.05.03 — 2026.07.31</strong><p>Validation 기준으로 최종 후보 1개를 선정하기 전까지 평가에 사용하지 않습니다.</p><i>최종 후보 선정 전 사용 금지</i></div>
          </section>

          <section className="lab-section" id="production" aria-labelledby="production-title">
            <header className="section-head"><span>운영 적용 · 예정</span><h2 id="production-title">운영 적용 절차</h2><p>최종 모델의 일별 예측 결과를 서비스 조회 및 DB 적재 형식으로 변환합니다.</p></header>
            <ol className="pipeline six"><li><b>01</b><span>일별 예측 생성</span><p>SKU·판매지점별<br />90일 수요예측</p></li><li><b>02</b><span>후처리 결정</span><p>음수 예측 확인 및<br />0 Clip 적용 여부 결정</p></li><li><b>03</b><span>누적 수요 계산</span><p>D+7 · D+14 · D+30<br />D+60 · D+90</p></li><li><b>04</b><span>적재 형식 변환</span><p>DEMAND_FORECAST<br />테이블 형식 적용</p></li><li><b>05</b><span>Feature 기록</span><p>feature_definition_json에<br />Feature·모델 버전 기록</p></li><li><b>06</b><span>DB 적재</span><p>Backend 조회 계약<br />검증 후 적재</p></li></ol>
          </section>

          <footer className="site-footer"><div><span>ST</span><b>Stockit 수요예측 실험 보고서</b></div><p>Baseline → Feature 비교 → 모델 선정 → Test → 운영 적용</p><a href="#overview">맨 위로 ↑</a></footer>
        </div>
      </div>
    </main>
  );
}
