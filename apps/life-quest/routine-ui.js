// 日課タブ（SPEC §17）。全部チェック型（目標などは名前に自分で書く）。日付はJST 0時切替。★・Lvとはつながない。
// 正本はSupabase。「この日を締める」で、その日の結果をGoogleカレンダーの専用カレンダーへ終日予定1件として写す。

const GOOGLE_CLIENT_ID = '132883598800-joisad88samjbpe8g93ecv8fu6k3cp59.apps.googleusercontent.com';
// アプリが作ったカレンダーだけを触れる権限。普段の予定は読まない・触らない
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.app.created';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const ROUTINE_TZ = 'Asia/Tokyo';

// 日課のアイコンは決まった一覧から選ぶ。色はアイコンごとに固定（保存しない）。キーは quest_routines.icon
const ROUTINE_ICONS = {
  study: { emoji: '📘', color: '#5b9cff' },
  read: { emoji: '📖', color: '#b48cff' },
  write: { emoji: '✍️', color: '#f4d35e' },
  speak: { emoji: '🗣️', color: '#5fd7ee' },
  muscle: { emoji: '💪', color: '#ff5c5c' },
  run: { emoji: '🏃', color: '#ff9f43' },
  meditate: { emoji: '🧘', color: '#4cd98a' },
  walk: { emoji: '🚶', color: '#b5e655' },
  sleep: { emoji: '😴', color: '#7b7fff' },
  water: { emoji: '💧', color: '#4fc3f7' },
  meal: { emoji: '🥗', color: '#66d17a' },
  tidy: { emoji: '🧹', color: '#a8a8b8' },
  money: { emoji: '💰', color: '#f1c40f' },
  hobby: { emoji: '🎸', color: '#ff7ab6' },
  create: { emoji: '🎨', color: '#ff6fd8' },
  meet: { emoji: '🤝', color: '#ff8fa3' },
  people: { emoji: '👥', color: '#ffb38a' },
  city: { emoji: '🏙️', color: '#8fb8de' },
  dusk: { emoji: '🌆', color: '#ff9e7a' },
  sunset: { emoji: '🌇', color: '#ffb347' },
  night: { emoji: '🌃', color: '#6c7bd9' },
  bridge: { emoji: '🌉', color: '#9d8cff' },
  travel: { emoji: '🧳', color: '#d4a373' },
  globe: { emoji: '🌐', color: '#4fc3f7' },
  listen: { emoji: '🎧', color: '#c792ea' },
  news: { emoji: '📰', color: '#d8c39a' },
  other: { emoji: '🌱', color: '#5ed37c' }
};

function routineIcon(r) {
  return ROUTINE_ICONS[r?.icon] || ROUTINE_ICONS.other;
}

