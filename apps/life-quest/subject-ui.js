const openAreaIds = new Set();
let editMode = false;

// プリセットのドット絵アイコン（icons/<subject_id>.svg）。無いプリセットと自作ステータスは絵文字。
const PIXEL_ICON_IDS = new Set(['math', 'physics', 'astronomy', 'earth-science', 'chemistry', 'biology', 'computer-science', 'architecture', 'design', 'agriculture', 'medicine', 'dentistry', 'pharmacy', 'political-science', 'military-defense', 'law', 'economics', 'business-administration', 'sociology', 'education', 'philosophy', 'religious-studies', 'psychology', 'linguistics-languages', 'anthropology-archaeology', 'history', 'geography', 'literature', 'art', 'english', 'strength', 'assets']);

function presetIconMarkup(preset) {
  return PIXEL_ICON_IDS.has(preset.subject_id)
    ? `<img class="pixicon" src="./icons/${esc(preset.subject_id)}.svg" alt="" width="16" height="16">`
    : esc(preset.icon);
}

function subjectIconMarkup(subject) {
  if (subject.preset && !subject.status?.icon && PIXEL_ICON_IDS.has(subject.preset.subject_id)) return `<span class="icon">${presetIconMarkup(subject.preset)}</span>`;
  return `<span class="icon">${esc(subject.icon)}</span>`;
}

// ---------- ステータスの組み立て ----------

function presetOf(status) {
  return status.preset_subject_id ? subjects.find(s => s.subject_id === status.preset_subject_id) || null : null;
}

function statusView(status) {
  const preset = presetOf(status);
  if (status.preset_subject_id && !preset) return null;
  return {
    status,
    preset,
    name_ja: status.name_ja || preset?.name_ja || '',
    name_en: status.name_en ?? preset?.name_en ?? '',
    icon: status.icon ?? preset?.icon ?? ''
  };
}

function findStatus(statusId) {
  return userStatuses.find(s => s.status_id === statusId) || null;
}

function visibleStatuses() {
  return userStatuses
    .filter(s => !s.hidden && statusView(s))
    .sort((a,b) => a.sort_order - b.sort_order || String(a.status_id).localeCompare(String(b.status_id)));
}

function presetTopicView(t) {
  return { id: t.topic_id, name: t.name, name_en: t.name_en || '', source: t.source, type: t.input_type || 'check', unit: t.unit || '', custom: false, importance: t.importance || 0, row: t };
}

function userTopicView(t) {
  return { id: t.topic_id, name: t.name, name_en: t.name_en || '', source: null, type: t.input_type, unit: t.unit || '', custom: true, importance: 2, row: t };
}

function statusFields(status) {
  const presetFields = status.preset_subject_id
    ? orderedFields(status.preset_subject_id).map(f => ({
        id: f.field_id,
        name: f.name,
        name_en: f.name_en || '',
        custom: false,
        row: f,
        topics: fieldTopics(f.field_id).map(presetTopicView)
      }))
    : [];
  const ownFields = userFields
    .filter(f => f.status_id === status.status_id)
    .sort((a,b) => a.sort_order - b.sort_order || a.field_id.localeCompare(b.field_id))
    .map(f => ({
      id: f.field_id,
      name: f.name,
      name_en: f.name_en || '',
      custom: true,
      row: f,
      topics: userTopics.filter(t => t.field_id === f.field_id)
        .sort((a,b) => a.sort_order - b.sort_order || a.topic_id.localeCompare(b.topic_id))
        .map(userTopicView)
    }));
  return [...presetFields, ...ownFields];
}

function isMastered(t) {
  return t.custom ? Boolean(t.row.mastered_at) : mastery.has(t.id);
}

function topicValueRows(t) {
  return topicValues.filter(v => t.custom ? v.user_topic_id === t.id : v.topic_id === t.id);
}

// 円・万円は「1,000,000 YEN」表記（万円は円に換算）
const YEN_UNITS = { '円': 1, '万円': 10000 };

function formatValue(value, unit) {
  const n = Number(value);
  if (Number.isFinite(n) && unit && YEN_UNITS[unit]) {
    return `${Math.round(n * YEN_UNITS[unit]).toLocaleString('en-US')} YEN`;
  }
  const text = Number.isFinite(n) ? n.toLocaleString('ja-JP', { maximumFractionDigits: 6 }) : String(value);
  return unit ? `${text} ${unit}` : text;
}

