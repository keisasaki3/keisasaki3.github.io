const SUPABASE_URL = 'https://rjydvhpqfhmlvpsykwzf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_NAVKQxtEtS1zPFj59iXIEQ_Y_RztuSx';
const LEGACY_KEY = 'lifeQuestMathV06Public';
const GOOGLE_AUTH_ENABLED = true;

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const STATUS_LABELS = {
  online: 'オンライン',
  studying: '勉強中',
  reading: '読書中',
  busy: '取り込み中',
  afk: 'AFK'
};

const THEME_KEY = 'lifeQuestTheme';
const DEFAULT_THEME = 'dracula';
const THEMES = {
  'tokyo-night': 'トーキョーナイト',
  dracula: 'ドラキュラ',
  nord: 'ノルド',
  synthwave: 'シンセウェイブ',
  amber: 'アンバー端末',
  phosphor: 'グリーン端末'
};

function currentTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch {}
  return saved && THEMES[saved] ? saved : DEFAULT_THEME;
}

function applyTheme(theme) {
  const value = THEMES[theme] ? theme : DEFAULT_THEME;
  document.documentElement.dataset.theme = value;
  try { localStorage.setItem(THEME_KEY, value); } catch {}
}

applyTheme(currentTheme());

let session = null;
let profile = null;
let presence = null;
let races = [];
let subjects = [];
let fields = [];
let topics = [];
let prerequisites = [];
let mastery = new Set();
let topicById = new Map();
let fieldById = new Map();
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
  if (lv >= 200) return '知の探究者';
  if (lv >= 100) return '博識の旅人';
  if (lv >= 50) return '学びの冒険者';
  if (lv >= 10) return '見習い学徒';
  return '旅のはじまり';
}