// 日付の上に出す日替わりの金言（今努力すると人生がよくなる、に関わる言葉）。出典がはっきりしたものだけ
const ROUTINE_QUOTES = [
  { ja: '千里の行も足下に始まる', en: 'A journey of a thousand miles begins beneath one\'s feet.', by: '老子', by_en: 'Laozi' },
  { ja: '為せば成る 為さねば成らぬ何事も 成らぬは人の為さぬなりけり', en: 'Do it and it can be done; leave it and nothing will be. What fails is only what we fail to do.', by: '上杉鷹山', by_en: 'Uesugi Yozan' },
  { ja: '天才とは1%のひらめきと99%の汗である', en: 'Genius is one per cent inspiration and ninety-nine per cent perspiration.', by: 'トーマス・エジソン', by_en: 'Thomas Edison' },
  { ja: '我々は繰り返し行うことの産物である。ゆえに卓越とは行為ではなく習慣である', en: 'We are what we repeatedly do. Excellence, then, is not an act but a habit.', by: 'ウィル・デュラント', by_en: 'Will Durant' },
  { ja: '習慣は第二の天性なり', en: 'Habit is a second nature.', by: 'キケロ', by_en: 'Cicero' },
  { ja: '急がず、だが休まず', en: 'Without haste, but without rest.', by: 'ゲーテ', by_en: 'Goethe' },
  { ja: '人間は努力する限り迷うものだ', en: 'Man errs as long as he strives.', by: 'ゲーテ', by_en: 'Goethe' },
  { ja: '天は自ら助くる者を助く', en: 'Heaven helps those who help themselves.', by: 'サミュエル・スマイルズ', by_en: 'Samuel Smiles' },
  { ja: '小さいことを積み重ねるのが、とんでもないところへ行くただ一つの道だと思っています', en: 'Piling up small things is the only way to get somewhere extraordinary.', by: 'イチロー', by_en: 'Ichiro Suzuki' },
  { ja: '明日やることがあるなら、今日やれ', en: 'Have you somewhat to do to-morrow, do it to-day.', by: 'ベンジャミン・フランクリン', by_en: 'Benjamin Franklin' },
  { ja: '時は金なり', en: 'Time is money.', by: 'ベンジャミン・フランクリン', by_en: 'Benjamin Franklin' },
  { ja: 'ただ学問を勤めて物事をよく知る者は貴人となり富人となる', en: 'Those who work at learning and come to know things well become honored and rich.', by: '福沢諭吉', by_en: 'Fukuzawa Yukichi' },
  { ja: '成功とは、毎日繰り返される小さな努力の積み重ねである', en: 'Success is the sum of small efforts, repeated day in and day out.', by: 'ロバート・コリアー', by_en: 'Robert Collier' },
  { ja: '志を立てて以て万事の源と為す', en: 'Setting your purpose is the source of all things.', by: '吉田松陰', by_en: 'Yoshida Shoin' },
  { ja: '一日一字を記さば一年にして三百六十字を得、一夜一時を怠らば百歳の間三万六千時を失う', en: 'Write one character a day and in a year you have 360; waste one hour a night and in a hundred years you lose 36,000.', by: '吉田松陰', by_en: 'Yoshida Shoin' },
  { ja: '凡事徹底', en: 'Do ordinary things thoroughly.', by: '鍵山秀三郎', by_en: 'Kagiyama Hidesaburo' },
  { ja: '千日の稽古を鍛とし、万日の稽古を錬とす', en: 'A thousand days of practice forge you; ten thousand days refine you.', by: '宮本武蔵', by_en: 'Miyamoto Musashi' },
  { ja: '始めは全体の半分である', en: 'The beginning is half of the whole.', by: 'アリストテレス', by_en: 'Aristotle' },
  { ja: '学びて時に之を習う、亦説ばしからずや', en: 'Is it not a pleasure to learn and to practice what you have learned?', by: '孔子', by_en: 'Confucius' },
  { ja: '木を植えるのに一番良い時期は20年前だった。次に良いのは今だ', en: 'The best time to plant a tree was 20 years ago. The second best time is now.', by: 'ことわざ', by_en: 'Proverb' },
  { ja: '雨垂れ石を穿つ', en: 'Dripping water wears away the stone.', by: 'ことわざ', by_en: 'Proverb' },
  { ja: '今日の一針、明日の十針', en: 'A stitch in time saves nine.', by: 'ことわざ', by_en: 'Proverb' }
];

function routineQuote(day) {
  const n = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000);
  const q = ROUTINE_QUOTES[((n % ROUTINE_QUOTES.length) + ROUTINE_QUOTES.length) % ROUTINE_QUOTES.length];
  return lang === 'en' ? { text: q.en, by: q.by_en } : { text: q.ja, by: q.by };
}

let routineUserId = null;
let routineAvailable = true;
let routines = [];
let routineChecks = new Set();
let routineCalendarId = null;
let routineEditMode = false;
let routineDay = null;

// ---------- 日付（JST） ----------

const jstDayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: ROUTINE_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });

function jstDay(date = new Date()) {
  return jstDayFormat.format(date);
}

function addDays(day, n) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function weekdayOf(day) {
  return new Date(`${day}T00:00:00Z`).getUTCDay();
}

function dayLabel(day) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString(tr('dateLocale'), { timeZone: 'UTC', month: '2-digit', day: '2-digit', weekday: 'short' });
}

// created_at / archived_at（UTC）をJSTの日付に。同じ値を何度も変換するので覚えておく
const tsDayCache = new Map();

