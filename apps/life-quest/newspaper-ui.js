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
// 国旗絵文字はWindowsでは「JP」などの文字になるため、画像を用意した国・地域は画像で出す
const REGION_FLAGS = { japan: 'jp', us: 'us', usa: 'us', 'united states': 'us', europe: 'eu', eu: 'eu' };

function regionIcon(region) {
  const key = region.trim().toLowerCase();
  if (REGION_FLAGS[key]) return `<img class="newspaper-flag" src="./icons/flags/${REGION_FLAGS[key]}.svg" alt="" width="21" height="14">`;
  return REGION_ICONS[key] || '🌐';
}

/** @param {NewsArticle[]} news */
function renderNewsSection(news) {
  const jaMain = currentNewsLang() === 'ja';
  const articles = news.map((article, index) => {
    const detailId = `newspaper-news-detail-${index}`;
    const main = jaMain ? 'ja' : 'en';
    const sub = jaMain ? 'en' : 'ja';
    const headlineEn = (article.headline_en || '').trim();
    const headlineJa = (article.headline || '').trim();
    const headlineMain = jaMain ? (headlineJa || headlineEn) : (headlineEn || headlineJa);
    const headlineSub = jaMain ? (headlineJa && headlineEn) : (headlineEn && headlineJa);
    const headlineIsJa = headlineMain === headlineJa && headlineMain !== headlineEn;
    const sentences = (article.summary || []).map(sentence => {
      const mainText = (sentence[main] || '').trim();
      const subText = (sentence[sub] || '').trim();
      return mainText ? { text: mainText, sub: subText } : { text: subText, sub: '' };
    }).filter(sentence => sentence.text);
    const hasSub = Boolean(headlineSub) || sentences.some(sentence => sentence.sub);
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
    return `<article class="newspaper-news-item" id="newspaper-news-${index}">
      <div class="newspaper-news-bar"><span class="newspaper-num">${String(index + 1).padStart(2, '0')}</span><span class="newspaper-region"><span class="newspaper-region-icon" aria-hidden="true">${regionIcon(article.region || '')}</span>${esc((article.region || 'NEWS').toUpperCase())}</span></div>
      <div class="newspaper-news-body">
        <div class="newspaper-headline-block">
          <h3 class="newspaper-headline${headlineIsJa ? ' newspaper-headline-jaonly' : ''}" lang="${headlineIsJa ? 'ja' : 'en'}">${esc(headlineMain)}</h3>
          ${headlineSub ? `<p class="newspaper-sub newspaper-headline-sub" lang="${sub}">${esc(headlineSub)}</p>` : ''}
        </div>
        <div class="newspaper-summaries">${sentences.map(sentence => `<p class="newspaper-sentence">
          <span class="newspaper-sentence-main" lang="${main}">${esc(sentence.text)}${sentence.sub ? ` <button class="newspaper-sentence-btn" type="button" data-toggle-sentence aria-expanded="false" aria-label="${esc(tr(jaMain ? 'showEn' : 'showJa'))}">${esc(tr(jaMain ? 'sentenceEn' : 'sentenceJa'))}</button>` : ''}</span>
          ${sentence.sub ? `<span class="newspaper-sub" lang="${sub}">${esc(sentence.sub)}</span>` : ''}
        </p>`).join('')}</div>
        ${mainSource ? `<div class="newspaper-source-main">${mainSource}</div>` : ''}
        ${detail ? `<div class="newspaper-news-detail" id="${detailId}" hidden>${detail}</div>` : ''}
        <div class="newspaper-news-actions">
          ${hasSub ? `<button class="newspaper-toggle" type="button" data-toggle-sub="newspaper-news-${index}" data-open-label="${esc(tr(jaMain ? 'closeEn' : 'closeJa'))}" aria-expanded="false">${esc(tr(jaMain ? 'showEn' : 'showJa'))}</button>` : ''}
          ${detail ? `<button class="newspaper-toggle" type="button" data-toggle="${detailId}" data-open-label="${esc(tr('close'))}" aria-expanded="false">${esc(tr('details'))}</button>` : ''}
        </div>
      </div>
    </article>`;
  }).join('');
  return `<section class="newspaper-section newspaper-news"><h2>NEWS</h2>${articles}</section>`;
}

