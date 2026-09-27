const openAreaIds = new Set();
let editMode = false;

// プリセットのドット絵アイコン（icons/<subject_id>.svg）。無いプリセットと自作ステータスは絵文字。
const PIXEL_ICON_IDS = new Set(['math', 'physics', 'astronomy', 'earth-science', 'chemistry', 'biology', 'computer-science', 'architecture', 'design', 'agriculture', 'medicine', 'dentistry', 'pharmacy', 'political-science', 'military-defense', 'law', 'economics', 'business-administration', 'sociology', 'education', 'philosophy', 'religious-studies', 'psychology', 'linguistics-languages', 'anthropology-archaeology', 'history', 'geography', 'literature', 'art', 'english', 'strength']);

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
  return { id: t.topic_id, name: t.name, source: t.source, type: t.input_type || 'check', unit: t.unit || '', custom: false, importance: t.importance || 0, row: t };
}

function userTopicView(t) {
  return { id: t.topic_id, name: t.name, source: null, type: t.input_type, unit: t.unit || '', custom: true, importance: 2, row: t };
}

function statusFields(status) {
  const presetFields = status.preset_subject_id
    ? orderedFields(status.preset_subject_id).map(f => ({
        id: f.field_id,
        name: f.name,
        custom: false,
        row: f,
        topics: topics.filter(t => t.field_id === f.field_id)
          .sort((a,b) => a.recommended_order - b.recommended_order || a.topic_id.localeCompare(b.topic_id))
          .map(presetTopicView)
      }))
    : [];
  const ownFields = userFields
    .filter(f => f.status_id === status.status_id)
    .sort((a,b) => a.sort_order - b.sort_order || a.field_id.localeCompare(b.field_id))
    .map(f => ({
      id: f.field_id,
      name: f.name,
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

function formatValue(value, unit) {
  const n = Number(value);
  const text = Number.isFinite(n) ? n.toLocaleString('ja-JP', { maximumFractionDigits: 6 }) : String(value);
  return unit ? `${text} ${unit}` : text;
}

function statusCheckTopics(status) {
  return statusFields(status).flatMap(f => f.topics).filter(t => t.type === 'check');
}

function statusMasteryCount(status) {
  return statusCheckTopics(status).reduce((n,t) => n + (isMastered(t) ? 1 : 0), 0);
}

function nextStatusTopic(status) {
  const unmastered = statusCheckTopics(status).filter(t => !isMastered(t));
  if (!unmastered.length) return null;
  const prereqMap = new Map();
  prerequisites.forEach(p => {
    if (!prereqMap.has(p.topic_id)) prereqMap.set(p.topic_id, []);
    prereqMap.get(p.topic_id).push(p.prerequisite_topic_id);
  });
  const ready = unmastered.filter(t => t.custom || (prereqMap.get(t.id) || []).every(id => mastery.has(id)));
  if (!ready.length) return unmastered[0];
  return ready.reduce((best, t) => (t.importance || 0) > (best.importance || 0) ? t : best);
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
  visibleStatuses().forEach((status, i) => {
    const v = statusView(status);
    const checkCount = statusCheckTopics(status).length;
    const count = statusMasteryCount(status);
    const next = nextStatusTopic(status);
    const meta = !checkCount
      ? ''
      : next
        ? `<div class="meta"><span class="next-label">NEXT</span>${esc(next.name)}</div>`
        : '<div class="meta complete">COMPLETE</div>';
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'subject';
    d.innerHTML = `<span class="gutter">${String(i + 1).padStart(2, '0')}</span><span class="subjectbody"><span class="subjectline">${subjectIconMarkup(v)}<span class="name">${esc(localName(v))}</span><span class="en">${esc(localSubName(v))}</span><span class="stars${count ? '' : ' zero'}">★${count}</span></span>${meta}</span>`;
    d.onclick = () => renderSubject(status.status_id);
    list.appendChild(d);
  });
  if (list.children.length) m.appendChild(list);
  if (statusFeatureAvailable) {
    const add = document.createElement('button');
    add.className = 'plainbtn addstatus';
    add.type = 'button';
    add.textContent = tr('addStatusBtn');
    add.onclick = openAddStatus;
    m.appendChild(add);
  }
};

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

async function addPresets(subjectIds) {
  for (const subjectId of subjectIds) {
    const existing = userStatuses.find(s => s.preset_subject_id === subjectId);
    if (existing) {
      if (!existing.hidden) continue;
      const ok = await runQuery(sb.from('quest_user_statuses').update({ hidden: false }).eq('status_id', existing.status_id));
      if (!ok) return false;
      existing.hidden = false;
    } else {
      const row = await runQuery(sb.from('quest_user_statuses').insert({ user_id: session.user.id, preset_subject_id: subjectId, sort_order: nextSortOrder(userStatuses) }).select().single());
      if (!row) return false;
      userStatuses.push(row);
    }
  }
  return true;
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
  bg.querySelectorAll('[data-preset]').forEach(btn => btn.onclick = async () => {
    if (await addPresets([btn.dataset.preset])) done();
  });
  bg.querySelectorAll('[data-group]').forEach(btn => btn.onclick = async () => {
    const ids = available.filter(p => (p.preset_group || '') === btn.dataset.group).map(p => p.subject_id);
    if (await addPresets(ids)) done();
  });
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
  m.querySelector('#startQuest').onclick = async () => {
    const ids = [...m.querySelectorAll('[data-group-index]:checked')].map(c => c.value);
    if (!(await addPresets(ids))) return;
    const res = await runQuery(sb.from('quest_user_settings').upsert({ user_id: session.user.id, setup_completed_at: new Date().toISOString() }).select().single());
    if (!res) return;
    userSettings = res;
    renderProfile();
    renderHome();
  };
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
  m.innerHTML = `<button class="back" type="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>${esc(tr('back'))}</button><div class="mathhead window">${subjectIconMarkup(v)}<div class="headname"><h2>${esc(localName(v))}</h2><span class="en">${esc(localSubName(v))}</span></div><span class="stars${count ? '' : ' zero'}">★${count}</span>${statusFeatureAvailable ? `<button type="button" class="plainbtn small editmode" id="editMode">${esc(tr(editMode ? 'done' : 'edit'))}</button>` : ''}</div>${editMode ? `<div class="edittools"><button type="button" class="plainbtn small" id="editStatus">${esc(tr('editStatus'))}</button><button type="button" class="plainbtn small" id="addField">${esc(tr('addFieldBtn'))}</button></div>` : ''}${searchable ? `<label class="searchbox"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg><input class="search" placeholder="${esc(tr('searchTopics'))}" id="q"></label>` : ''}<div id="topics" class="list-window"></div>`;
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
    const list = f.topics.filter(t => !q || `${t.name}${t.source || ''}${f.name}`.toLowerCase().includes(q));
    const showEmptyCustom = editMode && f.custom && !q;
    if (!list.length && !showEmptyCustom) return;

    shown += list.length;
    const checkTopics = f.topics.filter(t => t.type === 'check');
    const masteredCount = checkTopics.reduce((n, t) => n + (isMastered(t) ? 1 : 0), 0);
    const progress = checkTopics.length ? `<span class="area-progress">${masteredCount}/${checkTopics.length}</span>` : '';
    const isOpen = openAreaIds.has(f.id);
    const sec = document.createElement('section');
    sec.className = 'area';
    sec.innerHTML = `<h3><button class="area-toggle" type="button" aria-expanded="${isOpen}"><span class="area-toggle-main"><span class="area-name">${esc(f.name)}</span>${progress}</span></button></h3>${editMode && f.custom ? `<div class="edittools"><button type="button" class="plainbtn small" data-act="addTopic">${esc(tr('addTopicBtn'))}</button><button type="button" class="plainbtn small" data-act="editField">${esc(tr('editField'))}</button></div>` : ''}<div class="area-topics"${isOpen ? '' : ' hidden'}></div>`;

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
      if (t.type === 'number') {
        const latest = topicValueRows(t)[0];
        d.className = 'topic numtopic';
        d.innerHTML = `<div class="topicbody"><div class="tname">${esc(t.name)}</div>${source}</div><div class="numvalue">${latest ? esc(formatValue(latest.value, t.unit)) : '—'}</div>`;
        d.onclick = () => (editMode && t.custom) ? openTopicModal(status, userFields.find(x => x.field_id === t.row.field_id), t.row) : openValueModal(t, statusId, query);
      } else {
        const on = isMastered(t);
        d.className = 'topic' + (on ? ' on' : '');
        d.innerHTML = `<div class="check">${on ? '✓' : ''}</div><div class="topicbody"><div class="tname">${esc(t.name)}</div>${source}</div>${on ? '<div class="master">MASTER!</div>' : ''}`;
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
  const { bg, close } = openModal(`<h3>${esc(t.name)}</h3>
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
    <div class="modalform"><input id="fieldName" maxlength="60" placeholder="${esc(tr('fieldName'))}"></div>
    <div class="actions">${field ? `<button type="button" class="dangerbtn" id="deleteField">${esc(tr('delete'))}</button>` : ''}<button type="button" data-close>${esc(tr('cancel'))}</button><button type="button" class="savebtn" id="saveField">${esc(tr('save'))}</button></div>`);
  const input = bg.querySelector('#fieldName');
  input.value = field?.name || '';
  input.focus();
  bg.querySelector('#saveField').onclick = async () => {
    const name = input.value.trim().slice(0, 60);
    if (!name) return;
    if (field) {
      if (!(await runQuery(sb.from('quest_user_fields').update({ name }).eq('field_id', field.field_id)))) return;
      field.name = name;
    } else {
      const row = await runQuery(sb.from('quest_user_fields').insert({
        user_id: session.user.id,
        status_id: status.status_id,
        name,
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
      if (!confirm(tr('confirmDelete', { name: field.name }))) return;
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
      ${topic ? '' : `<select id="topicType" class="select"><option value="check">${esc(tr('typeCheck'))}</option><option value="number">${esc(tr('typeNumber'))}</option></select>`}
      <input id="topicUnit" maxlength="20" placeholder="${esc(tr('unit'))}">
    </div>
    <div class="actions">${topic ? `<button type="button" class="dangerbtn" id="deleteTopic">${esc(tr('delete'))}</button>` : ''}<button type="button" data-close>${esc(tr('cancel'))}</button><button type="button" class="savebtn" id="saveTopic">${esc(tr('save'))}</button></div>`);
  const nameInput = bg.querySelector('#topicName');
  const unitInput = bg.querySelector('#topicUnit');
  const typeSelect = bg.querySelector('#topicType');
  nameInput.value = topic?.name || '';
  unitInput.value = topic?.unit || '';
  const syncUnit = () => { unitInput.hidden = (topic ? topic.input_type : typeSelect.value) !== 'number'; };
  if (typeSelect) typeSelect.onchange = syncUnit;
  syncUnit();
  nameInput.focus();
  bg.querySelector('#saveTopic').onclick = async () => {
    const name = nameInput.value.trim().slice(0, 120);
    if (!name) return;
    const type = topic ? topic.input_type : typeSelect.value;
    const unit = type === 'number' ? unitInput.value.trim().slice(0, 20) || null : null;
    if (topic) {
      if (!(await runQuery(sb.from('quest_user_topics').update({ name, unit }).eq('topic_id', topic.topic_id)))) return;
      topic.name = name;
      topic.unit = unit;
    } else {
      const row = await runQuery(sb.from('quest_user_topics').insert({
        user_id: session.user.id,
        field_id: field.field_id,
        name,
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
      if (!confirm(tr('confirmDelete', { name: topic.name }))) return;
      if (!(await runQuery(sb.from('quest_user_topics').delete().eq('topic_id', topic.topic_id)))) return;
      removeUserTopics([topic.topic_id]);
      close();
      renderProfile();
      renderSubject(status.status_id);
    };
  }
}