function tsDay(ts) {
  if (!tsDayCache.has(ts)) tsDayCache.set(ts, jstDay(new Date(ts)));
  return tsDayCache.get(ts);
}

function checkKey(routineId, day) {
  return `${routineId}|${day}`;
}

// その日にやる日課（曜日が合い、作った日以降で、消した日より前）
function routinesOn(day) {
  const bit = 1 << weekdayOf(day);
  return routines
    .filter(r => (r.weekdays & bit) && tsDay(r.created_at) <= day && (!r.archived_at || tsDay(r.archived_at) > day))
    .sort((a, b) => a.sort_order - b.sort_order || a.routine_id.localeCompare(b.routine_id));
}

function activeRoutines() {
  return routines.filter(r => !r.archived_at).sort((a, b) => a.sort_order - b.sort_order || a.routine_id.localeCompare(b.routine_id));
}

function dayResult(day) {
  const list = routinesOn(day);
  return { list, total: list.length, done: list.filter(r => routineChecks.has(checkKey(r.routine_id, day))).length };
}

// 全部やった日が何日続いているか。日課の無い日は数えずに飛ばす。今日がまだ途中なら昨日から数える
function routineStreak() {
  const first = routines.reduce((min, r) => { const d = tsDay(r.created_at); return !min || d < min ? d : min; }, null);
  if (!first) return 0;
  let day = jstDay();
  let n = 0;
  const today = dayResult(day);
  if (today.total && today.done === today.total) n++;
  for (day = addDays(day, -1); day >= first; day = addDays(day, -1)) {
    const r = dayResult(day);
    if (!r.total) continue;
    if (r.done !== r.total) break;
    n++;
  }
  return n;
}

// その日課だけの連続日数。やる曜日でない日は飛ばし、今日がまだなら昨日から数える
function routineItemStreak(r) {
  const first = tsDay(r.created_at);
  const bits = r.weekdays;
  let day = jstDay();
  let n = 0;
  if (routineChecks.has(checkKey(r.routine_id, day))) n++;
  for (day = addDays(day, -1); day >= first; day = addDays(day, -1)) {
    if (!(bits & (1 << weekdayOf(day)))) continue;
    if (!routineChecks.has(checkKey(r.routine_id, day))) break;
    n++;
  }
  return n;
}

function routineRate(days) {
  let total = 0, done = 0;
  const today = jstDay();
  for (let i = 0; i < days; i++) {
    const r = dayResult(addDays(today, -i));
    total += r.total;
    done += r.done;
  }
  return total ? Math.round(done / total * 100) : null;
}

function weekdaysLabel(bits) {
  if (bits === 127) return tr('routine.everyday');
  const names = tr('routine.wd').split(',');
  return names.filter((_, i) => bits & (1 << i)).join(' ');
}

// ---------- 読み込み ----------

// 読み込み中のPromise（起動時の先読みと画面表示で共有する）
let routineLoad = null;
let routineLoadUserId = null;

function prefetchRoutines() {
  const uid = session.user.id;
  if (!routineLoad || routineLoadUserId !== uid) {
    routineLoadUserId = uid;
    const load = loadRoutines().finally(() => { if (routineLoad === load) routineLoad = null; });
    routineLoad = load;
  }
  return routineLoad;
}

async function loadRoutines() {
  const uid = session.user.id;
  const res = await sb.from('quest_routines').select('*').eq('user_id', uid).order('sort_order').order('routine_id');
  if (isMissingTableError(res.error)) {
    routineAvailable = false;
    routineUserId = uid;
    return;
  }
  if (res.error) throw res.error;
  const [checkRows, settingsRes] = await Promise.all([
    fetchAllRows(opts => sb.from('quest_routine_checks').select('routine_id,day', opts).eq('user_id', uid).order('day').order('routine_id')),
    sb.from('quest_routine_settings').select('*').eq('user_id', uid).maybeSingle()
  ]);
  if (settingsRes.error) throw settingsRes.error;
  routineAvailable = true;
  routines = res.data || [];
  routineChecks = new Set(checkRows.map(c => checkKey(c.routine_id, c.day)));
  routineCalendarId = settingsRes.data?.calendar_id || null;
  routineUserId = uid;
}

// ---------- 画面 ----------

