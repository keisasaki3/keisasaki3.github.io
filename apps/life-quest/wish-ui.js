// 学びたいタブ（SPEC §18）。次に学びたいことのリスト。モチベ★1〜3の高い順。「学んだ」で完了済みへ。正本はSupabase（quest_wishes）。

let wishUserId = null;
let wishAvailable = true;
let wishes = [];

async function loadWishes() {
  const uid = session.user.id;
  const res = await sb.from('quest_wishes').select('*').eq('user_id', uid);
  if (isMissingTableError(res.error)) {
    wishAvailable = false;
    wishUserId = uid;
    return;
  }
  if (res.error) throw res.error;
  wishAvailable = true;
  wishes = res.data || [];
  wishUserId = uid;
}

// モチベの高い順。同じモチベは先に足したものが上
function sortedWishes(learned) {
  return wishes
    .filter(w => w.learned === learned)
    .sort((a, b) => b.motivation - a.motivation || String(a.created_at).localeCompare(String(b.created_at)) || a.wish_id.localeCompare(b.wish_id));
}

function wishStars(n) {
  return '★'.repeat(n) + '☆'.repeat(3 - n);
}

// リソースの本文。http(s) のURLだけ新しいタブで開くリンクにし、残りはそのまま（改行はCSSで保つ）
function linkifyResources(text) {
  const re = /https?:\/\/[^\s<>"'「」『』（）、。]+/g;
  let out = '';
  let last = 0;
  for (const m of text.matchAll(re)) {
    const url = m[0].replace(/[.,;:!?)\]]+$/, '');
    out += esc(text.slice(last, m.index)) + `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>`;
    last = m.index + url.length;
  }
  return out + esc(text.slice(last));
}

async function renderWishes() {
  setActiveTab('wishes');
  const m = main();
  if (wishUserId !== session.user.id) {
    m.innerHTML = '<div class="loading">Loading...</div>';
    try {
      await loadWishes();
    } catch (e) {
      if (!document.querySelector('[data-tab="wishes"]')?.classList.contains('active')) return;
      m.innerHTML = `<div class="empty">${esc(e?.message || tr('loadFailed'))}</div>`;
      return;
    }
    if (!document.querySelector('[data-tab="wishes"]')?.classList.contains('active')) return;
  }
  drawWishes();
}

function drawWishes() {
  const m = main();
  if (!wishAvailable) {
    m.innerHTML = `<div class="settings"><div class="pagehead"><h2>${esc(tr('wish.heading'))}</h2></div><div class="empty">${esc(tr('wish.unavailable'))}</div></div>`;
    return;
  }
  const open = sortedWishes(false);
  const done = sortedWishes(true);
  m.innerHTML = `<div class="settings wishes">
    <div class="pagehead"><h2>${esc(tr('wish.heading'))}</h2></div>
    <div class="list-window" id="wishList"></div>
    <button type="button" class="plainbtn addstatus" id="addWish">${esc(tr('wish.add'))}</button>
    ${done.length ? `<div class="pagehead wishdonehead"><h3>${esc(tr('wish.doneHeading', { n: done.length }))}</h3></div><div class="list-window wishdone" id="wishDoneList"></div>` : ''}
  </div>`;
  const box = $('#wishList');
  if (!open.length) box.innerHTML = `<div class="empty">${esc(tr('wish.empty'))}</div>`;
  open.forEach(w => box.appendChild(wishCard(w)));
  const doneBox = $('#wishDoneList');
  if (doneBox) done.forEach(w => doneBox.appendChild(wishCard(w)));
  $('#addWish').onclick = () => openWishModal(null);
}

