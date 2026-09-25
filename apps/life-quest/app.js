const SUPABASE_URL = 'https://rjydvhpqfhmlvpsykwzf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_NAVKQxtEtS1zPFj59iXIEQ_Y_RztuSx';
const LEGACY_KEY = 'lifeQuestMathV06Public';
const GOOGLE_AUTH_ENABLED = false;

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const STATUS_LABELS = {
  studying: '勉強中',
  reading: '読書中',
  busy: '取り込み中',
  afk: 'AFK'
};

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
let currentSubjectId = null;
let currentSearch = '';

const $ = (s) => document.querySelector(s);
const main = () => $('#main');
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function setShellVisible(visible) {
  $('.top').style.display = visible ? '' : 'none';
  $('.tabs').style.display = visible ? '' : 'none';
  main().classList.toggle('authmain', !visible);
}

function setActiveTab(name) {
  document.querySelectorAll('.tab').forEach(el => el.classList.toggle('active', el.dataset.tab === name));
}

function totalMastery() { return mastery.size; }
function rank(lv) {
  if (lv >= 200) return '知の探究者';
  if (lv >= 100) return '博識の旅人';
  if (lv >= 50) return '学びの冒険者';
  if (lv >= 10) return '見習い学徒';
  return '旅のはじまり';
}

function renderProfile() {
  const lv = totalMastery();
  $('#profile').textContent = `${profile?.display_name || '名無し'} Lv.${lv}`;
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
        ${GOOGLE_AUTH_ENABLED ? '<button class="plainbtn" type="button" id="googleLogin">Googleでログイン</button>' : ''}
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

async function loadApp() {
  showLoading();
  const user = session.user;
  profile = await ensureProfile(user);

  const [raceRes, subjectRes, fieldRes, topicRes, prereqRes, masteryRes, presenceRes] = await Promise.all([
    sb.from('races').select('*').eq('active', true).order('sort_order'),
    sb.from('quest_subjects').select('*').eq('active', true).order('sort_order'),
    sb.from('quest_fields').select('*').eq('active', true).order('sort_order'),
    sb.from('quest_topics').select('*').eq('active', true).order('recommended_order'),
    sb.from('quest_topic_prerequisites').select('topic_id,prerequisite_topic_id'),
    sb.from('quest_topic_mastery').select('topic_id').eq('user_id', user.id),
    sb.from('player_presence').select('*').eq('user_id', user.id).maybeSingle()
  ]);
  const failures = [raceRes, subjectRes, fieldRes, topicRes, prereqRes, masteryRes, presenceRes].filter(r => r.error);
  if (failures.length) throw failures[0].error;

  races = raceRes.data || [];
  subjects = subjectRes.data || [];
  fields = fieldRes.data || [];
  topics = topicRes.data || [];
  prerequisites = prereqRes.data || [];
  mastery = new Set((masteryRes.data || []).map(x => x.topic_id));
  presence = presenceRes.data;

  if (!presence) {
    const res = await sb.from('player_presence').upsert({ user_id: user.id, status: 'afk' }).select().single();
    if (res.error) throw res.error;
    presence = res.data;
  }

  topicById = new Map(topics.map(t => [t.topic_id, t]));
  fieldById = new Map(fields.map(f => [f.field_id, f]));

  setShellVisible(true);
  setActiveTab('subjects');
  renderProfile();
  renderHome();

  await maybeOfferLegacyMigration();
  if (!profile.race_id) await chooseRace(true);
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
  return unmastered.find(t => (prereqMap.get(t.topic_id) || []).every(id => mastery.has(id))) || unmastered[0];
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
}

function renderSettings() {
  setActiveTab('settings');
  const race = races.find(r => r.race_id === profile.race_id);
  const m = main();
  m.innerHTML = `<div class="settings"><h2>設定</h2>
    <div class="settingrow"><div class="settingtitle">種族</div><button class="plainbtn small" id="raceSetting">${esc(race?.name_ja || '未設定')}</button></div>
    <div class="settingrow"><div class="settingtitle">表示ステータス</div><select id="statusSetting" class="select">${Object.entries(STATUS_LABELS).map(([v,l]) => `<option value="${v}" ${presence?.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="settingrow"><button class="plainbtn small" id="signout">ログアウト</button></div>
    <div class="settingrow"><button class="dangerbtn" id="resetChecks">全チェックをリセット</button></div>
  </div>`;
  $('#raceSetting').onclick = () => chooseRace(false);
  $('#statusSetting').onchange = e => updateStatus(e.target.value);
  $('#signout').onclick = () => sb.auth.signOut();
  $('#resetChecks').onclick = async () => {
    if (!confirm('すべてのチェックをリセットしますか？')) return;
    const { error } = await sb.from('quest_topic_mastery').delete().eq('user_id', session.user.id);
    if (error) { alert(error.message); return; }
    mastery.clear();
    renderProfile();
    renderSettings();
  };
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

async function handleSession(nextSession) {
  session = nextSession;
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
document.querySelector('[data-tab="subjects"]').onclick = () => { setActiveTab('subjects'); renderHome(); };
document.querySelector('[data-tab="settings"]').onclick = renderSettings;

sb.auth.onAuthStateChange((event, nextSession) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
    setTimeout(() => handleSession(nextSession), 0);
  }
});

(async function boot() {
  showLoading();
  const { data, error } = await sb.auth.getSession();
  if (error) {
    renderAuth();
    showError(error.message);
    return;
  }
  await handleSession(data.session);
})();