async function renderRoutines() {
  setActiveTab('routines');
  const m = main();
  if (routineUserId !== session.user.id) {
    routineEditMode = false;
    routineDay = null;
    m.innerHTML = '<div class="loading">Loading...</div>';
    try {
      await prefetchRoutines();
    } catch (e) {
      if (!document.querySelector('[data-tab="routines"]')?.classList.contains('active')) return;
      m.innerHTML = `<div class="empty">${esc(e?.message || tr('loadFailed'))}</div>`;
      return;
    }
    if (!document.querySelector('[data-tab="routines"]')?.classList.contains('active')) return;
  }
  // 「締める」でポップアップを出すときに読み込み待ちにならないよう先に読んでおく
  loadGis().catch(() => {});
  drawRoutines();
}

function drawRoutines() {
  const m = main();
  if (!routineAvailable) {
    m.innerHTML = `<div class="settings"><div class="pagehead"><h2>${esc(tr('routine.heading'))}</h2></div><div class="empty">${esc(tr('routine.unavailable'))}</div></div>`;
    return;
  }
  const today = jstDay();
  if (!routineDay || routineDay > today) routineDay = today;
  const day = routineDay;
  m.innerHTML = `<div class="settings routines"><div class="pagehead"><h2>${esc(tr('routine.heading'))}</h2>${routineEditMode ? `<button type="button" class="plainbtn small" id="routineEdit">${esc(tr('done'))}</button>` : ''}</div><div id="routineBody"></div></div>`;
  if (routineEditMode) $('#routineEdit').onclick = () => { routineEditMode = false; drawRoutines(); };
  const body = $('#routineBody');
  if (routineEditMode) drawRoutineEditor(body);
  else drawRoutineDay(body, day, today);
}

function drawRoutineDay(body, day, today) {
  const { list, total } = dayResult(day);
  const quote = routineQuote(day);
  const streak = routineStreak();
  const rate7 = routineRate(7);
  const rate30 = routineRate(30);
  const heat = [];
  for (let i = 27; i >= 0; i--) {
    const r = dayResult(addDays(today, -i));
    const cls = !r.total ? 'none' : r.done === r.total ? 'full' : r.done ? 'part' : 'zero';
    heat.push(`<span class="heat ${cls}"></span>`);
  }
  body.innerHTML = `
    <div class="window routinehead">
      <button type="button" class="daynav" id="prevDay" aria-label="prev">◀</button>
      <span class="routinedate">${esc(dayLabel(day))}</span>
      <button type="button" class="daynav" id="nextDay" aria-label="next"${day >= today ? ' disabled' : ''}>▶</button>
    </div>
    <div class="routinequote"><div class="quotetext">${lang === 'en' ? `“${esc(quote.text)}”` : `「${esc(quote.text)}」`}</div><div class="quoteby">― ${esc(quote.by)}</div></div>
    <div class="list-window routinelist" id="routineList"></div>
    <div class="list-window routinestats">
      <div class="statrow"><span>${esc(tr('routine.streak'))} <b>${esc(tr('routine.days', { n: streak }))}</b></span><span>${esc(tr('routine.rate7'))} <b>${rate7 === null ? '—' : `${rate7}%`}</b></span><span>${esc(tr('routine.rate30'))} <b>${rate30 === null ? '—' : `${rate30}%`}</b></span></div>
      <div class="heatrow">${heat.join('')}</div>
    </div>
    <button type="button" class="primarybtn" id="closeDay"${total ? '' : ' disabled'}>${esc(tr('routine.close'))}</button>
    <div class="authmessage" id="routineMessage"></div>
    <button type="button" class="plainbtn" id="openRoutineEdit">${esc(tr('routine.editBtn'))}</button>`;
  $('#openRoutineEdit').onclick = () => { routineEditMode = true; drawRoutines(); };
  $('#prevDay').onclick = () => { routineDay = addDays(day, -1); drawRoutines(); };
  $('#nextDay').onclick = () => { if (day < today) { routineDay = addDays(day, 1); drawRoutines(); } };
  const box = $('#routineList');
  // その日やらない日課（曜日が違う）も下に薄く出す。押せない・集計に入らない
  const rest = routines
    .filter(r => !list.includes(r) && tsDay(r.created_at) <= day && (!r.archived_at || tsDay(r.archived_at) > day))
    .sort((a, b) => a.sort_order - b.sort_order || a.routine_id.localeCompare(b.routine_id));
  if (!list.length && !rest.length) {
    box.innerHTML = `<div class="empty">${esc(tr(routines.some(r => !r.archived_at) ? 'routine.none' : 'routine.empty'))}</div>`;
  }
  list.concat(rest).forEach(r => {
    const on = routineChecks.has(checkKey(r.routine_id, day));
    const icon = routineIcon(r);
    const streak = routineItemStreak(r);
    const dots = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(day, -i);
      const scheduled = (r.weekdays & (1 << weekdayOf(d))) && tsDay(r.created_at) <= d;
      dots.push(`<i class="${!scheduled ? 'off' : routineChecks.has(checkKey(r.routine_id, d)) ? 'done' : ''}"></i>`);
    }
    const off = rest.includes(r);
    const row = document.createElement(off ? 'div' : 'button');
    if (!off) row.type = 'button';
    row.className = 'rcard' + (on ? ' on' : '') + (off ? ' rest' : '');
    row.style.setProperty('--c', icon.color);
    const side = off ? `<span class="rrest">${esc(tr('routine.rest'))}</span>` : `<span class="rchk">${on ? '✓' : ''}</span>`;
    row.innerHTML = `<span class="ricon">${icon.emoji}</span><span class="rbody"><span class="rname">${esc(r.name)}</span>${r.memo ? `<span class="rmemo">${esc(r.memo)}</span>` : ''}<span class="rdots">${dots.join('')}</span></span><span class="rside"><span class="rstreak${streak ? '' : ' zero'}">📚${streak}</span>${side}</span>`;
    if (!off) row.onclick = () => toggleRoutine(r, day);
    box.appendChild(row);
  });
  const closeBtn = /** @type {HTMLButtonElement} */ ($('#closeDay'));
  closeBtn.onclick = () => withBusyButton(closeBtn, () => closeRoutineDay(day));
}

