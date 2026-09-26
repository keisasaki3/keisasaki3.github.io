// @ts-check

/** @typedef {{name:string,url:string}} Source */
/** @typedef {{ja:string,en:string}} NewsSummarySentence */
/** @typedef {{id?:string,region?:string,headline:string,summary:NewsSummarySentence[],background?:string,why_it_matters?:string,sources?:Source[]}} NewsArticle */
/** @typedef {{symbol:string,value:number|string,unit?:string,change_pct?:number,change_bp?:number,source?:string,source_url?:string,note?:string}} MarketItem */
/** @typedef {{title?:string,asset?:string,symbol?:string,body?:string,explanation?:string,summary?:string,reason?:string}} MarketMove */
/** @typedef {Object<string, unknown> & {as_of?:string,market_moves?:MarketMove[],moves?:MarketMove[]}} MarketData */
/** @typedef {{title:string,body?:string,bodyMarkdown?:string,content?:string,text?:string,explore?:string[],explore_terms?:string[]}} DailyCulture */
/** @typedef {{genre?:string,question:string,answer:string,explanation?:string,sources?:Source[]}} DailyQuiz */
/** @typedef {{schemaVersion:number,date:string,timezone?:string,generated_at?:string,news:NewsArticle[],markets:MarketData,daily_culture:DailyCulture,daily_quiz:DailyQuiz}} NewspaperIssue */
/** @typedef {{schemaVersion:number,date:string,path:string,published_at?:string}} NewspaperLatest */

const NEWSPAPER_DATA_BASE = 'https://raw.githubusercontent.com/keisasaki3/life-quest-newspaper-data/main/';
const NEWSPAPER_LATEST_PATH = 'newspaper/latest.json';

/** @param {unknown} value */
function isNewspaperObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @param {unknown} value @returns {NewspaperLatest} */
function validateNewspaperLatest(value) {
  if (!isNewspaperObject(value)) throw new Error('latest.json の形式が不正です。');
  const data = /** @type {Record<string, unknown>} */ (value);
  if (typeof data.schemaVersion !== 'number' || typeof data.date !== 'string' || typeof data.path !== 'string') {
    throw new Error('latest.json の必須項目が不足しています。');
  }
  if (!data.path.startsWith('newspaper/') || !data.path.endsWith('.json') || data.path.includes('..')) {
    throw new Error('latest.json の path が不正です。');
  }
  return /** @type {NewspaperLatest} */ (value);
}

/** @param {unknown} value @returns {NewspaperIssue} */
function validateNewspaperIssue(value) {
  if (!isNewspaperObject(value)) throw new Error('NEWSPAPER JSON の形式が不正です。');
  const data = /** @type {Record<string, unknown>} */ (value);
  if (
    typeof data.schemaVersion !== 'number' ||
    typeof data.date !== 'string' ||
    !Array.isArray(data.news) ||
    !isNewspaperObject(data.markets) ||
    !isNewspaperObject(data.daily_culture) ||
    !isNewspaperObject(data.daily_quiz)
  ) {
    throw new Error('NEWSPAPER JSON の必須項目が不足しています。');
  }
  return /** @type {NewspaperIssue} */ (value);
}

/** @param {string} path @returns {Promise<unknown>} */
async function fetchNewspaperJson(path) {
  const url = new URL(path, NEWSPAPER_DATA_BASE);
  url.searchParams.set('v', String(Date.now()));
  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) throw new Error(`NEWSPAPER取得エラー (${response.status})`);
  return response.json();
}

/** @returns {Promise<{latest:NewspaperLatest,issue:NewspaperIssue}>} */
async function fetchLatestNewspaper() {
  const latest = validateNewspaperLatest(await fetchNewspaperJson(NEWSPAPER_LATEST_PATH));
  const issue = validateNewspaperIssue(await fetchNewspaperJson(latest.path));
  return { latest, issue };
}