/** 値の小数桁: 為替はEUR/USDだけ4桁・他は2桁、金利3桁、暗号資産0桁、株価・商品2桁 */
/** @param {string} group @param {string} symbol */
function marketValueDigits(group, symbol) {
  if (group === 'rates') return 3;
  if (group === 'crypto' || group === 'cryptos' || group === 'crypto_assets' || group === 'digital_assets') return 0;
  if (group === 'fx') return /\/JPY$/.test(symbol) ? 2 : 4;
  return 2;
}

/** @param {number|string} value @param {number} digits */
function formatMarketValue(value, digits) {
  if (typeof value !== 'number') return esc(value);
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

/** 上昇=up・下落=down・変化なし=flat（海外式: 上昇が緑、下落が赤） */
/** @param {number} n */
function marketDir(n) {
  return n > 0 ? 'up' : n < 0 ? 'down' : 'flat';
}

/** @param {number} n @param {number} digits @param {string} suffix */
function formatSignedChange(n, digits, suffix) {
  const dir = marketDir(n);
  const mark = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '±';
  return `<span class="newspaper-change-${dir}">${mark}${Math.abs(n).toFixed(digits)}${suffix}</span>`;
}

/** @param {MarketItem} item @param {number} digits */
function formatMarketChange(item, digits) {
  if (typeof item.change_pct === 'number') {
    const abs = typeof item.change === 'number'
      ? `<span class="newspaper-change-abs">${formatSignedChange(item.change, digits, '')}</span>`
      : '';
    return formatSignedChange(item.change_pct, 2, '%') + abs;
  }
  if (typeof item.change_bp === 'number') return formatSignedChange(item.change_bp, 1, 'bp');
  return '';
}

/** "-0.94%" のような文字列を色と記号つきにする。読めなければそのまま */
/** @param {unknown} move */
function formatMoveText(move) {
  const m = /^\s*([+\-−]?)\s*(\d+(?:\.\d+)?)\s*%\s*$/.exec(String(move || ''));
  if (!m) return esc(move || '');
  const n = Number(m[2]) * (m[1] === '-' || m[1] === '−' ? -1 : 1);
  return formatSignedChange(n, 2, '%');
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
          <div class="newspaper-market-value">${formatMarketValue(item.value, marketValueDigits(key, String(item.symbol)))}${item.unit ? ` <span>${esc(item.unit)}</span>` : ''}</div>
          <div class="newspaper-market-change">${formatMarketChange(item, marketValueDigits(key, String(item.symbol)))}</div>
        </div>`).join('')}</div>
    </div>`;
  }).join('');

  const moves = Array.isArray(markets.market_moves)
    ? markets.market_moves
    : Array.isArray(markets.moves) ? markets.moves : [];
  const marketMoves = moves.length ? `<div class="newspaper-market-moves">
    <div class="newspaper-detail-label">MARKET MOVES</div>
    ${moves.map(move => `<div class="newspaper-market-move"><strong>${esc(move.title || move.asset || move.symbol || '')}${move.move ? ` ${formatMoveText(move.move)}` : ''}</strong><div>${esc(move.body || move.explanation || move.summary || move.reason || '')}</div></div>`).join('')}
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
    <div class="newspaper-paper" data-size="${currentNewsSize()}">
    <div class="newspaper-header"><h2>NEWSPAPER</h2><div>${esc(issue.date)}</div></div>
    ${renderNewsSection(issue.news)}
    ${renderMarketsSection(issue.markets)}
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

  document.querySelectorAll('[data-toggle-sentence]').forEach(element => {
    const button = /** @type {HTMLButtonElement} */ (element);
    button.onclick = () => {
      const sentence = button.closest('.newspaper-sentence');
      if (!sentence) return;
      const open = sentence.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      button.classList.toggle('open', open);
    };
  });

  document.querySelectorAll('[data-toggle-sub]').forEach(element => {
    const button = /** @type {HTMLButtonElement} */ (element);
    const closedLabel = button.textContent || '';
    button.onclick = () => {
      const article = document.getElementById(button.dataset.toggleSub || '');
      if (!article) return;
      const open = article.classList.toggle('sub-open');
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
    main().innerHTML = NewspaperScreen(fillNarrator(issue));
    bindNewspaperInteractions();
  } catch (error) {
    if (requestId !== newspaperRequestId || !document.querySelector('[data-tab="newspaper"]')?.classList.contains('active')) return;
    renderNewspaperError(error);
  }
}

const newspaperTab = document.querySelector('[data-tab="newspaper"]');
if (newspaperTab) newspaperTab.addEventListener('click', renderNewspaper);