async function toggleRoutine(r, day) {
  const key = checkKey(r.routine_id, day);
  const wasOn = routineChecks.has(key);
  if (wasOn) routineChecks.delete(key); else routineChecks.add(key);
  drawRoutines();
  const req = wasOn
    ? sb.from('quest_routine_checks').delete().eq('routine_id', r.routine_id).eq('day', day)
    : sb.from('quest_routine_checks').insert({ routine_id: r.routine_id, user_id: session.user.id, day });
  const { error } = await req;
  if (error) {
    if (wasOn) routineChecks.add(key); else routineChecks.delete(key);
    drawRoutines();
    alert(error.message);
  }
}

// ---------- 編集 ----------

function drawRoutineEditor(body) {
  const list = activeRoutines();
  body.innerHTML = `<div class="list-window" id="routineEditList"></div>${list.length > 1 ? `<div class="reorderhint">${esc(tr('reorderHint'))}</div>` : ''}<button type="button" class="plainbtn addstatus" id="addRoutine">${esc(tr('routine.add'))}</button>`;
  const box = $('#routineEditList');
  list.forEach((r, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'subject';
    d.dataset.routineId = r.routine_id;
    d.innerHTML = `<span class="gutter">${String(i + 1).padStart(2, '0')}</span><span class="subjectbody"><span class="subjectline"><span class="icon">${routineIcon(r).emoji}</span><span class="name routinename">${esc(r.name)}</span></span><span class="meta">${esc(weekdaysLabel(r.weekdays))}${r.memo ? ` · ${esc(r.memo)}` : ''}</span></span>`;
    d.onclick = () => { if (!reorderJustEnded) openRoutineModal(r); };
    box.appendChild(d);
  });
  if (!list.length) box.remove();
  else if (list.length > 1) enableStatusReorder(box, saveRoutineOrder);
  $('#addRoutine').onclick = () => openRoutineModal(null);
}

