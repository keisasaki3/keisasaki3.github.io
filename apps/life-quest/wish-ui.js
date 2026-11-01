// JUST DO IT!タブ（SPEC §18、旧「学びたい」）。やることのリスト。優先度 NOW!／NEXT／SOMEDAY ごとに分けて出し、優先度の中はドラッグで並べ替え。「DONE」で完了済みへ。
// 正本はSupabase（quest_wishes）。優先度は motivation 列（3=NOW!、2=NEXT、1=SOMEDAY）をそのまま使う。

// 優先度。n は quest_wishes.motivation の値
const WISH_PRIORITIES = [
  { n: 3, key: 'wish.p3', cls: 'now' },
  { n: 2, key: 'wish.p2', cls: 'next' },
  { n: 1, key: 'wish.p1', cls: 'someday' }
];

function wishPriority(n) {
  return WISH_PRIORITIES.find(p => p.n === n) || WISH_PRIORITIES[1];
}

// 見出しの下に出す日替わりの金言（今努力すると人生がよくなる、に関わる言葉）。出典がはっきりしたものだけ。旧デイリーから移管（2026-11-01）
const JDI_QUOTES = [
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

function dailyQuote(day) {
  const n = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000);
  const q = JDI_QUOTES[((n % JDI_QUOTES.length) + JDI_QUOTES.length) % JDI_QUOTES.length];
  return lang === 'en' ? { text: q.en, by: q.by_en } : { text: q.ja, by: q.by };
}

const jdiDayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' });


let wishUserId = null;
let wishAvailable = true;
let wishes = [];
// 並べ替え用の sort_order 列（migration 012）がDBにあるか。無ければ並べ替えを出さない
let wishOrderAvailable = false;

async function loadWishes() {
  const uid = session.user.id;
  const [res, orderRes] = await Promise.all([
    sb.from('quest_wishes').select('*').eq('user_id', uid),
    sb.from('quest_wishes').select('sort_order').limit(1)
  ]);
  if (isMissingTableError(res.error)) {
    wishAvailable = false;
    wishUserId = uid;
    return;
  }
  if (res.error) throw res.error;
  wishAvailable = true;
  wishOrderAvailable = !orderRes.error;
  wishes = res.data || [];
  wishUserId = uid;
}

// 優先度の高い順。同じ優先度の中は並べ替えた順（sort_order）、無ければ先に足したものが上
function sortedWishes(learned) {
  const ord = w => (w.sort_order ?? Infinity);
  return wishes
    .filter(w => w.learned === learned)
    .sort((a, b) => b.motivation - a.motivation || ord(a) - ord(b) || String(a.created_at).localeCompare(String(b.created_at)) || a.wish_id.localeCompare(b.wish_id));
}

// その優先度の一番下に入れるときの sort_order
function nextWishOrder(motivation, except) {
  const orders = wishes.filter(w => !w.learned && w.motivation === motivation && w !== except && w.sort_order != null).map(w => w.sort_order);
  return (orders.length ? Math.max(...orders) : 0) + 10;
}

function wishCountText(n) {
  return n === 1 ? tr('wish.count1') : tr('wish.count', { n });
}

// 優先度の中で並べ替えた結果を10刻みで保存する（ステータスの並べ替えと同じ）
async function saveWishOrder(ids) {
  const changed = [];
  ids.forEach((id, i) => {
    const w = wishes.find(x => x.wish_id === id);
    const order = (i + 1) * 10;
    if (w && w.sort_order !== order) { w.sort_order = order; changed.push(w); }
  });
  drawWishes();
  if (!changed.length) return;
  const results = await Promise.all(changed.map(w => sb.from('quest_wishes').update({ sort_order: w.sort_order }).eq('wish_id', w.wish_id)));
  const failed = results.find(r => r.error);
  if (failed) alert(failed.error.message);
}

