// @ts-check

let newspaperRequestId = 0;

/** @param {string} url */
function safeExternalUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : '';
  } catch {
    return '';
  }
}

/** @param {Source[]} sources */
function renderSourceLinks(sources = []) {
  return sources.map(source => {
    const url = safeExternalUrl(source.url);
    if (!url) return '';
    return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(source.name)}</a>`;
  }).filter(Boolean).join('');
}

const REGION_ICONS = {
  world: '🌍', global: '🌍', japan: '🇯🇵', us: '🇺🇸', usa: '🇺🇸', 'united states': '🇺🇸', americas: '🌎',
  china: '🇨🇳', taiwan: '🇹🇼', korea: '🇰🇷', 'south korea': '🇰🇷', india: '🇮🇳', asia: '🌏',
  europe: '🇪🇺', eu: '🇪🇺', uk: '🇬🇧', 'united kingdom': '🇬🇧', russia: '🇷🇺', ukraine: '🇺🇦',
  'middle east': '🌍', africa: '🌍'
};

/** @param {string} region */
function regionIcon(region) {
  return REGION_ICONS[region.trim().toLowerCase()] || '🌐';
}

/** @param {NewsArticle[]} news */
function renderNewsSection(news) {
  const jaMain = currentNewsLang() === 'ja';
  const articles = news.map((article, index) => {
    const subId = `newspaper-news-sub-${index}`;
    const detailId = `newspaper-news-detail-${index}`;
    const summary = article.summary || [];
    const headlineEn = (article.headline_en || '').trim();
    const hasEnSummary = summary.some(sentence => (sentence.en || '').trim());
    const english = `<p class="newspaper-summary-en">${summary.map(sentence => `<span>${esc(sentence.en)}</span>`).join('')}</p>`;
    const japanese = `<p class="newspaper-summary-ja">${summary.map(sentence => `<span>${esc(sentence.ja)}</span>`).join('')}</p>`;
    const allSources = article.sources || [];
    const mainSource = renderSourceLinks(allSources.slice(0, 1));
    const moreSources = renderSourceLinks(allSources.slice(1));
    const background = (article.background || '').trim();
    const whyItMatters = (article.why_it_matters || '').trim();
    const detail = [
      background ? `<div class="newspaper-detail-label">BACKGROUND</div><div class="newspaper-detail-text">${esc(background)}</div>` : '',
      whyItMatters ? `<div class="newspaper-detail-label">WHY IT MATTERS</div><div class="newspaper-detail-text">${esc(whyItMatters)}</div>` : '',
      moreSources ? `<div class="newspaper-detail-label">SOURCES</div><div class="newspaper-sources">${moreSources}</div>` : ''
    ].join('');
    return `<article class="newspaper-news-item">
      <div class="newspaper-news-bar"><span>${String(index + 1).padStart(2, '0')}</span><span class="newspaper-region"><span class="newspaper-region-icon" aria-hidden="true">${regionIcon(article.region || '')}</span>${esc((article.region || 'NEWS').toUpperCase())}</span></div>
      <div class="newspaper-news-body">
        ${jaMain
          ? `<h3 class="newspaper-headline newspaper-headline-jaonly">${esc(article.headline || headlineEn)}</h3>
        <div class="newspaper-summaries"><p class="newspaper-summary-jamain">${summary.map(sentence => `<span>${esc(sentence.ja)}</span>`).join('')}</p></div>`
          : `${headlineEn
          ? `<h3 class="newspaper-headline" lang="en">${esc(headlineEn)}</h3>`
          : `<h3 class="newspaper-headline newspaper-headline-jaonly">${esc(article.headline)}</h3>`}
        <div class="newspaper-summaries" lang="en">${english}</div>`}
        ${mainSource ? `<div class="newspaper-source-main">${mainSource}</div>` : ''}
        ${jaMain
          ? (headlineEn || hasEnSummary ? `<div class="newspaper-ja" id="${subId}" lang="en" hidden>${headlineEn ? `<p class="newspaper-headline-sub">${esc(headlineEn)}</p>` : ''}${hasEnSummary ? `<p class="newspaper-summary-ensub">${summary.map(sentence => `<span>${esc(sentence.en)}</span>`).join('')}</p>` : ''}</div>` : '')
          : `<div class="newspaper-ja" id="${subId}" hidden>${headlineEn ? `<p class="newspaper-headline-ja">${esc(article.headline)}</p>` : ''}${japanese}</div>`}
        ${detail ? `<div class="newspaper-news-detail" id="${detailId}" hidden>${detail}</div>` : ''}
        <div class="newspaper-news-actions">
          ${!jaMain || headlineEn || hasEnSummary ? `<button class="newspaper-toggle" type="button" data-toggle="${subId}" data-open-label="${esc(tr(jaMain ? 'closeEn' : 'closeJa'))}" aria-expanded="false">${esc(tr(jaMain ? 'showEn' : 'showJa'))}</button>` : ''}
          ${detail ? `<button class="newspaper-toggle" type="button" data-toggle="${detailId}" data-open-label="${esc(tr('close'))}" aria-expanded="false">${esc(tr('details'))}</button>` : ''}
        </div>
      </div>
    </article>`;
  }).join('');
  return `<section class="newspaper-section newspaper-news"><h2>NEWS</h2>${articles}</section>`;
}

/** @param {number|string} value */
function formatMarketValue(value) {
  if (typeof value !== 'number') return esc(value);
  return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 4 }).format(value);
}

/** @param {MarketItem} item */
function formatMarketChange(item) {
  if (typeof item.change_pct === 'number') return `${item.change_pct > 0 ? '+' : ''}${item.change_pct}%`;
  if (typeof item.change_bp === 'number') return `${item.change_bp > 0 ? '+' : ''}${item.change_bp}bp`;
  return '';
}

/** @param {string} key */
function marketGroupLabel(key) {
  const labels = {
    fx: 'FX',
    stocks: 'STOCKS',
    rates: 'RATES',
    commodities: 'COMMODITIES',
    crypto: 'CRYPTO',
    cryptos: 'CRYPTO',
    crypto_assets: 'CRYPTO',
    digital_assets: 'CRYPTO'
  };
  return labels[key] || key.replaceAll('_', ' ').toUpperCase();
}

/** @param {MarketData} markets */
function renderMarketsSection(markets) {
  const groups = Object.entries(markets).filter(([key, value]) => {
    if (key === 'market_moves' || key === 'moves' || key === 'as_of') return false;
    return Array.isArray(value) && value.some(item => isNewspaperObject(item) && 'symbol' in item && 'value' in item);
  });

  const rows = groups.map(([key, value]) => {
    const items = /** @type {MarketItem[]} */ (value);
    return `<div class="newspaper-market-group">
      <h3>${esc(marketGroupLabel(key))}</h3>
      <div class="newspaper-market-list">${items.map(item => `
        <div class="newspaper-market-row">
          <div class="newspaper-market-symbol">${esc(item.symbol)}</div>
          <div class="newspaper-market-value">${formatMarketValue(item.value)}${item.unit ? ` <span>${esc(item.unit)}</span>` : ''}</div>
          <div class="newspaper-market-change">${esc(formatMarketChange(item))}</div>
        </div>`).join('')}</div>
    </div>`;
  }).join('');

  const moves = Array.isArray(markets.market_moves)
    ? markets.market_moves
    : Array.isArray(markets.moves) ? markets.moves : [];
  const marketMoves = moves.length ? `<div class="newspaper-market-moves">
    <div class="newspaper-detail-label">MARKET MOVES</div>
    ${moves.map(move => `<div class="newspaper-market-move"><strong>${esc(move.title || move.asset || move.symbol || '')}</strong><div>${esc(move.body || move.explanation || move.summary || move.reason || '')}</div></div>`).join('')}
  </div>` : '';

  return `<section class="newspaper-section newspaper-markets"><h2>MARKETS</h2>${markets.as_of ? `<div class="newspaper-as-of">${esc(markets.as_of)}</div>` : ''}${rows}${marketMoves}</section>`;
}

/** @param {DailyCulture} culture */
function renderCultureSection(culture) {
  const body = culture.body || culture.bodyMarkdown || culture.content || culture.text || '';
  const explore = Array.isArray(culture.explore)
    ? culture.explore
    : Array.isArray(culture.explore_terms) ? culture.explore_terms : [];
  const exploreItems = explore.filter(item => typeof item === 'string');
  return `<section class="newspaper-section newspaper-culture">
    <h2>DAILY CULTURE</h2>
    <h3>${esc(culture.title || '')}</h3>
    <div class="newspaper-culture-body">${esc(body)}</div>
    ${exploreItems.length ? `<div class="newspaper-detail-label">EXPLORE</div><div class="newspaper-explore">${exploreItems.map(item => `<span>${esc(item)}</span>`).join('')}</div>` : ''}
  </section>`;
}

/** @param {DailyQuiz} quiz */
function renderQuizSection(quiz) {
  const sources = renderSourceLinks(quiz.sources || []);
  return `<section class="newspaper-section newspaper-quiz">
    <h2>DAILY QUIZ</h2>
    <div class="newspaper-quiz-genre">${esc(quiz.genre || '')}</div>
    <div class="newspaper-quiz-question">${esc(quiz.question || '')}</div>
    <button class="newspaper-answer-button" id="newspaperAnswerToggle" type="button" aria-expanded="false">${esc(tr('showAnswer'))}</button>
    <div class="newspaper-answer" id="newspaperAnswer" hidden>
      <div class="newspaper-detail-label">ANSWER</div>
      <div class="newspaper-answer-text">${esc(quiz.answer || '')}</div>
      <div class="newspaper-detail-label">EXPLANATION</div>
      <div class="newspaper-detail-text">${esc(quiz.explanation || '')}</div>
      ${sources ? `<div class="newspaper-detail-label">SOURCES</div><div class="newspaper-sources">${sources}</div>` : ''}
    </div>
  </section>`;
}

/** @param {NewspaperIssue} issue */
function NewspaperScreen(issue) {
  return `<div class="newspaper-screen">
    <div class="newspaper-paper">
    <div class="newspaper-header"><h2>NEWSPAPER</h2><div>${esc(issue.date)}</div></div>
    ${renderNewsSection(issue.news)}
    ${renderMarketsSection(issue.markets)}
    ${renderCultureSection(issue.daily_culture)}
    ${renderQuizSection(issue.daily_quiz)}
    </div>
  </div>`;
}

function bindNewspaperInteractions() {
  document.querySelectorAll('[data-toggle]').forEach(element => {
    const button = /** @type {HTMLButtonElement} */ (element);
    const closedLabel = button.textContent || '';
    button.onclick = () => {
      const id = button.dataset.toggle;
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      const open = target.hidden;
      target.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      button.classList.toggle('open', open);
      button.textContent = open ? (button.dataset.openLabel || closedLabel) : closedLabel;
    };
  });

  const answerButton = /** @type {HTMLButtonElement|null} */ (document.getElementById('newspaperAnswerToggle'));
  const answer = document.getElementById('newspaperAnswer');
  if (answerButton && answer) {
    answerButton.onclick = () => {
      const open = answer.hidden;
      answer.hidden = !open;
      answerButton.setAttribute('aria-expanded', String(open));
      answerButton.textContent = open ? tr('hideAnswer') : tr('showAnswer');
    };
  }
}

function renderNewspaperError(error) {
  const message = error instanceof Error ? error.message : tr('fetchFailed');
  main().innerHTML = `<div class="newspaper-error"><div>${esc(tr('newsFailed'))}</div><div class="newspaper-error-detail">${esc(message)}</div><button class="plainbtn small" id="newspaperRetry" type="button">${esc(tr('retry'))}</button></div>`;
  const retry = /** @type {HTMLButtonElement|null} */ (document.getElementById('newspaperRetry'));
  if (retry) retry.onclick = renderNewspaper;
}

async function renderNewspaper() {
  setActiveTab('newspaper');
  const requestId = ++newspaperRequestId;
  main().innerHTML = '<div class="loading">Loading...</div>';
  try {
    const { issue } = await fetchLatestNewspaper();
    if (requestId !== newspaperRequestId || !document.querySelector('[data-tab="newspaper"]')?.classList.contains('active')) return;
    main().innerHTML = NewspaperScreen(issue);
    bindNewspaperInteractions();
  } catch (error) {
    if (requestId !== newspaperRequestId || !document.querySelector('[data-tab="newspaper"]')?.classList.contains('active')) return;
    renderNewspaperError(error);
  }
}

const newspaperTab = document.querySelector('[data-tab="newspaper"]');
if (newspaperTab) newspaperTab.addEventListener('click', renderNewspaper);