async function saveRoutineOrder(ids) {
  const changed = [];
  ids.forEach((id, i) => {
    const r = routines.find(x => x.routine_id === id);
    const order = (i + 1) * 10;
    if (r && r.sort_order !== order) { r.sort_order = order; changed.push(r); }
  });
  drawRoutines();
  if (!changed.length) return;
  const results = await Promise.all(changed.map(r => sb.from('quest_routines').update({ sort_order: r.sort_order }).eq('routine_id', r.routine_id)));
  const failed = results.find(x => x.error);
  if (failed) alert(failed.error.message);
}

function openRoutineModal(routine) {
  const names = tr('routine.wd').split(',');
  const bits = routine ? routine.weekdays : 127;
  let iconKey = ROUTINE_ICONS[routine?.icon] ? routine.icon : 'other';
  const { bg, close } = openModal(`<h3>${esc(tr(routine ? 'routine.editTitle' : 'routine.addTitle'))}</h3>
    <div class="modalform"><input id="routineName" maxlength="80" placeholder="${esc(tr('routine.name'))}"><input id="routineMemo" maxlength="80" placeholder="${esc(tr('routine.memo'))}"></div>
    <div class="modallabel">${esc(tr('routine.icon'))}</div>
    <div class="iconpicks">${Object.entries(ROUTINE_ICONS).map(([key, ic]) => `<button type="button" class="iconpick${key === iconKey ? ' on' : ''}" data-icon="${key}" style="--c:${ic.color}">${ic.emoji}</button>`).join('')}</div>
    <div class="modallabel">${esc(tr('routine.weekdays'))}</div>
    <div class="weekdaypicks">${names.map((n, i) => `<label class="weekdaypick"><input type="checkbox" value="${i}"${bits & (1 << i) ? ' checked' : ''}><span>${esc(n)}</span></label>`).join('')}</div>
    <div class="actions">${routine ? `<button type="button" class="dangerbtn" id="deleteRoutine">${esc(tr('delete'))}</button>` : ''}<button type="button" data-close>${esc(tr('cancel'))}</button><button type="button" class="savebtn" id="saveRoutine">${esc(tr('save'))}</button></div>`);
  const input = bg.querySelector('#routineName');
  const memoInput = bg.querySelector('#routineMemo');
  input.value = routine?.name || '';
  memoInput.value = routine?.memo || '';
  bg.querySelectorAll('.iconpick').forEach(btn => btn.onclick = () => {
    iconKey = btn.dataset.icon;
    bg.querySelectorAll('.iconpick').forEach(b => b.classList.toggle('on', b === btn));
  });
  input.focus();
  const saveBtn = bg.querySelector('#saveRoutine');
  saveBtn.onclick = () => withBusyButton(saveBtn, async () => {
    const name = input.value.trim().slice(0, 80);
    const memo = memoInput.value.trim().slice(0, 80) || null;
    const weekdays = [...bg.querySelectorAll('.weekdaypick input:checked')].reduce((n, c) => n | (1 << Number(c.value)), 0);
    if (!name || !weekdays) return;
    if (routine) {
      if (!(await runQuery(sb.from('quest_routines').update({ name, weekdays, icon: iconKey, memo }).eq('routine_id', routine.routine_id)))) return;
      Object.assign(routine, { name, weekdays, icon: iconKey, memo });
    } else {
      const row = await runQuery(sb.from('quest_routines').insert({
        user_id: session.user.id,
        name,
        weekdays,
        icon: iconKey,
        memo,
        sort_order: nextSortOrder(activeRoutines())
      }).select().single());
      if (!row) return;
      routines.push(row);
    }
    close();
    drawRoutines();
  });
  if (routine) {
    bg.querySelector('#deleteRoutine').onclick = async () => {
      if (!confirm(tr('routine.confirmDelete', { name: routine.name }))) return;
      const archived_at = new Date().toISOString();
      if (!(await runQuery(sb.from('quest_routines').update({ archived_at }).eq('routine_id', routine.routine_id)))) return;
      routine.archived_at = archived_at;
      close();
      drawRoutines();
    };
  }
}

// ---------- Googleカレンダー ----------

let gisLoading = null;

function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!gisLoading) {
    gisLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { gisLoading = null; s.remove(); reject(new Error(tr('routine.gisFailed'))); };
      document.head.appendChild(s);
    });
  }
  return gisLoading;
}

