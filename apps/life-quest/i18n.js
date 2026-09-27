// 表示言語（日本語 / English）とNEWSPAPERの言語。端末ごとに localStorage に保存する（テーマと同じ）。
// 分野名・トピック名は日英併記（pairName）。出典など日本語しかない中身は切り替えない。
const LANG_KEY = 'lifeQuestLang';
const LANGS = { ja: '日本語', en: 'English' };
// NEWSPAPERのメイン表示の言語（画面の言語とは別。初期値は英語）
const NEWS_LANG_KEY = 'lifeQuestNewsLang';
const NEWS_LANGS = { en: 'English', ja: '日本語' };

const I18N = {
  ja: {
    brand: '人生クエスト',
    'tab.status': 'ステータス',
    'tab.newspaper': 'NEWSPAPER',
    'tab.settings': '設定',
    rename: '名前を変更',
    noname: '名無し',
    'rank.200': '知の探究者',
    'rank.100': '博識の旅人',
    'rank.50': '学びの冒険者',
    'rank.10': '見習い学徒',
    'rank.0': '旅のはじまり',
    'presence.online': 'オンライン',
    'presence.studying': '勉強中',
    'presence.reading': '読書中',
    'presence.busy': '取り込み中',
    'presence.afk': 'AFK',
    'theme.tokyo-night': 'トーキョーナイト',
    'theme.dracula': 'ドラキュラ',
    'theme.nord': 'ノルド',
    'theme.synthwave': 'シンセウェイブ',
    'theme.amber': 'アンバー端末',
    'theme.phosphor': 'グリーン端末',
    email: 'メールアドレス',
    password: 'パスワード',
    login: 'ログイン',
    signup: '新規登録',
    google: 'Googleで続ける',
    authInvalid: 'メールアドレスと6文字以上のパスワードを入力してください。',
    confirmSent: '確認メールを送信しました。',
    loadFailed: '読み込みに失敗しました',
    reload: '再読み込み',
    settings: '設定',
    race: '種族',
    unset: '未設定',
    presence: '状態',
    theme: 'テーマ',
    language: '言語',
    logout: 'ログアウト',
    resetStatuses: '全ステータスをリセット',
    resetAll: '全データをリセット',
    resetStatusesWhat: '全ステータスのチェック（MASTER）をすべてリセットします。',
    resetAllWhat: 'チェック・入力の記録・ステータス（プリセットと自作）をすべて消して、プリセット選択からやり直します。',
    reallyDelete: '本当にデータを消しますか？',
    cannotUndo: '消したデータは元に戻せません。',
    legacyMigrate: 'この端末にある既存の人生クエストデータを、このアカウントへ移行しますか？',
    changeName: '名前変更',
    cancel: 'キャンセル',
    save: '保存',
    close: '閉じる',
    create: '作成',
    delete: '削除',
    record: '記録',
    addStatusBtn: '＋ ステータスを追加',
    reorderHint: '長押しでドラッグして並べ替え',
    addStatus: 'ステータスを追加',
    addAll: 'まとめて追加',
    presets: 'プリセット',
    noPresets: '追加できるプリセットはありません',
    makeOwn: '自分で作る',
    phIcon: 'アイコン（絵文字）',
    phName: '名前',
    phNameEn: '英語名（任意）',
    fieldNameEn: '英語の分野名（任意）',
    topicNameEn: '英語のトピック名（任意）',
    groupAll: '{group}（すべて）',
    'group.29学問': '29学問',
    choosePresets: 'プリセットを選ぶ',
    start: 'はじめる',
    back: 'ステータス',
    edit: '編集',
    done: '完了',
    editStatus: 'ステータスを編集',
    addFieldBtn: '＋ 分野を追加',
    addTopicBtn: '＋ トピックを追加',
    editField: '分野を編集',
    addField: '分野を追加',
    fieldName: '分野名',
    editTopic: 'トピックを編集',
    addTopic: 'トピックを追加',
    topicName: 'トピック名',
    typeCheck: 'チェック',
    typeNumber: '入力',
    unit: '単位（例: kg）',
    searchTopics: 'トピックを検索',
    noResults: '該当なし',
    hide: '非表示にする',
    confirmDelete: '「{name}」を削除しますか？',
    showJa: '日本語',
    closeJa: '日本語を閉じる',
    showEn: 'English',
    closeEn: 'Englishを閉じる',
    newsLang: 'NEWSPAPERの言語',
    details: '詳細を見る',
    showAnswer: '答えを見る',
    hideAnswer: '答えを閉じる',
    newsFailed: 'NEWSPAPERを読み込めませんでした。',
    fetchFailed: '取得に失敗しました。',
    retry: '再試行',
    dateLocale: 'ja-JP'
  },
  en: {
    brand: 'Life Quest',
    'tab.status': 'STATUS',
    'tab.newspaper': 'NEWSPAPER',
    'tab.settings': 'SETTINGS',
    rename: 'Change name',
    noname: 'No Name',
    'rank.200': 'Seeker of Knowledge',
    'rank.100': 'Learned Traveler',
    'rank.50': 'Learning Adventurer',
    'rank.10': 'Apprentice Scholar',
    'rank.0': 'Journey Begins',
    'presence.online': 'Online',
    'presence.studying': 'Studying',
    'presence.reading': 'Reading',
    'presence.busy': 'Busy',
    'presence.afk': 'AFK',
    'theme.tokyo-night': 'Tokyo Night',
    'theme.dracula': 'Dracula',
    'theme.nord': 'Nord',
    'theme.synthwave': 'Synthwave',
    'theme.amber': 'Amber Terminal',
    'theme.phosphor': 'Green Terminal',
    email: 'Email',
    password: 'Password',
    login: 'Log in',
    signup: 'Sign up',
    google: 'Continue with Google',
    authInvalid: 'Enter your email and a password of at least 6 characters.',
    confirmSent: 'Confirmation email sent.',
    loadFailed: 'Failed to load',
    reload: 'Reload',
    settings: 'Settings',
    race: 'Race',
    unset: 'Not set',
    presence: 'Activity',
    theme: 'Theme',
    language: 'Language',
    logout: 'Log out',
    resetStatuses: 'Reset all statuses',
    resetAll: 'Reset all data',
    resetStatusesWhat: 'This resets every check (MASTER) in all statuses.',
    resetAllWhat: 'This deletes all checks, input records and statuses (presets and your own), and starts again from preset selection.',
    reallyDelete: 'Do you really want to delete this data?',
    cannotUndo: 'Deleted data cannot be restored.',
    legacyMigrate: 'Move the Life Quest data saved on this device to this account?',
    changeName: 'Change name',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    create: 'Create',
    delete: 'Delete',
    record: 'Record',
    addStatusBtn: '+ Add status',
    reorderHint: 'Long-press and drag to reorder',
    addStatus: 'Add status',
    addAll: 'Add all',
    presets: 'Presets',
    noPresets: 'No presets left to add',
    makeOwn: 'Create your own',
    phIcon: 'Icon (emoji)',
    phName: 'Name',
    phNameEn: 'English name (optional)',
    fieldNameEn: 'English field name (optional)',
    topicNameEn: 'English topic name (optional)',
    groupAll: '{group} (all)',
    'group.29学問': '29 Academic Subjects',
    choosePresets: 'Choose presets',
    start: 'Start',
    back: 'Status',
    edit: 'Edit',
    done: 'Done',
    editStatus: 'Edit status',
    addFieldBtn: '+ Add field',
    addTopicBtn: '+ Add topic',
    editField: 'Edit field',
    addField: 'Add field',
    fieldName: 'Field name',
    editTopic: 'Edit topic',
    addTopic: 'Add topic',
    topicName: 'Topic name',
    typeCheck: 'Check',
    typeNumber: 'Input',
    unit: 'Unit (e.g. kg)',
    searchTopics: 'Search topics',
    noResults: 'No results',
    hide: 'Hide',
    confirmDelete: 'Delete "{name}"?',
    showJa: '日本語',
    closeJa: 'Close 日本語',
    showEn: 'English',
    closeEn: 'Close English',
    newsLang: 'NEWSPAPER language',
    details: 'Details',
    showAnswer: 'Show answer',
    hideAnswer: 'Hide answer',
    newsFailed: 'Could not load NEWSPAPER.',
    fetchFailed: 'Failed to fetch.',
    retry: 'Retry',
    dateLocale: 'en-US'
  }
};