function priorityBadge(n) {
  const p = wishPriority(n);
  return `<span class="wprio ${p.cls}">${esc(tr(p.key))}</span>`;
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
  const quote = dailyQuote(jdiDayFormat.format(new Date()));
  m.innerHTML = `<div class="settings wishes">
    <div class="pagehead"><h2 class="jdihead">${esc(tr('wish.heading'))}</h2></div>
    <div class="jdiquote"><div class="quotetext">${lang === 'en' ? `“${esc(quote.text)}”` : `「${esc(quote.text)}」`}</div><div class="quoteby">― ${esc(quote.by)}</div></div>
    <div id="wishGroups"></div>
    <button type="button" class="plainbtn addstatus" id="addWish">${esc(tr('wish.add'))}</button>
    ${done.length ? `<div class="pagehead wishdonehead"><h3>${esc(tr('wish.doneHeading', { n: done.length }))}</h3></div><div class="list-window wishdone" id="wishDoneList"></div>` : ''}
  </div>`;
  const groups = $('#wishGroups');
  if (!open.length) groups.innerHTML = `<div class="list-window"><div class="empty">${esc(tr('wish.empty'))}</div></div>`;
  // 優先度ごとに見出しを付けて分ける。空の優先度は出さない
  WISH_PRIORITIES.forEach(p => {
    const list = open.filter(w => wishPriority(w.motivation) === p);
    if (!list.length) return;
    const head = document.createElement('div');
    head.className = `wgrouphead ${p.cls}`;
    head.innerHTML = `${priorityBadge(p.n)}<span class="wcount">${esc(wishCountText(list.length))}</span>`;
    const box = document.createElement('div');
    box.className = `list-window wgroup ${p.cls}`;
    list.forEach(w => box.appendChild(wishCard(w)));
    groups.append(head, box);
    if (wishOrderAvailable && list.length > 1) enableStatusReorder(box, saveWishOrder, { rowSelector: '.wcard', idKey: 'wishId', ignore: 'a, button' });
  });
  if (wishOrderAvailable && open.some((w, i) => i && open[i - 1].motivation === w.motivation)) {
    const hint = document.createElement('div');
    hint.className = 'reorderhint';
    hint.textContent = reorderHintText();
    groups.appendChild(hint);
  }
  const doneBox = $('#wishDoneList');
  if (doneBox) done.forEach(w => doneBox.appendChild(wishCard(w)));
  $('#addWish').onclick = () => openWishModal(null);
}

function wishCard(w) {
  const card = document.createElement('div');
  card.className = 'wcard' + (w.learned ? ' learned' : '');
  card.dataset.wishId = w.wish_id;
  card.innerHTML = `<div class="wtop"><span class="wtitle">${esc(w.title)}</span>${w.learned ? priorityBadge(w.motivation) : ''}</div>${w.resources ? `<div class="wres">${linkifyResources(w.resources)}</div>` : ''}${w.learned ? '' : `<button type="button" class="plainbtn small wlearn">${esc(tr('wish.learned'))}</button>`}`;
  // リンクと「学んだ」以外を押すと編集
  card.onclick = e => { if (!reorderJustEnded && !e.target.closest('a, button')) openWishModal(w); };
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
  let motivation = wishPriority(wish?.motivation || 2).n;
  const { bg, close } = openModal(`<h3>${esc(tr(wish ? 'wish.editTitle' : 'wish.addTitle'))}</h3>
    <div class="modalform"><input id="wishTitle" maxlength="100" placeholder="${esc(tr('wish.title'))}"></div>
    <div class="modallabel">${esc(tr('wish.priority'))}</div>
    <div class="wishprios">${WISH_PRIORITIES.map(p => `<button type="button" class="wishprio ${p.cls}" data-n="${p.n}">${esc(tr(p.key))}</button>`).join('')}</div>
    <div class="modallabel">${esc(tr('wish.resources'))}</div>
    <textarea id="wishResources" class="wishtextarea" rows="5" maxlength="2000" placeholder="${esc(tr('wish.resourcesHint'))}"></textarea>
    <div class="actions">${wish ? `<button type="button" class="dangerbtn" id="deleteWish">${esc(tr('delete'))}</button>` : ''}${wish?.learned ? `<button type="button" id="unlearnWish">${esc(tr('wish.unlearn'))}</button>` : ''}<button type="button" data-close>${esc(tr('cancel'))}</button><button type="button" class="savebtn" id="saveWish">${esc(tr('save'))}</button></div>`);
  const titleInput = bg.querySelector('#wishTitle');
  const resInput = bg.querySelector('#wishResources');
  titleInput.value = wish?.title || '';
  resInput.value = wish?.resources || '';
  const paintPrio = () => bg.querySelectorAll('.wishprio').forEach(b => b.classList.toggle('on', Number(b.dataset.n) === motivation));
  bg.querySelectorAll('.wishprio').forEach(b => b.onclick = () => { motivation = Number(b.dataset.n); paintPrio(); });
  paintPrio();
  titleInput.focus();
  const saveBtn = bg.querySelector('#saveWish');
  saveBtn.onclick = () => withBusyButton(saveBtn, async () => {
    const title = titleInput.value.trim().slice(0, 100);
    const resources = resInput.value.replace(/\s+$/, '').slice(0, 2000) || null;
    if (!title) return;
    if (wish) {
      const patch = { title, motivation, resources };
      // 優先度を変えたら、移った先の一番下へ
      if (wishOrderAvailable && motivation !== wish.motivation) patch.sort_order = nextWishOrder(motivation, wish);
      if (!(await runQuery(sb.from('quest_wishes').update(patch).eq('wish_id', wish.wish_id)))) return;
      Object.assign(wish, patch);
    } else {
      const insert = { user_id: session.user.id, title, motivation, resources };
      if (wishOrderAvailable) insert.sort_order = nextWishOrder(motivation);
      const row = await runQuery(sb.from('quest_wishes').insert(insert).select().single());
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