// カレンダーの許可（1時間有効）。開き直すたびにポップアップが出ないよう端末に保存する
const CALENDAR_TOKEN_KEY = 'lifeQuestCalendarToken';
let calendarToken = null;
try { calendarToken = JSON.parse(localStorage.getItem(CALENDAR_TOKEN_KEY) || 'null'); } catch { calendarToken = null; }

function saveCalendarToken(token) {
  calendarToken = token;
  try {
    if (token) localStorage.setItem(CALENDAR_TOKEN_KEY, JSON.stringify(token));
    else localStorage.removeItem(CALENDAR_TOKEN_KEY);
  } catch {}
}

async function getCalendarToken() {
  if (calendarToken?.value && calendarToken.userId === session.user.id && calendarToken.expiresAt > Date.now() + 60000) return calendarToken.value;
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: CALENDAR_SCOPE,
      login_hint: session.user.email || undefined,
      callback: r => {
        if (r.error) { reject(new Error(r.error_description || r.error)); return; }
        if (!google.accounts.oauth2.hasGrantedAllScopes(r, CALENDAR_SCOPE)) { reject(new Error(tr('routine.noScope'))); return; }
        saveCalendarToken({ value: r.access_token, userId: session.user.id, expiresAt: Date.now() + Number(r.expires_in || 3600) * 1000 });
        resolve(r.access_token);
      },
      error_callback: e => reject(new Error(e?.message || e?.type || tr('routine.noScope')))
    });
    client.requestAccessToken();
  });
}

// 404 は null を返す（無いカレンダー・まだ無い予定）
async function gcal(token, method, path, body) {
  const res = await fetch(CALENDAR_API + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 404) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) saveCalendarToken(null);
    throw new Error(data?.error?.message || `Google Calendar ${res.status}`);
  }
  return data;
}

async function ensureRoutineCalendar(token) {
  if (routineCalendarId && await gcal(token, 'GET', `/calendars/${encodeURIComponent(routineCalendarId)}`)) return routineCalendarId;
  const cal = await gcal(token, 'POST', '/calendars', { summary: tr('routine.calendarName'), timeZone: ROUTINE_TZ });
  const { error } = await sb.from('quest_routine_settings').upsert({ user_id: session.user.id, calendar_id: cal.id });
  if (error) throw error;
  routineCalendarId = cal.id;
  return cal.id;
}

// 1日1件の終日予定。予定IDを日付から決めるので、押し直しても同じ予定を上書きするだけ
function routineEventBody(day) {
  const { list, total, done } = dayResult(day);
  const marks = list.map(r => routineChecks.has(checkKey(r.routine_id, day)) ? '✅' : '⬜').join('');
  return {
    summary: `${tr('routine.title')} ${done}/${total} ${marks}`,
    description: list.map(r => `${routineChecks.has(checkKey(r.routine_id, day)) ? '✓' : '✗'} ${routineIcon(r).emoji} ${r.name}`).join('\n'),
    start: { date: day },
    end: { date: addDays(day, 1) },
    // 緑 = 全部、黄 = 半分以上、赤 = それ未満
    colorId: done === total ? '10' : done * 2 >= total ? '5' : '11',
    transparency: 'transparent',
    status: 'confirmed'
  };
}

async function closeRoutineDay(day) {
  const msg = $('#routineMessage');
  const show = (text, isError) => { if (msg) { msg.textContent = text; msg.classList.toggle('error', Boolean(isError)); } };
  if (!dayResult(day).total) return;
  show(tr('routine.closing'));
  try {
    const token = await getCalendarToken();
    const calId = encodeURIComponent(await ensureRoutineCalendar(token));
    const eventId = `lq${day.replace(/-/g, '')}`;
    const body = routineEventBody(day);
    const updated = await gcal(token, 'PUT', `/calendars/${calId}/events/${eventId}`, body);
    if (!updated) await gcal(token, 'POST', `/calendars/${calId}/events`, { id: eventId, ...body });
    show(tr('routine.closed'));
  } catch (e) {
    console.error(e);
    show(e?.message || String(e), true);
  }
}

document.querySelector('[data-tab="routines"]').onclick = renderRoutines;
