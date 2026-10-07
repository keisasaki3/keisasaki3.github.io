// 表示言語（日本語 / English）とNEWSPAPERの言語。端末ごとに localStorage に保存する（テーマと同じ）。
// 分野名・トピック名は日英併記（pairName）。出典など日本語しかない中身は切り替えない。
const LANG_KEY = 'lifeQuestLang';
const LANGS = { ja: '日本語', en: 'English' };
// NEWSPAPERのメイン表示の言語（画面の言語とは別。初期値は英語）
const NEWS_LANG_KEY = 'lifeQuestNewsLang';
// メイド/執事（NEWSPAPERの語り手）。種類と名前は端末ごとに localStorage に保存する。
const BUTLER_TYPE_KEY = 'lifeQuestButlerType';
const BUTLER_NAME_KEY = 'lifeQuestButlerName';
const NEWS_LANGS = { en: 'English', ja: '日本語' };
const NEWS_SIZE_KEY = 'lifeQuestNewsSize';
const NEWS_SIZES = ['normal', 'large', 'xlarge'];

const I18N = {
  ja: {
    brand: '人生クエスト',
    'tab.status': 'ステータス',
    'tab.newspaper': 'ニュース',
    'tab.routines': 'デイリー',
    'tab.wishes': '学びたい',
    'tab.bgm': 'BGM',
    'tab.settings': '設定',
    'bgm': 'BGM',
    'bgmTrack': '曲',
    'bgmPower': 'オン/オフ',
    'bgmVolume': '音量',
    rename: '名前を変更',
    noname: '名無し',
    'rank.4000': '全知に至る者',
    'rank.2000': '叡智の守り手',
    'rank.1000': '大賢者',
    'rank.700': '賢者',
    'rank.400': '塔の魔導士',
    'rank.200': '知の探究者',
    'rank.100': '博識の旅人',
    'rank.50': '学びの冒険者',
    'rank.25': '駆け出しの冒険者',
    'rank.10': '見習い学徒',
    'rank.5': '村の物知り',
    'rank.0': '旅のはじまり',
    avatarChange: 'サムネを変更',
    jobName: 'ジョブ名',
    jobNamePh: '12文字まで',
    'theme.tokyo-night': 'トーキョーナイト',
    'theme.dracula': 'ドラキュラ',
    'theme.nord': 'ノルド',
    'theme.synthwave': 'シンセウェイブ',
    'theme.amber': 'アンバー端末',
    'theme.phosphor': 'グリーン端末',
    'theme.gameboya': 'ゲームボーヤ',
    'theme.gameboya-pocket': 'ゲームボーヤ ポケッツ',
    'theme.gameboya-light': 'ゲームボーヤ ライツ',
    'theme.gameboya-color': 'ゲームボーヤ カラー',
    'theme.gameboya-advanz': 'ゲームボーヤ アドバンズ',
    'theme.famicoso': 'ファミコソ',
    'theme.super-famicoso': 'スーパーファミコソ',
    'theme.virtual-boya': 'バーチャルボーヤ',
    'theme.mado95': 'まどOS 95',
    'theme.yusha': 'ゆうしゃのまど',
    'theme.komonjo': '古地図',
    'theme.sakuramochi': '桜もち',
    'theme.gogo3ji': '午後三時',
    'theme.slime-blue': 'スライムブルー',
    'theme.e-paper': '電子ペーパー',
    'theme.neojiwo': 'ネオジヲ',
    'theme.wonderswan': 'ワンダースワソ',
    'theme.pc-enjin': 'PCエンジソ',
    'theme.mega-driver': 'メガドライバ',
    'theme.tamagoppi': 'たまごっぴ',
    'theme.shinkai': '深海',
    'theme.himawari': 'ひまわり',
    'theme.uji-matcha': '宇治抹茶',
    'theme.cafe-au-lait': 'カフェオレ',
    'theme.hoshizora': '星空ドット',
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
    reorderHintPc: 'ドラッグで並べ替え',
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
    showJa: '全部訳す',
    closeJa: '訳を閉じる',
    showEn: 'English',
    closeEn: 'Englishを閉じる',
    newsLang: 'NEWSPAPERの言語',
    newsSize: 'NEWSPAPERの文字サイズ',
    newsSizeNormal: 'ふつう',
    newsSizeLarge: '大きめ',
    newsSizeXlarge: 'もっと大きめ',
    butlerType: 'コンシェルジュ',
    butlerMaid: 'メイド',
    butlerButler: '執事',
    butlerName: 'コンシェルジュの名前',
    butlerNamePh: '名前をつける',
    details: '詳細を見る',
    showAnswer: '答えを見る',
    hideAnswer: '答えを閉じる',
    newsFailed: 'NEWSPAPERを読み込めませんでした。',
    fetchFailed: '取得に失敗しました。',
    retry: '再試行',
    dateLocale: 'ja-JP',
    'wish.heading': '学びたいリスト',
    'wish.add': '＋ 学びたいことを追加',
    'wish.addTitle': '学びたいことを追加',
    'wish.editTitle': '学びたいことを編集',
    'wish.title': '学びたいこと（例: 線形代数）',
    'wish.motivation': 'モチベ',
    'wish.resources': 'リソース',
    'wish.resourcesHint': '本・URL・メモなど（複数行可）',
    'wish.learned': '学んだ',
    'wish.unlearn': '未完了に戻す',
    'wish.doneHeading': '学んだ（{n}）',
    'wish.empty': '「＋ 学びたいことを追加」から追加してください',
    'wish.unavailable': '学びたいはまだ使えません（データベースの更新待ち）',
    'wish.confirmDelete': '「{name}」を削除しますか？',
    'routine.title': '日課',
    'routine.heading': 'デイリー',
    'routine.memo': '一言メモ（任意）',
    'routine.icon': 'アイコン',
    'routine.editBtn': '日課を編集',
    'routine.add': '＋ 日課を追加',
    'routine.addTitle': '日課を追加',
    'routine.editTitle': '日課を編集',
    'routine.name': '日課（例: 英単語 30分）',
    'routine.weekdays': 'やる曜日',
    'routine.wd': '日,月,火,水,木,金,土',
    'routine.everyday': '毎日',
    'routine.none': 'この日の日課はありません',
    'routine.rest': '休み',
    'routine.clearToday': '本日のクエスト達成！',
    'routine.clear': 'クエスト達成！',
    'routine.empty': '「編集」から日課を追加してください',
    'routine.streak': '連続',
    'routine.days': '{n}日',
    'routine.rate7': '7日',
    'routine.rate30': '30日',
    'routine.close': 'この日を締めてカレンダーに記録',
    'routine.closing': '記録中…',
    'routine.closed': 'Googleカレンダーに記録しました',
    'routine.calendarName': '人生クエスト 日課',
    'routine.noScope': 'カレンダーへの書き込みが許可されませんでした',
    'routine.gisFailed': 'Googleの読み込みに失敗しました',
    'routine.unavailable': '日課はまだ使えません（データベースの更新待ち）',
    'routine.confirmDelete': '「{name}」を削除しますか？（これまでのチェック記録は残ります）'
  },
  en: {
    brand: 'Life Quest',
    'tab.status': 'STATUS',
    'tab.newspaper': 'NEWS',
    'tab.routines': 'DAILY',
    'tab.wishes': 'TO LEARN',
    'tab.bgm': 'BGM',
    'tab.settings': 'SETTINGS',
    'bgm': 'BGM',
    'bgmTrack': 'Track',
    'bgmPower': 'On/Off',
    'bgmVolume': 'Volume',
    rename: 'Change name',
    noname: 'No Name',
    'rank.4000': 'The All-Knowing',
    'rank.2000': 'Keeper of Wisdom',
    'rank.1000': 'Grand Sage',
    'rank.700': 'Sage',
    'rank.400': 'Tower Mage',
    'rank.200': 'Seeker of Knowledge',
    'rank.100': 'Learned Traveler',
    'rank.50': 'Learning Adventurer',
    'rank.25': 'Novice Adventurer',
    'rank.10': 'Apprentice Scholar',
    'rank.5': 'Village Know-it-all',
    'rank.0': 'Journey Begins',
    avatarChange: 'Change picture',
    jobName: 'Job',
    jobNamePh: 'Up to 12 characters',
    'theme.tokyo-night': 'Tokyo Night',
    'theme.dracula': 'Dracula',
    'theme.nord': 'Nord',
    'theme.synthwave': 'Synthwave',
    'theme.amber': 'Amber Terminal',
    'theme.phosphor': 'Green Terminal',
    'theme.gameboya': 'GAME BOYA',
    'theme.gameboya-pocket': 'GAME BOYA POCKETS',
    'theme.gameboya-light': 'GAME BOYA LIGHTS',
    'theme.gameboya-color': 'GAME BOYA COLOR',
    'theme.gameboya-advanz': 'GAME BOYA ADVANZ',
    'theme.famicoso': 'FAMICOSO',
    'theme.super-famicoso': 'SUPER FAMICOSO',
    'theme.virtual-boya': 'VIRTUAL BOYA',
    'theme.mado95': 'MADO OS 95',
    'theme.yusha': 'YUSHA NO MADO',
    'theme.komonjo': 'KOMONJO',
    'theme.sakuramochi': 'SAKURAMOCHI',
    'theme.gogo3ji': 'GOGO SANJI',
    'theme.slime-blue': 'SLIME BLUE',
    'theme.e-paper': 'E-PAPER',
    'theme.neojiwo': 'NEO JIWO',
    'theme.wonderswan': 'WONDER SWAN',
    'theme.pc-enjin': 'PC ENJIN',
    'theme.mega-driver': 'MEGA DRIVER',
    'theme.tamagoppi': 'TAMAGOPPI',
    'theme.shinkai': 'SHINKAI',
    'theme.himawari': 'HIMAWARI',
    'theme.uji-matcha': 'UJI MATCHA',
    'theme.cafe-au-lait': 'CAFE AU LAIT',
    'theme.hoshizora': 'HOSHIZORA',
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
    reorderHintPc: 'Drag to reorder',
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
    showJa: 'Translate all',
    closeJa: 'Hide translations',
    showEn: 'English',
    closeEn: 'Close English',
    newsLang: 'NEWSPAPER language',
    newsSize: 'NEWSPAPER text size',
    newsSizeNormal: 'Normal',
    newsSizeLarge: 'Large',
    newsSizeXlarge: 'Extra large',
    butlerType: 'Concierge',
    butlerMaid: 'Maid',
    butlerButler: 'Butler',
    butlerName: 'Concierge name',
    butlerNamePh: 'Give a name',
    details: 'Details',
    showAnswer: 'Show answer',
    hideAnswer: 'Hide answer',
    newsFailed: 'Could not load NEWSPAPER.',
    fetchFailed: 'Failed to fetch.',
    retry: 'Retry',
    dateLocale: 'en-US',
    'wish.heading': 'To-Learn List',
    'wish.add': '+ Add something to learn',
    'wish.addTitle': 'Add something to learn',
    'wish.editTitle': 'Edit',
    'wish.title': 'What to learn (e.g. Linear algebra)',
    'wish.motivation': 'Motivation',
    'wish.resources': 'Resources',
    'wish.resourcesHint': 'Books, URLs, notes… (multiple lines OK)',
    'wish.learned': 'Learned',
    'wish.unlearn': 'Move back to list',
    'wish.doneHeading': 'Learned ({n})',
    'wish.empty': 'Tap "+ Add something to learn" to add one',
    'wish.unavailable': 'To Learn is not available yet (database update pending)',
    'wish.confirmDelete': 'Delete "{name}"?',
    'routine.title': 'Habits',
    'routine.heading': 'Daily',
    'routine.memo': 'Note (optional)',
    'routine.icon': 'Icon',
    'routine.editBtn': 'Edit habits',
    'routine.add': '+ Add habit',
    'routine.addTitle': 'Add habit',
    'routine.editTitle': 'Edit habit',
    'routine.name': 'Habit (e.g. Vocabulary 30 min)',
    'routine.weekdays': 'Days',
    'routine.wd': 'Su,Mo,Tu,We,Th,Fr,Sa',
    'routine.everyday': 'Every day',
    'routine.none': 'No habits for this day',
    'routine.rest': 'OFF',
    'routine.clearToday': 'Quest complete for today!',
    'routine.clear': 'Quest complete!',
    'routine.empty': 'Tap Edit to add habits',
    'routine.streak': 'Streak',
    'routine.days': '{n}d',
    'routine.rate7': '7d',
    'routine.rate30': '30d',
    'routine.close': 'Close this day and log to Calendar',
    'routine.closing': 'Logging…',
    'routine.closed': 'Logged to Google Calendar',
    'routine.calendarName': 'Life Quest Habits',
    'routine.noScope': 'Calendar access was not granted',
    'routine.gisFailed': 'Could not load Google sign-in',
    'routine.unavailable': 'Habits are not available yet (database update pending)',
    'routine.confirmDelete': 'Delete "{name}"? (Past check records are kept)'
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

function currentNewsSize() {
  let saved = null;
  try { saved = localStorage.getItem(NEWS_SIZE_KEY); } catch {}
  return NEWS_SIZES.includes(saved) ? saved : 'normal';
}

function applyNewsSize(value) {
  try { localStorage.setItem(NEWS_SIZE_KEY, NEWS_SIZES.includes(value) ? value : 'normal'); } catch {}
}

function currentButlerType() {
  let saved = null;
  try { saved = localStorage.getItem(BUTLER_TYPE_KEY); } catch {}
  return saved === 'butler' ? 'butler' : 'maid';
}

function currentButlerName() {
  let saved = '';
  try { saved = localStorage.getItem(BUTLER_NAME_KEY) || ''; } catch {}
  return saved.trim();
}

function applyButler(type, name) {
  try {
    localStorage.setItem(BUTLER_TYPE_KEY, type === 'butler' ? 'butler' : 'maid');
    localStorage.setItem(BUTLER_NAME_KEY, String(name || '').trim().slice(0, 12));
  } catch {}
}

// NEWSPAPERの本文中の {{narrator}} を、つけた名前（未設定ならメイド/執事）に置き換える。
function fillNarrator(value) {
  if (typeof value === 'string') {
    if (!value.includes('{{narrator}}')) return value;
    const name = currentButlerName() || tr(currentButlerType() === 'butler' ? 'butlerButler' : 'butlerMaid');
    return value.split('{{narrator}}').join(name);
  }
  if (Array.isArray(value)) return value.map(fillNarrator);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillNarrator(v)]));
  }
  return value;
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
