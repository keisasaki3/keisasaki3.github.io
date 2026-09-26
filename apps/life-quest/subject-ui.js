const SUBJECT_ICON_PATHS = Object.freeze({
  history: './assets/subjects/history.png'
});

const openAreaIds = new Set();

function subjectIconMarkup(subjectId) {
  const src = SUBJECT_ICON_PATHS[subjectId];
  if (!src) return '';
  return `<img class="subject-icon" src="${esc(src)}" alt="" aria-hidden="true">`;
}

renderHome = function renderHomeWithSubjectIcons() {
  currentSubjectId = null;
  openAreaIds.clear();
  const m = main();
  m.innerHTML = '';
  subjects.forEach(s => {
    const count = subjectMasteryCount(s.subject_id);
    const next = nextTopic(s.subject_id);
    const d = document.createElement('div');
    d.className = 'subject';
    d.innerHTML = `<div class="subjectline">${subjectIconMarkup(s.subject_id)}<span class="name">${esc(s.name_ja)}</span><span class="en">${esc(s.name_en)}</span><span class="stars">★${count}</span></div><div class="meta">マスター済：${count}トピック　${next ? 'NEXT：'+esc(next.name) : 'COMPLETE'}</div>`;
    d.onclick = () => renderSubject(s.subject_id);
    m.appendChild(d);
  });
};

renderSubject = function renderSubjectWithCollapsibleAreas(subjectId) {
  currentSubjectId = subjectId;
  openAreaIds.clear();
  const subject = subjects.find(s => s.subject_id === subjectId);
  const list = orderedTopics(subjectId);
  const count = subjectMasteryCount(subjectId);
  const searchable = list.length >= 10;
  const m = main();
  m.innerHTML = `<button class="back">← 学問</button><div class="mathhead">${subjectIconMarkup(subject.subject_id)}<h2>${esc(subject.name_ja)}</h2><span class="en">${esc(subject.name_en)}</span><span class="stars">★${count}</span></div>${searchable ? '<input class="search" placeholder="トピックを検索" id="q">' : ''}<div id="topics"></div>`;
  const back = /** @type {HTMLButtonElement} */ (m.querySelector('.back'));
  back.onclick = () => { setActiveTab('subjects'); renderHome(); };
  if (searchable) {
    const q = $('#q');
    q.value = currentSearch;
    q.oninput = () => { currentSearch = q.value; drawSubject(subjectId, currentSearch); };
  } else {
    currentSearch = '';
  }
  drawSubject(subjectId, searchable ? currentSearch : '');
};

drawSubject = function drawSubjectWithCollapsibleAreas(subjectId, query) {
  const box = $('#topics');
  if (!box) return;
  box.innerHTML = '';
  const fs = orderedFields(subjectId);
  const q = query.trim().toLowerCase();
  let shown = 0;

  fs.forEach(f => {
    const allTopics = topics.filter(t => t.field_id === f.field_id)
      .sort((a,b) => a.recommended_order - b.recommended_order || a.topic_id.localeCompare(b.topic_id));
    const list = allTopics.filter(t => !q || `${t.name}${t.source || ''}${f.name}`.toLowerCase().includes(q));
    if (!list.length) return;

    shown += list.length;
    const masteredCount = allTopics.reduce((count, topic) => count + (mastery.has(topic.topic_id) ? 1 : 0), 0);
    const totalCount = allTopics.length;
    const isOpen = openAreaIds.has(f.field_id);
    const sec = document.createElement('section');
    sec.className = 'area';
    sec.innerHTML = `<h3><button class="area-toggle" type="button" aria-expanded="${isOpen}"><span class="area-toggle-main"><span class="area-name">${esc(f.name)}</span><span class="area-progress">${masteredCount}/${totalCount}</span></span></button></h3><div class="area-topics"${isOpen ? '' : ' hidden'}></div>`;

    const toggle = /** @type {HTMLButtonElement} */ (sec.querySelector('.area-toggle'));
    const topicBox = /** @type {HTMLDivElement} */ (sec.querySelector('.area-topics'));
    toggle.onclick = () => {
      if (openAreaIds.has(f.field_id)) openAreaIds.delete(f.field_id);
      else openAreaIds.add(f.field_id);
      const open = openAreaIds.has(f.field_id);
      toggle.setAttribute('aria-expanded', String(open));
      topicBox.hidden = !open;
    };

    list.forEach(t => {
      const on = mastery.has(t.topic_id);
      const d = document.createElement('div');
      d.className = 'topic' + (on ? ' on' : '');
      const source = t.source && t.source !== '仮トピック' ? `<div class="source">${esc(t.source)}</div>` : '';
      d.innerHTML = `<div class="check">${on ? '✓' : ''}</div><div class="topicbody"><div class="tname">${esc(t.name)}</div>${source}</div>${on ? '<div class="master">MASTER!</div>' : ''}`;
      d.onclick = () => toggleTopic(t.topic_id, on, subjectId, query);
      topicBox.appendChild(d);
    });

    box.appendChild(sec);
  });

  if (!shown) box.innerHTML = '<div class="empty">該当なし</div>';
};