function renderProfile() {
  const lv = totalMastery();
  $('#profileName').textContent = profile?.display_name || '名無し';
  $('#profileLv').textContent = String(lv);
  $('#rank').textContent = rank(lv);
  $('#presenceLabel').textContent = STATUS_LABELS[presence?.status] || '';
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
      <div class="authbrand">人生クエスト</div>
      <form id="authForm" class="authform">
        <input id="email" type="email" autocomplete="email" placeholder="メールアドレス" required>
        <input id="password" type="password" autocomplete="current-password" placeholder="パスワード" required minlength="6">
        <button class="primarybtn" type="submit">ログイン</button>
        <button class="plainbtn" type="button" id="signup">新規登録</button>
        ${GOOGLE_AUTH_ENABLED ? `<button class="plainbtn googlebtn" type="button" id="googleLogin">${GOOGLE_G_ICON}Googleで続ける</button>` : ''}
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
      showError('メールアドレスと6文字以上のパスワードを入力してください。');
      return;
    }
    const redirectTo = `${location.origin}${location.pathname}`;
    const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
    if (error) {
      showError(error.message);
      return;
    }
    if (!data.session) {
      $('#authMessage').textContent = '確認メールを送信しました。';
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
  const statusDataPromise = fetchUserStatusData(user);

  const [profileRow, raceRes, subjectRes, fieldRows, topicRows, prereqRows, masteryRows, presenceRes] = await Promise.all([
    ensureProfile(user),
    sb.from('races').select('*').eq('active', true).order('sort_order'),
    sb.from('quest_subjects').select('*').eq('active', true).order('sort_order'),
    fetchAllRows(opts => sb.from('quest_fields').select('*', opts).eq('active', true).order('sort_order').order('field_id')),
    fetchAllRows(opts => sb.from('quest_topics').select('*', opts).eq('active', true).order('recommended_order').order('topic_id')),
    fetchAllRows(opts => sb.from('quest_topic_prerequisites').select('topic_id,prerequisite_topic_id', opts).order('topic_id').order('prerequisite_topic_id')),
    fetchAllRows(opts => sb.from('quest_topic_mastery').select('topic_id', opts).eq('user_id', user.id).order('topic_id')),
    sb.from('player_presence').select('*').eq('user_id', user.id).maybeSingle()
  ]);
  const failures = [raceRes, subjectRes, presenceRes].filter(r => r.error);
  if (failures.length) throw failures[0].error;

  profile = profileRow;
  races = raceRes.data || [];
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
  applyUserStatusData(await statusDataPromise);

  setShellVisible(true);
  setActiveTab('subjects');
  renderProfile();
  if (statusFeatureAvailable && !userSettings?.setup_completed_at) renderSetup();
  else renderHome();

  await maybeOfferLegacyMigration();
  if (!profile.race_id) await chooseRace(true);
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

function orderedFields(subjectId) {
  return fields.filter(f => f.subject_id === subjectId).sort((a,b) => a.sort_order - b.sort_order || a.field_id.localeCompare(b.field_id));
}

function orderedTopics(subjectId) {
  const fs = orderedFields(subjectId);
  const fOrder = new Map(fs.map((f,i) => [f.field_id, i]));
  return topics.filter(t => fOrder.has(t.field_id)).sort((a,b) =>
    fOrder.get(a.field_id) - fOrder.get(b.field_id) ||
    a.recommended_order - b.recommended_order ||
    a.topic_id.localeCompare(b.topic_id)
  );
}

function subjectMasteryCount(subjectId) {
  return orderedTopics(subjectId).reduce((n,t) => n + (mastery.has(t.topic_id) ? 1 : 0), 0);
}

function nextTopic(subjectId) {
  const list = orderedTopics(subjectId);
  const unmastered = list.filter(t => !mastery.has(t.topic_id));
  if (!unmastered.length) return null;
  const prereqMap = new Map();
  prerequisites.forEach(p => {
    if (!prereqMap.has(p.topic_id)) prereqMap.set(p.topic_id, []);
    prereqMap.get(p.topic_id).push(p.prerequisite_topic_id);
  });
  const ready = unmastered.filter(t => (prereqMap.get(t.topic_id) || []).every(id => mastery.has(id)));
  if (!ready.length) return unmastered[0];
  return ready.reduce((best, t) => (t.importance || 0) > (best.importance || 0) ? t : best);
}

function renderHome() {
  currentSubjectId = null;
  const m = main();
  m.innerHTML = '';
  subjects.forEach(s => {
    const count = subjectMasteryCount(s.subject_id);
    const next = nextTopic(s.subject_id);
    const d = document.createElement('div');
    d.className = 'subject';
    d.innerHTML = `<div class="subjectline"><span class="icon">${esc(s.icon)}</span><span class="name">${esc(s.name_ja)}</span><span class="en">${esc(s.name_en)}</span><span class="stars">★${count}</span></div><div class="meta">マスター済：${count}トピック　${next ? 'NEXT：'+esc(next.name) : 'COMPLETE'}</div>`;
    d.onclick = () => renderSubject(s.subject_id);
    m.appendChild(d);
  });
}

function renderSubject(subjectId) {
  currentSubjectId = subjectId;
  const subject = subjects.find(s => s.subject_id === subjectId);
  const list = orderedTopics(subjectId);
  const count = subjectMasteryCount(subjectId);
  const searchable = list.length >= 10;
  const m = main();
  m.innerHTML = `<button class="back">← 学問</button><div class="mathhead"><span class="icon">${esc(subject.icon)}</span><h2>${esc(subject.name_ja)}</h2><span class="en">${esc(subject.name_en)}</span><span class="stars">★${count}</span></div>${searchable ? '<input class="search" placeholder="トピックを検索" id="q">' : ''}<div id="topics"></div>`;
  m.querySelector('.back').onclick = () => { setActiveTab('subjects'); renderHome(); };
  if (searchable) {
    const q = $('#q');
    q.value = currentSearch;
    q.oninput = () => { currentSearch = q.value; drawSubject(subjectId, currentSearch); };
  } else {
    currentSearch = '';
  }
  drawSubject(subjectId, searchable ? currentSearch : '');
}

function drawSubject(subjectId, query) {
  const box = $('#topics');
  if (!box) return;
  box.innerHTML = '';
  const fs = orderedFields(subjectId);
  const q = query.trim().toLowerCase();
  let shown = 0;
  fs.forEach(f => {
    const list = topics.filter(t => t.field_id === f.field_id)
      .sort((a,b) => a.recommended_order - b.recommended_order || a.topic_id.localeCompare(b.topic_id))
      .filter(t => !q || `${t.name}${t.source || ''}${f.name}`.toLowerCase().includes(q));
    if (!list.length) return;
    shown += list.length;
    const sec = document.createElement('section');
    sec.className = 'area';
    const hideHeading = fs.length === 1 && f.field_id.endsWith('-prototype');
    if (!hideHeading) sec.innerHTML = `<h3>${esc(f.name)}</h3>`;
    list.forEach(t => {
      const on = mastery.has(t.topic_id);
      const d = document.createElement('div');
      d.className = 'topic' + (on ? ' on' : '');
      const source = t.source && t.source !== '仮トピック' ? `<div class="source">${esc(t.source)}</div>` : '';
      d.innerHTML = `<div class="check">${on ? '✓' : ''}</div><div class="topicbody"><div class="tname">${esc(t.name)}</div>${source}</div>${on ? '<div class="master">MASTER!</div>' : ''}`;
      d.onclick = () => toggleTopic(t.topic_id, on, subjectId, query);
      sec.appendChild(d);
    });
    box.appendChild(sec);
  });
  if (!shown) box.innerHTML = '<div class="empty">該当なし</div>';
}

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
  bg.innerHTML = `<div class="modal"><h3>名前変更</h3><input id="nameinput" maxlength="20"><div class="actions"><button id="cancel">キャンセル</button><button class="savebtn" id="saveName">保存</button></div></div>`;
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

async function chooseRace(required = false) {
  return new Promise(resolve => {
    const bg = document.createElement('div');
    bg.className = 'modalbg';
    bg.innerHTML = `<div class="modal"><h3>種族</h3><div class="racechoices">${races.map(r => `<button class="racebtn" data-race="${esc(r.race_id)}">${esc(r.name_ja)}</button>`).join('')}</div>${required ? '' : '<div class="actions"><button id="cancelRace">キャンセル</button></div>'}</div>`;
    document.body.appendChild(bg);
    const close = () => { bg.remove(); resolve(); };
    bg.querySelectorAll('.racebtn').forEach(btn => btn.onclick = async () => {
      const raceId = btn.dataset.race;
      const { error } = await sb.from('profiles').update({ race_id: raceId }).eq('user_id', session.user.id);
      if (error) { alert(error.message); return; }
      profile.race_id = raceId;
      close();
      if (document.querySelector('.settings')) renderSettings();
    });
    if (!required) {
      bg.querySelector('#cancelRace').onclick = close;
      bg.onclick = e => { if (e.target === bg) close(); };
    }
  });
}

async function updateStatus(status) {
  const { error } = await sb.from('player_presence').upsert({
    user_id: session.user.id,
    status,
    status_changed_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString()
  });
  if (error) { alert(error.message); return; }
  presence.status = status;
  renderProfile();
}

function renderSettings() {
  setActiveTab('settings');
  const race = races.find(r => r.race_id === profile.race_id);
  const m = main();
  const theme = currentTheme();
  m.innerHTML = `<div class="settings"><div class="pagehead"><h2>設定</h2></div><div class="list-window">
    <div class="settingrow"><div class="settingtitle">種族</div><button class="plainbtn small" id="raceSetting">${esc(race?.name_ja || '未設定')}</button></div>
    <div class="settingrow"><label class="settingtitle" for="statusSetting">状態</label><select id="statusSetting" class="select">${Object.entries(STATUS_LABELS).map(([v,l]) => `<option value="${v}" ${presence?.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="settingrow"><label class="settingtitle" for="themeSetting">テーマ</label><select id="themeSetting" class="select">${Object.entries(THEMES).map(([v,l]) => `<option value="${v}" ${theme === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="settingrow"><button class="plainbtn small" id="signout">ログアウト</button></div>
    <div class="settingrow"><button class="dangerbtn" id="resetChecks">全ステータスをリセット</button></div>
    ${statusFeatureAvailable ? '<div class="settingrow"><button class="dangerbtn" id="resetAll">全データをリセット</button></div>' : ''}
  </div></div>`;
  $('#raceSetting').onclick = () => chooseRace(false);
  $('#statusSetting').onchange = e => updateStatus(e.target.value);
  $('#themeSetting').onchange = e => applyTheme(e.target.value);
  $('#signout').onclick = () => sb.auth.signOut();
  $('#resetChecks').onclick = async () => {
    if (!confirmDataDelete('全ステータスのチェック（MASTER）をすべてリセットします。')) return;
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
  return confirm(`${what}\n本当にデータを消しますか？`)
    && confirm('本当にデータを消しますか？\n消したデータは元に戻せません。');
}

// 人生クエストの自分のデータを全部消して、プリセット選択からやり直す。
// display_name・race_id・状態は夏の果てと共通なので残す。
async function resetAllData() {
  if (!confirmDataDelete('チェック・入力の記録・ステータス（プリセットと自作）をすべて消して、プリセット選択からやり直します。')) return;
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

  const ok = confirm('この端末にある既存の人生クエストデータを、このアカウントへ移行しますか？');
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
    main().innerHTML = `<div class="authbox"><div class="authbrand">人生クエスト</div><div class="authmessage error" id="appMessage">${esc(e?.message || '読み込みに失敗しました')}</div><button class="plainbtn" id="retry">再読み込み</button></div>`;
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

sb.auth.onAuthStateChange((event, nextSession) => {
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
