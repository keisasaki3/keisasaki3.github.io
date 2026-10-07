// 環境音BGM（IDEAS §11）。audioはこのファイルで1つだけ持ち、タブを切り替えても鳴り続ける。設定は端末ごとにlocalStorage
const BGM_TRACKS = [
  { id: 'late-night-stacks', title: 'Late Night Stacks', artist: 'ornave', src: './bgm/late-night-stacks.mp3', img: './bgm/night-city.webp' }
];
// 鳴っているかどうかは保存しない（アプリを閉じたら次は必ずオフ）。ループがこの回数を超えたら自動で止める
const BGM_MAX_LOOPS = 100;
const BGM_VOL_KEY = 'lifeQuestBgmVol';
const BGM_TRACK_KEY = 'lifeQuestBgmTrack';
const BGM_FADE_MS = 1000;

function bgmLoad(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function bgmSave(key, value) {
  try { localStorage.setItem(key, String(value)); } catch {}
}

const bgm = {
  audio: new Audio(),
  on: false,
  loops: 0,
  lastTime: 0,
  volume: Math.min(1, Math.max(0, Number(bgmLoad(BGM_VOL_KEY, '0.5')) || 0)),
  trackId: bgmLoad(BGM_TRACK_KEY, BGM_TRACKS[0].id),
  fadeTimer: 0,
  stopping: false,
  starting: false
};
bgm.audio.loop = true;
bgm.audio.preload = 'none';

function bgmTrack() {
  return BGM_TRACKS.find(t => t.id === bgm.trackId) || BGM_TRACKS[0];
}

function bgmFade(to, done) {
  clearInterval(bgm.fadeTimer);
  const a = bgm.audio;
  const from = a.volume;
  const start = performance.now();
  bgm.fadeTimer = setInterval(() => {
    const p = Math.min(1, (performance.now() - start) / BGM_FADE_MS);
    a.volume = from + (to - from) * p;
    if (p >= 1) { clearInterval(bgm.fadeTimer); if (done) done(); }
  }, 50);
}

function bgmNotify() {
  document.querySelectorAll('[data-bgm-toggle]').forEach(btn => {
    btn.classList.toggle('on', bgm.on);
    btn.setAttribute('aria-pressed', String(bgm.on));
    btn.textContent = bgm.on ? '♪ ON' : '♪ OFF';
  });
  document.dispatchEvent(new CustomEvent('bgmchange'));
}

function bgmStart() {
  const a = bgm.audio;
  const track = bgmTrack();
  if (!a.src.endsWith(track.src.replace('./', ''))) a.src = track.src;
  a.volume = 0;
  bgm.starting = true;
  const p = a.play();
  const ok = () => { bgm.starting = false; bgm.stopping = false; bgmFade(bgm.volume); };
  if (p && p.then) p.then(ok).catch(() => { bgm.starting = false; bgmSet(false); });
  else ok();
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist, album: tr('brand'), artwork: [{ src: track.img, sizes: '470x836', type: 'image/webp' }] });
    navigator.mediaSession.setActionHandler('play', () => bgmSet(true));
    navigator.mediaSession.setActionHandler('pause', () => bgmSet(false));
  }
}

function bgmStop() {
  bgm.stopping = true;
  bgmFade(0, () => { bgm.audio.pause(); bgm.stopping = false; });
}

function bgmSet(on) {
  bgm.on = on;
  if (on) bgm.loops = 0;
  if (on) bgmStart(); else bgmStop();
  bgmNotify();
}

// ロック画面や他アプリからの一時停止もオン/オフに反映する
bgm.audio.addEventListener('pause', () => {
  if (bgm.on && !bgm.stopping && !bgm.starting && !bgm.audio.ended) bgmSet(false);
});

bgm.audio.addEventListener('timeupdate', () => {
  const t = bgm.audio.currentTime;
  if (t + 1 < bgm.lastTime && ++bgm.loops >= BGM_MAX_LOOPS) bgmSet(false);
  bgm.lastTime = t;
});

document.addEventListener('click', e => {
  const btn = e.target.closest?.('[data-bgm-toggle]');
  if (btn) bgmSet(!bgm.on);
});

function renderBgm() {
  setActiveTab('bgm');
  const track = bgmTrack();
  main().innerHTML = `<div class="bgm"><div class="pagehead"><h2>${esc(tr('bgm'))}</h2></div>
  <div class="bgm-scene" style="background-image:url('${track.img}')" role="img" aria-label="${esc(track.title)}">
    <div class="bgm-scene-title">♪ ${esc(track.title)}</div>
  </div>
  <div class="bgm-credit">Music: ${esc(track.artist)} / Pixabay</div>
  <div class="list-window">
    <div class="settingrow"><label class="settingtitle" for="bgmTrackSetting">${esc(tr('bgmTrack'))}</label><select id="bgmTrackSetting" class="select">${BGM_TRACKS.map(t => `<option value="${t.id}" ${t.id === track.id ? 'selected' : ''}>${esc(t.title)}</option>`).join('')}</select></div>
    <div class="settingrow"><span class="settingtitle">${esc(tr('bgmPower'))}</span><button class="plainbtn small bgm-toggle" type="button" data-bgm-toggle></button></div>
    <div class="settingrow"><label class="settingtitle" for="bgmVolume">${esc(tr('bgmVolume'))}</label><input id="bgmVolume" class="bgm-volume" type="range" min="0" max="100" value="${Math.round(bgm.volume * 100)}"></div>
  </div></div>`;
  bgmNotify();
  $('#bgmTrackSetting').onchange = e => {
    bgm.trackId = e.target.value;
    bgmSave(BGM_TRACK_KEY, bgm.trackId);
    if (bgm.on) bgmStart();
    renderBgm();
  };
  $('#bgmVolume').oninput = e => {
    bgm.volume = Number(e.target.value) / 100;
    bgmSave(BGM_VOL_KEY, bgm.volume);
    if (bgm.on && !bgm.audio.paused) { clearInterval(bgm.fadeTimer); bgm.audio.volume = bgm.volume; }
  };
}

document.querySelector('[data-tab="bgm"]').onclick = renderBgm;
