const SUPABASE_URL = 'https://rjydvhpqfhmlvpsykwzf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_NAVKQxtEtS1zPFj59iXIEQ_Y_RztuSx';
const LEGACY_KEY = 'lifeQuestMathV06Public';
const GOOGLE_AUTH_ENABLED = true;

// 応答が返らない通信で Loading... のまま止まらないよう、Supabaseの通信は15秒で打ち切ってエラーにする
const SUPABASE_TIMEOUT_MS = 15000;
function fetchWithTimeout(input, init = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new Error('timeout')), SUPABASE_TIMEOUT_MS);
  const outer = init.signal;
  if (outer) {
    if (outer.aborted) ctrl.abort(outer.reason);
    else outer.addEventListener('abort', () => ctrl.abort(outer.reason), { once: true });
  }
  return fetch(input, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  global: { fetch: fetchWithTimeout }
});

const THEME_KEY = 'lifeQuestTheme';
const DEFAULT_THEME = 'dracula';
const THEMES = ['tokyo-night', 'dracula', 'nord', 'synthwave', 'amber', 'phosphor', 'gameboya', 'gameboya-pocket', 'gameboya-light', 'gameboya-color', 'gameboya-advanz', 'famicoso', 'super-famicoso', 'virtual-boya', 'mado95', 'yusha', 'komonjo', 'sakuramochi', 'gogo3ji', 'slime-blue', 'e-paper', 'neojiwo', 'wonderswan', 'pc-enjin', 'mega-driver', 'tamagoppi', 'shinkai', 'himawari', 'uji-matcha', 'cafe-au-lait', 'hoshizora'];

function currentTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch {}
  return saved && THEMES.includes(saved) ? saved : DEFAULT_THEME;
}

function applyTheme(theme) {
  const value = THEMES.includes(theme) ? theme : DEFAULT_THEME;
  document.documentElement.dataset.theme = value;
  const meta = document.querySelector('meta[name="theme-color"]');
  const bar = getComputedStyle(document.documentElement).getPropertyValue('--bar').trim();
  if (meta && bar) meta.content = bar;
  try { localStorage.setItem(THEME_KEY, value); } catch {}
}

applyTheme(currentTheme());

let session = null;
let profile = null;
let presence = null;
let subjects = [];
let fields = [];
let topics = [];
let prerequisites = [];
let mastery = new Set();
let topicById = new Map();
let fieldById = new Map();
// 起動時に一度だけ作る索引（毎回の全件 filter/sort をなくす）
let fieldsBySubject = new Map();
let topicsByField = new Map();
let prereqMap = new Map();
let userSettings = null;
let userStatuses = [];
let userFields = [];
let userTopics = [];
let topicValues = [];
let statusFeatureAvailable = true;
let currentSubjectId = null;
let currentSearch = '';

const $ = (s) => document.querySelector(s);
const main = () => $('#main');
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function setView(view) {
  document.body.dataset.view = view;
}

function setShellVisible(visible) {
  if (!visible) setView('auth');
  main().classList.toggle('authmain', !visible);
}

function setActiveTab(name) {
  document.querySelectorAll('.tab').forEach(el => el.classList.toggle('active', el.dataset.tab === name));
  setView(name === 'subjects' ? 'home' : name);
}

function totalMastery() { return mastery.size + userTopics.filter(t => t.mastered_at).length; }
function rank(lv) {
  if (lv >= 200) return tr('rank.200');
  if (lv >= 100) return tr('rank.100');
  if (lv >= 50) return tr('rank.50');
  if (lv >= 10) return tr('rank.10');
  return tr('rank.0');
}

function renderProfile() {
  const lv = totalMastery();
  // '名無し' はDBに入る既定名なので、表示だけ言語に合わせる
  $('#profileName').textContent = !profile?.display_name || profile.display_name === '名無し' ? tr('noname') : profile.display_name;
  $('#profileLv').textContent = String(lv);
  $('#rank').textContent = rank(lv);
}