function currentLang() {
  let saved = null;
  try { saved = localStorage.getItem(LANG_KEY); } catch {}
  return saved && LANGS[saved] ? saved : 'ja';
}

let lang = currentLang();

function currentNewsLang() {
  let saved = null;
  try { saved = localStorage.getItem(NEWS_LANG_KEY); } catch {}
  return saved && NEWS_LANGS[saved] ? saved : 'en';
}

function applyNewsLang(value) {
  try { localStorage.setItem(NEWS_LANG_KEY, NEWS_LANGS[value] ? value : 'en'); } catch {}
}

function tr(key, vars) {
  let s = I18N[lang][key] ?? I18N.ja[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  return s;
}

// 日本語名と英語名を持つもの（ステータス・プリセット・種族）の表示名。英語のときは英語名を主にする
function localName(obj) {
  return lang === 'en' && obj?.name_en ? obj.name_en : (obj?.name_ja || obj?.name_en || '');
}

function localSubName(obj) {
  if (lang === 'en') return obj?.name_en ? (obj.name_ja || '') : '';
  return obj?.name_en || '';
}

// 分野・トピックの日英併記。言語設定の側を主（main）、もう一方を副（sub）にする。英語名が無ければ日本語だけ
function pairName(ja, en) {
  ja = ja || ''; en = (en || '').trim();
  if (lang === 'en') return en ? { main: en, sub: ja } : { main: ja, sub: '' };
  return { main: ja || en, sub: ja ? en : '' };
}

function groupLabel(key) {
  return I18N[lang][`group.${key}`] ?? key;
}

function applyStaticText() {
  document.documentElement.lang = lang;
  document.title = tr('brand');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = tr(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', tr(el.dataset.i18nAria)); });
}

function applyLang(value) {
  lang = LANGS[value] ? value : 'ja';
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
  applyStaticText();
}

applyStaticText();