// チェック項目がなく入力項目だけのステータス（資産など）は★の代わりに最新の値を出す
function statusHeadlineValue(status) {
  if (statusCheckTopics(status).length) return null;
  const nums = statusFields(status).flatMap(f => f.topics).filter(t => t.type === 'number');
  if (!nums.length) return null;
  for (const t of nums) {
    const latest = topicValueRows(t)[0];
    if (latest) return formatValue(latest.value, t.unit);
  }
  return '—';
}

function statusBadgeMarkup(status, count) {
  const value = statusHeadlineValue(status);
  if (value !== null) return `<span class="stars amount${value === '—' ? ' zero' : ''}">${esc(value)}</span>`;
  return `<span class="stars${count ? '' : ' zero'}">★${count}</span>`;
}

function statusCheckTopics(status) {
  return statusFields(status).flatMap(f => f.topics).filter(t => t.type === 'check');
}

function statusMasteryCount(status) {
  return statusCheckTopics(status).reduce((n,t) => n + (isMastered(t) ? 1 : 0), 0);
}

// 新しくプリセットを選んだときの並び: 資産 → 筋力 → 英語 → 29学問（学問内は quest_subjects.sort_order 順）
const PRESET_FIRST = ['assets', 'strength', 'english'];

function presetRank(subjectId) {
  const i = PRESET_FIRST.indexOf(subjectId);
  if (i >= 0) return i - PRESET_FIRST.length;
  return subjects.find(s => s.subject_id === subjectId)?.sort_order ?? 9999;
}

function sortPresetIds(ids) {
  return [...ids].sort((a, b) => presetRank(a) - presetRank(b));
}

function nextSortOrder(rows) {
  return rows.reduce((max, r) => Math.max(max, r.sort_order || 0), 0) + 10;
}

async function runQuery(query) {
  const { data, error } = await query;
  if (error) { alert(error.message); return null; }
  return data ?? true;
}