function showLoading() {
  setShellVisible(false);
  main().innerHTML = '<div class="loading">Loading...</div>';
}

function showError(message) {
  const el = $('#authMessage') || $('#appMessage');
  if (el) {
    el.textContent = message || '';
    el.classList.toggle('error', Boolean(message));
  } else if (message) {
    alert(message);
  }
}

const GOOGLE_G_ICON = '<svg class="googleicon" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

function renderAuth() {
  setShellVisible(false);
  main().innerHTML = `
    <div class="authbox">
      <div class="authbrand">${esc(tr('brand'))}</div>
      <form id="authForm" class="authform">
        <input id="email" type="email" autocomplete="email" placeholder="${esc(tr('email'))}" required>
        <input id="password" type="password" autocomplete="current-password" placeholder="${esc(tr('password'))}" required minlength="6">
        <button class="primarybtn" type="submit">${esc(tr('login'))}</button>
        <button class="plainbtn" type="button" id="signup">${esc(tr('signup'))}</button>
        ${GOOGLE_AUTH_ENABLED ? `<button class="plainbtn googlebtn" type="button" id="googleLogin">${GOOGLE_G_ICON}${esc(tr('google'))}</button>` : ''}
        <div id="authMessage" class="authmessage"></div>
      </form>
    </div>`;

  $('#authForm').onsubmit = async (e) => {
    e.preventDefault();
    showError('');
    const email = $('#email').value.trim();
    const password = $('#password').value;
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) showError(error.message);
  };

  $('#signup').onclick = async () => {
    showError('');
    const email = $('#email').value.trim();
    const password = $('#password').value;
    if (!email || password.length < 6) {
      showError(tr('authInvalid'));
      return;
    }
    const redirectTo = `${location.origin}${location.pathname}`;
    const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
    if (error) {
      showError(error.message);
      return;
    }
    if (!data.session) {
      $('#authMessage').textContent = tr('confirmSent');
      $('#authMessage').classList.remove('error');
    }
  };

  if (GOOGLE_AUTH_ENABLED && $('#googleLogin')) {
    $('#googleLogin').onclick = async () => {
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${location.origin}${location.pathname}` }
      });
      if (error) showError(error.message);
    };
  }
}

async function ensureProfile(user) {
  let { data, error } = await sb.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  if (!data) {
    const candidate = (user.user_metadata?.name || user.user_metadata?.full_name || '名無し').trim().slice(0, 20) || '名無し';
    const res = await sb.from('profiles').upsert({ user_id: user.id, display_name: candidate }).select().single();
    if (res.error) throw res.error;
    data = res.data;
  }
  return data;
}

// 1ページ目で総件数を取り、残りのページはまとめて並列に取得する
async function fetchAllRows(queryFactory, pageSize = 1000) {
  const first = await queryFactory({ count: 'exact' }).range(0, pageSize - 1);
  if (first.error) throw first.error;
  const rows = [...(first.data || [])];
  if (rows.length < pageSize) return rows;
  const total = Number.isFinite(first.count) ? first.count : null;
  if (total === null) {
    for (let from = pageSize; ; from += pageSize) {
      const { data, error } = await queryFactory().range(from, from + pageSize - 1);
      if (error) throw error;
      const page = data || [];
      rows.push(...page);
      if (page.length < pageSize) break;
    }
    return rows;
  }
  const pages = [];
  for (let from = pageSize; from < total; from += pageSize) {
    pages.push(queryFactory().range(from, from + pageSize - 1));
  }
  const results = await Promise.all(pages);
  results.forEach(res => {
    if (res.error) throw res.error;
    rows.push(...(res.data || []));
  });
  return rows;
}

async function loadApp() {
  showLoading();
  const user = session.user;
  // 最初に出る日課の読み込みをカリキュラムの取得と並列に始めておく
  prefetchRoutines().catch(() => {});
  const statusDataPromise = fetchUserStatusData(user);

  const [profileRow, subjectRes, fieldRows, topicRows, prereqRows, masteryRows, presenceRes] = await Promise.all([
    ensureProfile(user),
    sb.from('quest_subjects').select('*').eq('active', true).order('sort_order'),
    fetchAllRows(opts => sb.from('quest_fields').select('*', opts).eq('active', true).order('sort_order').order('field_id')),
    fetchAllRows(opts => sb.from('quest_topics').select('*', opts).eq('active', true).order('recommended_order').order('topic_id')),
    fetchAllRows(opts => sb.from('quest_topic_prerequisites').select('topic_id,prerequisite_topic_id', opts).order('topic_id').order('prerequisite_topic_id')),
    fetchAllRows(opts => sb.from('quest_topic_mastery').select('topic_id', opts).eq('user_id', user.id).order('topic_id')),
    sb.from('player_presence').select('*').eq('user_id', user.id).maybeSingle()
  ]);
  const failures = [subjectRes, presenceRes].filter(r => r.error);
  if (failures.length) throw failures[0].error;

  profile = profileRow;
  subjects = subjectRes.data || [];
  fields = fieldRows;
  topics = topicRows;
  prerequisites = prereqRows;
  mastery = new Set(masteryRows.map(x => x.topic_id));
  presence = presenceRes.data;

  if (!presence) {
    const res = await sb.from('player_presence').upsert({ user_id: user.id, status: 'online' }).select().single();
    if (res.error) throw res.error;
    presence = res.data;
  }

  topicById = new Map(topics.map(t => [t.topic_id, t]));
  fieldById = new Map(fields.map(f => [f.field_id, f]));
  buildCurriculumIndex();
  applyUserStatusData(await statusDataPromise);

  setShellVisible(true);
  renderProfile();
  if (statusFeatureAvailable && !userSettings?.setup_completed_at) {
    setActiveTab('subjects');
    renderSetup();
  } else renderRoutines();

  await maybeOfferLegacyMigration();
}

function isMissingTableError(error) {
  return error && (error.code === 'PGRST205' || error.code === '42P01');
}

// 共通カリキュラムの取得と並列に走らせるため、取得と反映を分けている
async function fetchUserStatusData(user) {
  const settingsRes = await sb.from('quest_user_settings').select('*').eq('user_id', user.id).maybeSingle();
  if (isMissingTableError(settingsRes.error)) return { missing: true };
  if (settingsRes.error) throw settingsRes.error;
  const [statusRows, userFieldRows, userTopicRows, valueRows] = await Promise.all([
    fetchAllRows(opts => sb.from('quest_user_statuses').select('*', opts).eq('user_id', user.id).order('sort_order').order('status_id')),
    fetchAllRows(opts => sb.from('quest_user_fields').select('*', opts).eq('user_id', user.id).order('sort_order').order('field_id')),
    fetchAllRows(opts => sb.from('quest_user_topics').select('*', opts).eq('user_id', user.id).order('sort_order').order('topic_id')),
    fetchAllRows(opts => sb.from('quest_topic_values').select('*', opts).eq('user_id', user.id).order('recorded_at', { ascending: false }).order('value_id'))
  ]);
  return { missing: false, settings: settingsRes.data, statusRows, userFieldRows, userTopicRows, valueRows };
}

function applyUserStatusData(result) {
  if (result.missing) {
    // migration 005 未適用のDBでは、従来どおり全学問を表示する（追加・編集は出さない）
    statusFeatureAvailable = false;
    userSettings = null;
    userStatuses = subjects.map(s => ({ status_id: `preset:${s.subject_id}`, preset_subject_id: s.subject_id, sort_order: s.sort_order, hidden: false }));
    userFields = [];
    userTopics = [];
    topicValues = [];
    return;
  }
  statusFeatureAvailable = true;
  userSettings = result.settings;
  userStatuses = result.statusRows;
  userFields = result.userFieldRows;
  userTopics = result.userTopicRows;
  topicValues = result.valueRows;
}

function groupSorted(rows, key, compare) {
  const map = new Map();
  rows.forEach(r => {
    if (!map.has(r[key])) map.set(r[key], []);
    map.get(r[key]).push(r);
  });
  map.forEach(list => list.sort(compare));
  return map;
}

function buildCurriculumIndex() {
  fieldsBySubject = groupSorted(fields, 'subject_id', (a,b) => a.sort_order - b.sort_order || a.field_id.localeCompare(b.field_id));
  topicsByField = groupSorted(topics, 'field_id', (a,b) => a.recommended_order - b.recommended_order || a.topic_id.localeCompare(b.topic_id));
  prereqMap = new Map();
  prerequisites.forEach(p => {
    if (!prereqMap.has(p.topic_id)) prereqMap.set(p.topic_id, []);
    prereqMap.get(p.topic_id).push(p.prerequisite_topic_id);
  });
}

function orderedFields(subjectId) {
  return fieldsBySubject.get(subjectId) || [];
}

function fieldTopics(fieldId) {
  return topicsByField.get(fieldId) || [];
}

function orderedTopics(subjectId) {
  return orderedFields(subjectId).flatMap(f => fieldTopics(f.field_id));
}

// 画面は subject-ui.js が差し替える
function renderHome() {}
function renderSubject() {}
function drawSubject() {}

async function toggleTopic(topicId, wasOn, subjectId, query) {
  if (wasOn) mastery.delete(topicId); else mastery.add(topicId);
  renderProfile();
  drawSubject(subjectId, query);
  const req = wasOn
    ? sb.from('quest_topic_mastery').delete().eq('user_id', session.user.id).eq('topic_id', topicId)
    : sb.from('quest_topic_mastery').insert({ user_id: session.user.id, topic_id: topicId });
  const { error } = await req;
  if (error) {
    if (wasOn) mastery.add(topicId); else mastery.delete(topicId);
    renderProfile();
    drawSubject(subjectId, query);
    alert(error.message);
  }
}

function editName() {
  const bg = document.createElement('div');
  bg.className = 'modalbg';
  bg.innerHTML = `<div class="modal"><h3>${esc(tr('changeName'))}</h3><input id="nameinput" maxlength="20"><div class="actions"><button id="cancel">${esc(tr('cancel'))}</button><button class="savebtn" id="saveName">${esc(tr('save'))}</button></div></div>`;
  document.body.appendChild(bg);
  const input = bg.querySelector('#nameinput');
  input.value = profile.display_name === '名無し' ? '' : profile.display_name;
  input.focus(); input.select();
  const close = () => bg.remove();
  bg.querySelector('#cancel').onclick = close;
  bg.onclick = e => { if (e.target === bg) close(); };
  const commit = async () => {
    const value = input.value.trim();
    if (!value) return;
    const { error } = await sb.from('profiles').update({ display_name: value.slice(0,20) }).eq('user_id', session.user.id);
    if (error) { alert(error.message); return; }
    profile.display_name = value.slice(0,20);
    renderProfile();
    close();
  };
  bg.querySelector('#saveName').onclick = commit;
  input.onkeydown = e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') close(); };
}

function renderSettings() {
  setActiveTab('settings');
  const m = main();
  const theme = currentTheme();
  const newsLang = currentNewsLang();
  const butlerType = currentButlerType();
  const butlerName = currentButlerName();
  m.innerHTML = `<div class="settings"><div class="pagehead"><h2>${esc(tr('settings'))}</h2></div><div class="list-window">
    <div class="settingrow"><label class="settingtitle" for="themeSetting">${esc(tr('theme'))}</label><select id="themeSetting" class="select">${THEMES.map((v, i) => `<option value="${v}" ${theme === v ? 'selected' : ''}>${String(i + 1).padStart(3, '0')} ${esc(tr(`theme.${v}`))}</option>`).join('')}</select></div>
    <div class="settingrow"><label class="settingtitle" for="langSetting">${esc(tr('language'))}</label><select id="langSetting" class="select">${Object.entries(LANGS).map(([v,l]) => `<option value="${v}" ${lang === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="settingrow"><label class="settingtitle" for="newsLangSetting">${esc(tr('newsLang'))}</label><select id="newsLangSetting" class="select">${Object.entries(NEWS_LANGS).map(([v,l]) => `<option value="${v}" ${newsLang === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="settingrow"><label class="settingtitle" for="butlerTypeSetting"><img class="pixicon" id="butlerIcon" src="./icons/${butlerType}.svg" alt="" width="16" height="16"> ${esc(tr('butlerType'))}</label><select id="butlerTypeSetting" class="select"><option value="maid" ${butlerType === 'maid' ? 'selected' : ''}>${esc(tr('butlerMaid'))}</option><option value="butler" ${butlerType === 'butler' ? 'selected' : ''}>${esc(tr('butlerButler'))}</option></select></div>
    <div class="settingrow"><label class="settingtitle" for="butlerNameSetting">${esc(tr('butlerName'))}</label><input id="butlerNameSetting" class="select" maxlength="12" placeholder="${esc(tr('butlerNamePh'))}" value="${esc(butlerName)}"></div>
    <div class="settingrow"><button class="plainbtn small" id="signout">${esc(tr('logout'))}</button></div>
    <div class="settingrow"><button class="dangerbtn" id="resetChecks">${esc(tr('resetStatuses'))}</button></div>
    ${statusFeatureAvailable ? `<div class="settingrow"><button class="dangerbtn" id="resetAll">${esc(tr('resetAll'))}</button></div>` : ''}
  </div></div>`;
  $('#themeSetting').onchange = e => applyTheme(e.target.value);
  $('#langSetting').onchange = e => { applyLang(e.target.value); renderProfile(); renderSettings(); };
  $('#newsLangSetting').onchange = e => applyNewsLang(e.target.value);
  const saveButler = () => applyButler($('#butlerTypeSetting').value, $('#butlerNameSetting').value);
  $('#butlerTypeSetting').onchange = () => { saveButler(); $('#butlerIcon').src = `./icons/${currentButlerType()}.svg`; };
  $('#butlerNameSetting').onchange = saveButler;
  $('#signout').onclick = () => {
    try { localStorage.removeItem('lifeQuestCalendarToken'); } catch {}
    sb.auth.signOut();
  };
  $('#resetChecks').onclick = async () => {
    if (!confirmDataDelete(tr('resetStatusesWhat'))) return;
    const { error } = await sb.from('quest_topic_mastery').delete().eq('user_id', session.user.id);
    if (error) { alert(error.message); return; }
    mastery.clear();
    if (statusFeatureAvailable && userTopics.some(t => t.mastered_at)) {
      const res = await sb.from('quest_user_topics').update({ mastered_at: null }).eq('user_id', session.user.id).not('mastered_at', 'is', null);
      if (res.error) { alert(res.error.message); return; }
      userTopics.forEach(t => { t.mastered_at = null; });
    }
    renderProfile();
    renderSettings();
  };
  if (statusFeatureAvailable) $('#resetAll').onclick = resetAllData;
}

function confirmDataDelete(what) {
  return confirm(`${what}\n${tr('reallyDelete')}`)
    && confirm(`${tr('reallyDelete')}\n${tr('cannotUndo')}`);
}

// 人生クエストの自分のデータを全部消して、プリセット選択からやり直す。
// display_name・race_id・状態は夏の果てと共通なので残す。
async function resetAllData() {
  if (!confirmDataDelete(tr('resetAllWhat'))) return;
  const uid = session.user.id;
  for (const table of ['quest_topic_mastery', 'quest_topic_values', 'quest_user_statuses', 'quest_user_settings']) {
    const { error } = await sb.from(table).delete().eq('user_id', uid);
    if (error) { alert(error.message); return; }
  }
  mastery.clear();
  userSettings = null;
  userStatuses = [];
  userFields = [];
  userTopics = [];
  topicValues = [];
  renderProfile();
  renderSetup();
}

async function maybeOfferLegacyMigration() {
  const flag = `lifeQuestCloudMigrationAsked:${session.user.id}`;
  if (localStorage.getItem(flag)) return;
  let legacy;
  try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null'); } catch { legacy = null; }
  if (!legacy) { localStorage.setItem(flag, '1'); return; }
  const hasMath = Array.isArray(legacy.math) && legacy.math.length > 0;
  const hasOther = legacy.other && Object.values(legacy.other).some(v => Array.isArray(v) && v.length > 0);
  const hasName = legacy.name && legacy.name !== '名無し';
  if (!hasMath && !hasOther && !hasName) { localStorage.setItem(flag, '1'); return; }

  const ok = confirm(tr('legacyMigrate'));
  localStorage.setItem(flag, '1');
  if (!ok) return;

  const rows = [];
  const orderedSubjects = [...subjects].sort((a,b) => a.sort_order - b.sort_order);
  const mathTopics = orderedTopics('math');
  (legacy.math || []).forEach(i => { if (mathTopics[i]) rows.push({ user_id: session.user.id, topic_id: mathTopics[i].topic_id }); });
  orderedSubjects.forEach((s, idx) => {
    if (idx === 0) return;
    const list = orderedTopics(s.subject_id);
    const done = legacy.other?.[idx] || [];
    done.forEach(i => { if (list[i]) rows.push({ user_id: session.user.id, topic_id: list[i].topic_id }); });
  });

  if (rows.length) {
    const { error } = await sb.from('quest_topic_mastery').upsert(rows, { onConflict: 'user_id,topic_id', ignoreDuplicates: true });
    if (error) { alert(error.message); return; }
  }
  if (hasName && profile.display_name === '名無し') {
    const name = String(legacy.name).trim().slice(0,20);
    if (name) {
      const { error } = await sb.from('profiles').update({ display_name: name }).eq('user_id', session.user.id);
      if (!error) profile.display_name = name;
    }
  }
  rows.forEach(r => mastery.add(r.topic_id));
  renderProfile();
  renderHome();
}

let activeUserId = null;

async function handleSession(nextSession) {
  session = nextSession;
  activeUserId = session?.user?.id || null;
  if (!session) {
    profile = null;
    mastery = new Set();
    renderAuth();
    return;
  }
  try {
    await loadApp();
  } catch (e) {
    console.error(e);
    setShellVisible(false);
    main().innerHTML = `<div class="authbox"><div class="authbrand">${esc(tr('brand'))}</div><div class="authmessage error" id="appMessage">${esc(e?.message || tr('loadFailed'))}</div><button class="plainbtn" id="retry">${esc(tr('reload'))}</button></div>`;
    $('#retry').onclick = () => loadApp();
  }
}

$('#rename').onclick = editName;
document.querySelector('[data-tab="subjects"]').onclick = () => {
  setActiveTab('subjects');
  if (statusFeatureAvailable && !userSettings?.setup_completed_at) renderSetup();
  else renderHome();
};
document.querySelector('[data-tab="settings"]').onclick = renderSettings;

// 他のJS（routine-ui.js等）の読み込みが終わる前に起動処理が走らないよう、bootまではイベントを無視してbootに任せる
let booted = false;

sb.auth.onAuthStateChange((event, nextSession) => {
  if (!booted) return;
  // supabase-jsは起動時とタブ復帰時にも同じユーザーでSIGNED_INを出すので、そのときは全体を読み直さない
  if (event === 'SIGNED_IN' && nextSession && nextSession.user.id === activeUserId) {
    session = nextSession;
    return;
  }
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
    activeUserId = nextSession?.user?.id || null;
    setTimeout(() => handleSession(nextSession), 0);
  }
});

// subject-ui.js / newspaper-ui.js が描画関数を差し替えてから起動する
document.addEventListener('DOMContentLoaded', async function boot() {
  booted = true;
  showLoading();
  const { data, error } = await sb.auth.getSession();
  if (error) {
    renderAuth();
    showError(error.message);
    return;
  }
  if (data.session && data.session.user.id === activeUserId) return;
  await handleSession(data.session);
});
