# 顔ドット絵の作業手順（2026-11-05）

## 肖像画のある7人（RD Pro / Pixelate）
元画像をそのまま入れる。サイズ 128×160。プロンプトなしでよい。
- kiyomori.png 平清盛 / mochihito.png 以仁王 / yoshitsune.png 源義経 / masako.png 北条政子
- gotoba.png 後鳥羽上皇 / hiromoto.png 大江広元 / yasutoki.png 北条泰時
- 頼朝は済み（_done_yoritomo_pixelate.png）

## 肖像画のないモブ（RD Pro / Portrait）
入力画像に _done_yoritomo_pixelate.png を入れ、以下のプロンプト。サイズ 128×160。
- 平時忠: Heian period Japanese court noble, middle-aged man, tall black eboshi hat, dark red court robe with crossed V-neck kimono collar, thin mustache, sly expression, facing right, plain white background, no bow tie, no Chinese hat
- 千葉常胤: Kamakura period Japanese samurai, old man with white hair and beard, black eboshi hat, dark green hitatare with crossed V-neck collar, calm wise expression, facing right, plain white background, no bow tie, no Chinese hat
- 上総広常: Kamakura period Japanese samurai warlord, burly man, thick beard, black eboshi hat, brown hitatare with crossed V-neck collar, arrogant proud expression, facing right, plain white background, no bow tie, no Chinese hat
- 公暁: Kamakura period young Japanese Buddhist monk, about 19 years old, shaved head, white monk hood, grey monk robe, intense grim expression, facing right, plain white background, no bow tie
- 北条義時: Kamakura period Japanese samurai regent, man in his fifties, black eboshi hat, dark blue hitatare with crossed V-neck collar, cold calculating expression, facing right, plain white background, no bow tie, no Chinese hat
- 御家人たち: Kamakura period Japanese samurai warrior, rugged man, black eboshi hat, simple brown hitatare with crossed V-neck collar, determined expression, facing right, plain white background, no bow tie, no Chinese hat

## できた画像
スレッドに送れば、Claude が柄のノイズ消し・色数とサイズ合わせをしてノベルに組み込む。