function openModal(inner) {
  const bg = document.createElement('div');
  bg.className = 'modalbg';
  bg.innerHTML = `<div class="modal">${inner}</div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  bg.onclick = e => { if (e.target === bg) close(); };
  const cancel = bg.querySelector('[data-close]');
  if (cancel) cancel.onclick = close;
  return { bg, close };
}

// ---------- ステータス一覧 ----------

renderHome = function renderStatusHome() {
  currentSubjectId = null;
  openAreaIds.clear();
  editMode = false;
  setView('home');
  const m = main();
  m.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'list-window';
  visibleStatuses().forEach(status => {
    const v = statusView(status);
    const count = statusMasteryCount(status);
    const sub = localSubName(v);
    const meta = sub ? `<div class="meta">${esc(sub)}</div>` : '';
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'subject statusrow';
    d.innerHTML = `<span class="subjectbody"><span class="subjectline">${subjectIconMarkup(v)}<span class="name">${esc(localName(v))}</span>${statusBadgeMarkup(status, count)}</span>${meta}</span>`;
    d.dataset.statusId = status.status_id;
    d.onclick = () => { if (!reorderJustEnded) renderSubject(status.status_id); };
    list.appendChild(d);
  });
  if (list.children.length) {
    m.appendChild(list);
    if (statusFeatureAvailable && list.children.length > 1) {
      enableStatusReorder(list);
      const hint = document.createElement('div');
      hint.className = 'reorderhint';
      hint.textContent = tr('reorderHint');
      m.appendChild(hint);
    }
  }
  if (statusFeatureAvailable) {
    const add = document.createElement('button');
    add.className = 'plainbtn addstatus';
    add.type = 'button';
    add.textContent = tr('addStatusBtn');
    add.onclick = openAddStatus;
    m.appendChild(add);
  }
};

// ---------- ステータスの並べ替え（長押しでドラッグ） ----------

let reorderJustEnded = false;
let reorderActive = false;
// ドラッグ中はスクロールさせない（passive: false でないと止められない）
document.addEventListener('touchmove', e => { if (reorderActive) e.preventDefault(); }, { passive: false });

// 日課の並べ替え（routine-ui.js）も同じ動きを使う。onOrder に並べ替え後のIDの配列を渡す
function enableStatusReorder(list, onOrder = saveStatusOrder) {
  const HOLD_MS = 450;
  const MOVE_TOLERANCE = 8;
  let timer = null, row = null, pointerId = null, startX = 0, startY = 0, lastY = 0, grabOffset = 0, scrollRaf = 0;

  list.addEventListener('contextmenu', e => { if (row) e.preventDefault(); });

  const cancelHold = () => { clearTimeout(timer); timer = null; };

  const place = () => {
    // ドラッグ中の行を指の位置に追従させ、中点を越えたら隣と入れ替える
    row.style.transform = '';
    let rect = row.getBoundingClientRect();
    const box = list.getBoundingClientRect();
    const targetTop = Math.min(Math.max(lastY - grabOffset, box.top), box.bottom - rect.height);
    const prev = row.previousElementSibling, next = row.nextElementSibling;
    if (prev && targetTop < prev.getBoundingClientRect().top + prev.offsetHeight / 2) list.insertBefore(row, prev);
    else if (next && targetTop + rect.height > next.getBoundingClientRect().top + next.offsetHeight / 2) list.insertBefore(next, row);
    rect = row.getBoundingClientRect();
    row.style.transform = `translateY(${targetTop - rect.top}px)`;
  };

  const autoScroll = () => {
    if (!reorderActive) return;
    const edge = 70, bottomEdge = window.innerHeight - 110;
    let dy = 0;
    if (lastY < edge) dy = -Math.ceil((edge - lastY) / 6);
    else if (lastY > bottomEdge) dy = Math.ceil((lastY - bottomEdge) / 6);
    if (dy) { window.scrollBy(0, dy); place(); }
    scrollRaf = requestAnimationFrame(autoScroll);
  };

  const startDrag = () => {
    timer = null;
    reorderActive = true;
    const rect = row.getBoundingClientRect();
    grabOffset = startY - rect.top;
    lastY = startY;
    row.classList.add('dragging');
    list.classList.add('reordering');
    if (navigator.vibrate) navigator.vibrate(15);
    scrollRaf = requestAnimationFrame(autoScroll);
  };

  const finish = async () => {
    cancelHold();
    if (!reorderActive) { row = null; return; }
    reorderActive = false;
    cancelAnimationFrame(scrollRaf);
    row.classList.remove('dragging');
    row.style.transform = '';
    list.classList.remove('reordering');
    row = null;
    reorderJustEnded = true;
    setTimeout(() => { reorderJustEnded = false; }, 80);
    const ids = [...list.children].map(el => el.dataset.statusId || el.dataset.routineId);
    await onOrder(ids);
  };

  list.addEventListener('pointerdown', e => {
    if (e.button !== 0 || reorderActive) return;
    const target = /** @type {HTMLElement} */ (e.target).closest('.subject');
    if (!target || target.parentElement !== list) return;
    row = target; pointerId = e.pointerId; startX = e.clientX; startY = e.clientY;
    timer = setTimeout(startDrag, HOLD_MS);
  });
  // 行を入れ替えるとポインタキャプチャが外れるので、移動・離す操作は window で拾う
  const onMove = e => {
    if (!row || e.pointerId !== pointerId) return;
    if (timer && (Math.abs(e.clientX - startX) > MOVE_TOLERANCE || Math.abs(e.clientY - startY) > MOVE_TOLERANCE)) { cancelHold(); row = null; return; }
    if (reorderActive) { e.preventDefault(); lastY = e.clientY; place(); }
  };
  const onEnd = e => {
    if (e.pointerId !== pointerId) return;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onEnd);
    window.removeEventListener('pointercancel', onEnd);
    finish();
  };
  list.addEventListener('pointerdown', () => {
    if (!row) return;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
  });
}

async function saveStatusOrder(ids) {
  const changed = [];
  ids.forEach((id, i) => {
    const s = findStatus(id);
    const order = (i + 1) * 10;
    if (s && s.sort_order !== order) { s.sort_order = order; changed.push(s); }
  });
  renderHome();
  if (!changed.length) return;
  const results = await Promise.all(changed.map(s => sb.from('quest_user_statuses').update({ sort_order: s.sort_order }).eq('status_id', s.status_id)));
  const failed = results.find(r => r.error);
  if (failed) alert(failed.error.message);
}

function presetGroups(presetList) {
  const groups = [];
  presetList.forEach(p => {
    const key = p.preset_group || '';
    let g = groups.find(x => x.key === key);
    if (!g) { g = { key, items: [] }; groups.push(g); }
    g.items.push(p);
  });
  return groups;
}

function isPresetVisible(subjectId) {
  return userStatuses.some(s => s.preset_subject_id === subjectId && !s.hidden);
}

// 保存中にもう一度押されると同じプリセットを二重に追加して一意制約に当たるので、
// 実行中は受け付けない。新規分は1回の insert にまとめる（1件ずつだと30件超で数秒かかる）。
let addingPresets = false;

async function addPresets(subjectIds) {
  if (addingPresets) return false;
  addingPresets = true;
  try {
    const inserts = [];
    let order = nextSortOrder(userStatuses);
    for (const subjectId of sortPresetIds(subjectIds)) {
      const existing = userStatuses.find(s => s.preset_subject_id === subjectId);
      if (existing) {
        if (!existing.hidden) continue;
        const ok = await runQuery(sb.from('quest_user_statuses').update({ hidden: false }).eq('status_id', existing.status_id));
        if (!ok) return false;
        existing.hidden = false;
      } else if (!inserts.some(r => r.preset_subject_id === subjectId)) {
        inserts.push({ user_id: session.user.id, preset_subject_id: subjectId, sort_order: order });
        order += 10;
      }
    }
    if (inserts.length) {
      const rows = await runQuery(sb.from('quest_user_statuses').insert(inserts).select());
      if (!rows) return false;
      userStatuses.push(...rows);
    }
    return true;
  } finally {
    addingPresets = false;
  }
}

// 押したボタンを処理中は無効にする
async function withBusyButton(btn, fn) {
  if (btn.disabled) return;
  btn.disabled = true;
  try { return await fn(); } finally { btn.disabled = false; }
}

function openAddStatus() {
  const available = subjects.filter(s => !isPresetVisible(s.subject_id));
  const groupsHtml = presetGroups(available).map(g => `
    <div class="presetgroup">
      ${g.key ? `<div class="presetgrouphead"><span>${esc(groupLabel(g.key))}</span><button type="button" class="plainbtn small" data-group="${esc(g.key)}">${esc(tr('addAll'))}</button></div>` : ''}
      <div class="presetchoices">${g.items.map(p => `<button type="button" class="racebtn" data-preset="${esc(p.subject_id)}">${presetIconMarkup(p)} ${esc(localName(p))}</button>`).join('')}</div>
    </div>`).join('');
  const { bg, close } = openModal(`<h3>${esc(tr('addStatus'))}</h3>
    <div class="modallabel">${esc(tr('presets'))}</div>
    ${groupsHtml || `<div class="modalnote">${esc(tr('noPresets'))}</div>`}
    <div class="modallabel">${esc(tr('makeOwn'))}</div>
    <div class="modalform">
      <input id="newStatusIcon" maxlength="8" placeholder="${esc(tr('phIcon'))}">
      <input id="newStatusName" maxlength="40" placeholder="${esc(tr('phName'))}">
      <input id="newStatusEn" maxlength="60" placeholder="${esc(tr('phNameEn'))}">
    </div>
    <div class="actions"><button type="button" data-close>${esc(tr('close'))}</button><button type="button" class="savebtn" id="createStatus">${esc(tr('create'))}</button></div>`);
  const done = () => { close(); renderProfile(); renderHome(); };
  bg.querySelectorAll('[data-preset]').forEach(btn => btn.onclick = () => withBusyButton(btn, async () => {
    if (await addPresets([btn.dataset.preset])) done();
  }));
  bg.querySelectorAll('[data-group]').forEach(btn => btn.onclick = () => withBusyButton(btn, async () => {
    const ids = available.filter(p => (p.preset_group || '') === btn.dataset.group).map(p => p.subject_id);
    if (await addPresets(ids)) done();
  }));
  bg.querySelector('#createStatus').onclick = async () => {
    const name = bg.querySelector('#newStatusName').value.trim();
    if (!name) return;
    const row = await runQuery(sb.from('quest_user_statuses').insert({
      user_id: session.user.id,
      name_ja: name.slice(0, 40),
      name_en: bg.querySelector('#newStatusEn').value.trim().slice(0, 60),
      icon: bg.querySelector('#newStatusIcon').value.trim().slice(0, 8),
      sort_order: nextSortOrder(userStatuses)
    }).select().single());
    if (!row) return;
    userStatuses.push(row);
    done();
  };
}

// ---------- 初回セットアップ ----------

function renderSetup() {
  setActiveTab('subjects');
  const m = main();
  const groupsHtml = presetGroups(subjects).map((g, gi) => `
    <div class="presetgroup">
      ${g.key ? `<label class="setupcheck setupgroup"><input type="checkbox" data-groupcheck="${gi}"><span>${esc(tr('groupAll', { group: groupLabel(g.key) }))}</span></label>` : ''}
      <div class="setuplist">${g.items.map(p => `<label class="setupcheck"><input type="checkbox" data-group-index="${gi}" value="${esc(p.subject_id)}"><span>${presetIconMarkup(p)} ${esc(localName(p))}</span></label>`).join('')}</div>
    </div>`).join('');
  m.innerHTML = `<div class="settings setup"><div class="pagehead"><h2>${esc(tr('choosePresets'))}</h2></div><div class="list-window setupwin">${groupsHtml}</div><button type="button" class="primarybtn" id="startQuest">${esc(tr('start'))}</button></div>`;
  m.querySelectorAll('[data-groupcheck]').forEach(box => box.onchange = () => {
    m.querySelectorAll(`[data-group-index="${box.dataset.groupcheck}"]`).forEach(c => { c.checked = box.checked; });
  });
  const startBtn = /** @type {HTMLButtonElement} */ (m.querySelector('#startQuest'));
  startBtn.onclick = () => withBusyButton(startBtn, async () => {
    const ids = [...m.querySelectorAll('[data-group-index]:checked')].map(c => c.value);
    if (!(await addPresets(ids))) return;
    const res = await runQuery(sb.from('quest_user_settings').upsert({ user_id: session.user.id, setup_completed_at: new Date().toISOString() }).select().single());
    if (!res) return;
    userSettings = res;
    renderProfile();
    renderHome();
  });
}

// ---------- ステータス画面 ----------

renderSubject = function renderStatusScreen(statusId) {
  const status = findStatus(statusId);
  if (!status) { renderHome(); return; }
  if (currentSubjectId !== statusId) { openAreaIds.clear(); editMode = false; }
  currentSubjectId = statusId;
  const v = statusView(status);
  const all = statusFields(status).flatMap(f => f.topics);
  const count = statusMasteryCount(status);
  const searchable = all.length >= 10;
  setView('subject');
  window.scrollTo(0, 0);
  const m = main();
  m.innerHTML = `<button class="back" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>${esc(tr('back'))}</button><div class="mathhead window">${subjectIconMarkup(v)}<div class="headname"><h2>${esc(localName(v))}</h2><span class="en">${esc(localSubName(v))}</span></div>${statusBadgeMarkup(status, count)}${statusFeatureAvailable ? `<button type="button" class="plainbtn small editmode" id="editMode">${esc(tr(editMode ? 'done' : 'edit'))}</button>` : ''}</div>${editMode ? `<div class="edittools"><button type="button" class="plainbtn small" id="editStatus">${esc(tr('editStatus'))}</button><button type="button" class="plainbtn small" id="addField">${esc(tr('addFieldBtn'))}</button></div>` : ''}${searchable ? `<label class="searchbox"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg><input class="search" placeholder="${esc(tr('searchTopics'))}" id="q"></label>` : ''}<div id="topics" class="list-window"></div>`;
  const back = /** @type {HTMLButtonElement} */ (m.querySelector('.back'));
  back.onclick = () => { setActiveTab('subjects'); renderHome(); };
  if (statusFeatureAvailable) {
    $('#editMode').onclick = () => { editMode = !editMode; renderSubject(statusId); };
  }
  if (editMode) {
    $('#editStatus').onclick = () => openEditStatus(status);
    $('#addField').onclick = () => openFieldModal(status, null);
  }
  if (searchable) {
    const q = $('#q');
    q.value = currentSearch;
    q.oninput = () => { currentSearch = q.value; drawSubject(statusId, currentSearch); };
  } else {
    currentSearch = '';
  }
  drawSubject(statusId, searchable ? currentSearch : '');
};

drawSubject = function drawStatusTopics(statusId, query) {
  const box = $('#topics');
  if (!box) return;
  const status = findStatus(statusId);
  if (!status) return;
  box.innerHTML = '';
  const fs = statusFields(status);
  const q = query.trim().toLowerCase();
  let shown = 0;

  fs.forEach(f => {
    const list = f.topics.filter(t => !q || `${t.name}\n${t.name_en}\n${t.source || ''}\n${f.name}\n${f.name_en}`.toLowerCase().includes(q));
    const fname = pairName(f.name, f.name_en);
    const showEmptyCustom = editMode && f.custom && !q;
    if (!list.length && !showEmptyCustom) return;

    shown += list.length;
    const checkTopics = f.topics.filter(t => t.type === 'check');
    const masteredCount = checkTopics.reduce((n, t) => n + (isMastered(t) ? 1 : 0), 0);
    const progress = checkTopics.length ? `<span class="area-progress">${masteredCount}/${checkTopics.length}</span>` : '';
    const isOpen = openAreaIds.has(f.id);
    const sec = document.createElement('section');
    sec.className = 'area';
    sec.innerHTML = `<h3><button class="area-toggle" type="button" aria-expanded="${isOpen}"><span class="area-toggle-main"><span class="area-names"><span class="area-name">${esc(fname.main)}</span>${fname.sub ? `<span class="area-sub">${esc(fname.sub)}</span>` : ''}</span>${progress}</span></button></h3>${editMode && f.custom ? `<div class="edittools"><button type="button" class="plainbtn small" data-act="addTopic">${esc(tr('addTopicBtn'))}</button><button type="button" class="plainbtn small" data-act="editField">${esc(tr('editField'))}</button></div>` : ''}<div class="area-topics"${isOpen ? '' : ' hidden'}></div>`;

    const toggle = /** @type {HTMLButtonElement} */ (sec.querySelector('.area-toggle'));
    const topicBox = /** @type {HTMLDivElement} */ (sec.querySelector('.area-topics'));
    toggle.onclick = () => {
      if (openAreaIds.has(f.id)) openAreaIds.delete(f.id);
      else openAreaIds.add(f.id);
      const open = openAreaIds.has(f.id);
      toggle.setAttribute('aria-expanded', String(open));
      topicBox.hidden = !open;
    };
    if (editMode && f.custom) {
      sec.querySelector('[data-act="addTopic"]').onclick = () => openTopicModal(status, f.row, null);
      sec.querySelector('[data-act="editField"]').onclick = () => openFieldModal(status, f.row);
    }

    list.forEach(t => {
      const d = document.createElement('div');
      const source = t.source && t.source !== '仮トピック' ? `<div class="source">${esc(t.source)}</div>` : '';
      const tname = pairName(t.name, t.name_en);
      const names = `<div class="tname">${esc(tname.main)}</div>${tname.sub ? `<div class="tsub">${esc(tname.sub)}</div>` : ''}`;
      if (t.type === 'number') {
        const latest = topicValueRows(t)[0];
        d.className = 'topic numtopic';
        d.innerHTML = `<div class="topicbody">${names}${source}</div><div class="numvalue">${latest ? esc(formatValue(latest.value, t.unit)) : '—'}</div>`;
        d.onclick = () => (editMode && t.custom) ? openTopicModal(status, userFields.find(x => x.field_id === t.row.field_id), t.row) : openValueModal(t, statusId, query);
      } else {
        const on = isMastered(t);
        d.className = 'topic' + (on ? ' on' : '');
        d.innerHTML = `<div class="check">${on ? '✓' : ''}</div><div class="topicbody">${names}${source}</div>${on ? '<div class="master">MASTER!</div>' : ''}`;
        if (editMode && t.custom) d.onclick = () => openTopicModal(status, userFields.find(x => x.field_id === t.row.field_id), t.row);
        else if (t.custom) d.onclick = () => toggleUserTopic(t.row, statusId, query);
        else d.onclick = () => toggleTopic(t.id, on, statusId, query);
      }
      topicBox.appendChild(d);
    });

    box.appendChild(sec);
  });

  if (!shown && !(editMode && fs.some(f => f.custom))) box.innerHTML = `<div class="empty">${esc(tr('noResults'))}</div>`;
};

async function toggleUserTopic(row, statusId, query) {
  const prev = row.mastered_at;
  row.mastered_at = prev ? null : new Date().toISOString();
  renderProfile();
  drawSubject(statusId, query);
  const { error } = await sb.from('quest_user_topics').update({ mastered_at: row.mastered_at }).eq('topic_id', row.topic_id);
  if (error) {
    row.mastered_at = prev;
    renderProfile();
    drawSubject(statusId, query);
    alert(error.message);
  }
}

function openValueModal(t, statusId, query) {
  const history = topicValueRows(t).slice(0, 5);
  const { bg, close } = openModal(`<h3>${esc(pairName(t.name, t.name_en).main)}</h3>
    <div class="valueinput"><input id="valueInput" type="number" step="any" inputmode="decimal">${t.unit ? `<span>${esc(t.unit)}</span>` : ''}</div>
    ${history.length ? `<div class="valuehistory">${history.map(h => `<div><span>${esc(new Date(h.recorded_at).toLocaleDateString(tr('dateLocale')))}</span><span>${esc(formatValue(h.value, t.unit))}</span></div>`).join('')}</div>` : ''}
    <div class="actions"><button type="button" data-close>${esc(tr('cancel'))}</button><button type="button" class="savebtn" id="saveValue">${esc(tr('record'))}</button></div>`);
  const input = bg.querySelector('#valueInput');
  input.focus();
  const commit = async () => {
    if (input.value.trim() === '') return;
    const value = Number(input.value);
    if (!Number.isFinite(value)) return;
    const row = await runQuery(sb.from('quest_topic_values').insert({
      user_id: session.user.id,
      topic_id: t.custom ? null : t.id,
      user_topic_id: t.custom ? t.id : null,
      value
    }).select().single());
    if (!row) return;
    topicValues.unshift(row);
    close();
    drawSubject(statusId, query);
  };
  bg.querySelector('#saveValue').onclick = commit;
  input.onkeydown = e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') close(); };
}

function openEditStatus(status) {
  const v = statusView(status);
  if (status.preset_subject_id) {
    const { bg, close } = openModal(`<h3>${esc(localName(v))}</h3>
      <div class="actions"><button type="button" data-close>${esc(tr('cancel'))}</button><button type="button" class="dangerbtn" id="hideStatus">${esc(tr('hide'))}</button></div>`);
    bg.querySelector('#hideStatus').onclick = async () => {
      if (!(await runQuery(sb.from('quest_user_statuses').update({ hidden: true }).eq('status_id', status.status_id)))) return;
      status.hidden = true;
      close();
      setActiveTab('subjects');
      renderHome();
    };
    return;
  }
  const { bg, close } = openModal(`<h3>${esc(tr('editStatus'))}</h3>
    <div class="modalform">
      <input id="editStatusIcon" maxlength="8" placeholder="${esc(tr('phIcon'))}">
      <input id="editStatusName" maxlength="40" placeholder="${esc(tr('phName'))}">
      <input id="editStatusEn" maxlength="60" placeholder="${esc(tr('phNameEn'))}">
    </div>
    <div class="actions"><button type="button" class="dangerbtn" id="deleteStatus">${esc(tr('delete'))}</button><button type="button" data-close>${esc(tr('cancel'))}</button><button type="button" class="savebtn" id="saveStatus">${esc(tr('save'))}</button></div>`);
  bg.querySelector('#editStatusIcon').value = status.icon || '';
  bg.querySelector('#editStatusName').value = status.name_ja || '';
  bg.querySelector('#editStatusEn').value = status.name_en || '';
  bg.querySelector('#saveStatus').onclick = async () => {
    const name = bg.querySelector('#editStatusName').value.trim();
    if (!name) return;
    const patch = {
      name_ja: name.slice(0, 40),
      name_en: bg.querySelector('#editStatusEn').value.trim().slice(0, 60),
      icon: bg.querySelector('#editStatusIcon').value.trim().slice(0, 8)
    };
    if (!(await runQuery(sb.from('quest_user_statuses').update(patch).eq('status_id', status.status_id)))) return;
    Object.assign(status, patch);
    close();
    renderSubject(status.status_id);
  };
  bg.querySelector('#deleteStatus').onclick = async () => {
    if (!confirm(tr('confirmDelete', { name: localName(status) }))) return;
    if (!(await runQuery(sb.from('quest_user_statuses').delete().eq('status_id', status.status_id)))) return;
    const fieldIds = new Set(userFields.filter(f => f.status_id === status.status_id).map(f => f.field_id));
    removeUserTopics(userTopics.filter(t => fieldIds.has(t.field_id)).map(t => t.topic_id));
    userFields = userFields.filter(f => !fieldIds.has(f.field_id));
    userStatuses = userStatuses.filter(s => s.status_id !== status.status_id);
    close();
    renderProfile();
    setActiveTab('subjects');
    renderHome();
  };
}

function removeUserTopics(topicIds) {
  const ids = new Set(topicIds);
  userTopics = userTopics.filter(t => !ids.has(t.topic_id));
  topicValues = topicValues.filter(v => !v.user_topic_id || !ids.has(v.user_topic_id));
}

function openFieldModal(status, field) {
  const { bg, close } = openModal(`<h3>${esc(tr(field ? 'editField' : 'addField'))}</h3>
    <div class="modalform"><input id="fieldName" maxlength="60" placeholder="${esc(tr('fieldName'))}"><input id="fieldNameEn" maxlength="60" placeholder="${esc(tr('fieldNameEn'))}"></div>
    <div class="actions">${field ? `<button type="button" class="dangerbtn" id="deleteField">${esc(tr('delete'))}</button>` : ''}<button type="button" data-close>${esc(tr('cancel'))}</button><button type="button" class="savebtn" id="saveField">${esc(tr('save'))}</button></div>`);
  const input = bg.querySelector('#fieldName');
  const inputEn = bg.querySelector('#fieldNameEn');
  input.value = field?.name || '';
  inputEn.value = field?.name_en || '';
  input.focus();
  bg.querySelector('#saveField').onclick = async () => {
    const name = input.value.trim().slice(0, 60);
    const name_en = inputEn.value.trim().slice(0, 60) || null;
    if (!name) return;
    if (field) {
      if (!(await runQuery(sb.from('quest_user_fields').update({ name, name_en }).eq('field_id', field.field_id)))) return;
      field.name = name;
      field.name_en = name_en;
    } else {
      const row = await runQuery(sb.from('quest_user_fields').insert({
        user_id: session.user.id,
        status_id: status.status_id,
        name,
        name_en,
        sort_order: nextSortOrder(userFields.filter(f => f.status_id === status.status_id))
      }).select().single());
      if (!row) return;
      userFields.push(row);
      openAreaIds.add(row.field_id);
    }
    close();
    renderSubject(status.status_id);
  };
  if (field) {
    bg.querySelector('#deleteField').onclick = async () => {
      if (!confirm(tr('confirmDelete', { name: pairName(field.name, field.name_en).main }))) return;
      if (!(await runQuery(sb.from('quest_user_fields').delete().eq('field_id', field.field_id)))) return;
      removeUserTopics(userTopics.filter(t => t.field_id === field.field_id).map(t => t.topic_id));
      userFields = userFields.filter(f => f.field_id !== field.field_id);
      close();
      renderProfile();
      renderSubject(status.status_id);
    };
  }
}

function openTopicModal(status, field, topic) {
  const { bg, close } = openModal(`<h3>${esc(tr(topic ? 'editTopic' : 'addTopic'))}</h3>
    <div class="modalform">
      <input id="topicName" maxlength="120" placeholder="${esc(tr('topicName'))}">
      <input id="topicNameEn" maxlength="120" placeholder="${esc(tr('topicNameEn'))}">
      ${topic ? '' : `<select id="topicType" class="select"><option value="check">${esc(tr('typeCheck'))}</option><option value="number">${esc(tr('typeNumber'))}</option></select>`}
      <input id="topicUnit" maxlength="20" placeholder="${esc(tr('unit'))}">
    </div>
    <div class="actions">${topic ? `<button type="button" class="dangerbtn" id="deleteTopic">${esc(tr('delete'))}</button>` : ''}<button type="button" data-close>${esc(tr('cancel'))}</button><button type="button" class="savebtn" id="saveTopic">${esc(tr('save'))}</button></div>`);
  const nameInput = bg.querySelector('#topicName');
  const nameEnInput = bg.querySelector('#topicNameEn');
  const unitInput = bg.querySelector('#topicUnit');
  const typeSelect = bg.querySelector('#topicType');
  nameInput.value = topic?.name || '';
  nameEnInput.value = topic?.name_en || '';
  unitInput.value = topic?.unit || '';
  const syncUnit = () => { unitInput.hidden = (topic ? topic.input_type : typeSelect.value) !== 'number'; };
  if (typeSelect) typeSelect.onchange = syncUnit;
  syncUnit();
  nameInput.focus();
  bg.querySelector('#saveTopic').onclick = async () => {
    const name = nameInput.value.trim().slice(0, 120);
    const name_en = nameEnInput.value.trim().slice(0, 120) || null;
    if (!name) return;
    const type = topic ? topic.input_type : typeSelect.value;
    const unit = type === 'number' ? unitInput.value.trim().slice(0, 20) || null : null;
    if (topic) {
      if (!(await runQuery(sb.from('quest_user_topics').update({ name, name_en, unit }).eq('topic_id', topic.topic_id)))) return;
      topic.name = name;
      topic.name_en = name_en;
      topic.unit = unit;
    } else {
      const row = await runQuery(sb.from('quest_user_topics').insert({
        user_id: session.user.id,
        field_id: field.field_id,
        name,
        name_en,
        input_type: type,
        unit,
        sort_order: nextSortOrder(userTopics.filter(t => t.field_id === field.field_id))
      }).select().single());
      if (!row) return;
      userTopics.push(row);
      openAreaIds.add(field.field_id);
    }
    close();
    renderSubject(status.status_id);
  };
  if (topic) {
    bg.querySelector('#deleteTopic').onclick = async () => {
      if (!confirm(tr('confirmDelete', { name: pairName(topic.name, topic.name_en).main }))) return;
      if (!(await runQuery(sb.from('quest_user_topics').delete().eq('topic_id', topic.topic_id)))) return;
      removeUserTopics([topic.topic_id]);
      close();
      renderProfile();
      renderSubject(status.status_id);
    };
  }
}