function wishCard(w) {
  const card = document.createElement('div');
  card.className = 'wcard' + (w.learned ? ' learned' : '');
  card.innerHTML = `<div class="wtop"><span class="wtitle">${esc(w.title)}</span><span class="stars wstars">${wishStars(w.motivation)}</span></div>${w.resources ? `<div class="wres">${linkifyResources(w.resources)}</div>` : ''}${w.learned ? '' : `<button type="button" class="plainbtn small wlearn">${esc(tr('wish.learned'))}</button>`}`;
  // リンクと「学んだ」以外を押すと編集
  card.onclick = e => { if (!e.target.closest('a, button')) openWishModal(w); };
  const learnBtn = card.querySelector('.wlearn');
  if (learnBtn) learnBtn.onclick = () => withBusyButton(learnBtn, () => setWishLearned(w, true));
  return card;
}

async function setWishLearned(w, learned) {
  if (!(await runQuery(sb.from('quest_wishes').update({ learned }).eq('wish_id', w.wish_id)))) return false;
  w.learned = learned;
  drawWishes();
  return true;
}

function openWishModal(wish) {
  let motivation = wish?.motivation || 2;
  const { bg, close } = openModal(`<h3>${esc(tr(wish ? 'wish.editTitle' : 'wish.addTitle'))}</h3>
    <div class="modalform"><input id="wishTitle" maxlength="100" placeholder="${esc(tr('wish.title'))}"></div>
    <div class="modallabel">${esc(tr('wish.motivation'))}</div>
    <div class="wishstarpicks">${[1, 2, 3].map(n => `<button type="button" class="wishstarpick" data-n="${n}" aria-label="${n}">★</button>`).join('')}</div>
    <div class="modallabel">${esc(tr('wish.resources'))}</div>
    <textarea id="wishResources" class="wishtextarea" rows="5" maxlength="2000" placeholder="${esc(tr('wish.resourcesHint'))}"></textarea>
    <div class="actions">${wish ? `<button type="button" class="dangerbtn" id="deleteWish">${esc(tr('delete'))}</button>` : ''}${wish?.learned ? `<button type="button" id="unlearnWish">${esc(tr('wish.unlearn'))}</button>` : ''}<button type="button" data-close>${esc(tr('cancel'))}</button><button type="button" class="savebtn" id="saveWish">${esc(tr('save'))}</button></div>`);
  const titleInput = bg.querySelector('#wishTitle');
  const resInput = bg.querySelector('#wishResources');
  titleInput.value = wish?.title || '';
  resInput.value = wish?.resources || '';
  const paintStars = () => bg.querySelectorAll('.wishstarpick').forEach(b => b.classList.toggle('on', Number(b.dataset.n) <= motivation));
  bg.querySelectorAll('.wishstarpick').forEach(b => b.onclick = () => { motivation = Number(b.dataset.n); paintStars(); });
  paintStars();
  titleInput.focus();
  const saveBtn = bg.querySelector('#saveWish');
  saveBtn.onclick = () => withBusyButton(saveBtn, async () => {
    const title = titleInput.value.trim().slice(0, 100);
    const resources = resInput.value.replace(/\s+$/, '').slice(0, 2000) || null;
    if (!title) return;
    if (wish) {
      if (!(await runQuery(sb.from('quest_wishes').update({ title, motivation, resources }).eq('wish_id', wish.wish_id)))) return;
      Object.assign(wish, { title, motivation, resources });
    } else {
      const row = await runQuery(sb.from('quest_wishes').insert({ user_id: session.user.id, title, motivation, resources }).select().single());
      if (!row) return;
      wishes.push(row);
    }
    close();
    drawWishes();
  });
  if (wish) {
    bg.querySelector('#deleteWish').onclick = async () => {
      if (!confirm(tr('wish.confirmDelete', { name: wish.title }))) return;
      if (!(await runQuery(sb.from('quest_wishes').delete().eq('wish_id', wish.wish_id)))) return;
      wishes = wishes.filter(w => w !== wish);
      close();
      drawWishes();
    };
  }
  const unlearnBtn = bg.querySelector('#unlearnWish');
  if (unlearnBtn) unlearnBtn.onclick = async () => { if (await setWishLearned(wish, false)) close(); };
}

document.querySelector('[data-tab="wishes"]').onclick = renderWishes;
