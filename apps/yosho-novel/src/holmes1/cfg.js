/* SUPER洋書ノベル 第1話の設定（ドイル「ボヘミアの醜聞」1891）。lang:"en" で英語の行・和訳・読み上げ・英語辞書が働く。
   地図は1880年代のロンドン（Bacon's New Ordnance Map, パブリックドメイン）。k は1度あたりの描画単位（街の地図なので大きくする） */
const CFG={
 app:"洋書ノベル",lang:"en",page:"index.html",shelf:"holmes",room:"holmes1",
 k:5000,lon0:-0.15,lat0:51.515,init:{c:[-0.155,51.52],r:160},home:{c:[-0.145,51.518],r:240},
 terrAlways:1,
 terr:[],
 shelves:[{id:"holmes",name:"シャーロック・ホームズ",eras:[["ボヘミアの醜聞","1891","ボヘミアの醜聞","index.html","1888年 ロンドン"],["赤毛連盟","1891"],["花婿失踪事件","1891"],["ボスコム谷の惨劇","1891"],["五つのオレンジの種","1891"],["唇のねじれた男","1891"]]}],
 attrib:"原文：Arthur Conan Doyle, A Scandal in Bohemia (1891)",credit:"原文：Arthur Conan Doyle “A Scandal in Bohemia”（1891、パブリックドメイン）。和訳・辞書はこのアプリのために作成",
 endSub:"ボヘミアの醜聞 読了",endTitle:"あの女性（ひと）",
 next:{t:"赤毛連盟",d:"赤い髪の男だけが入れる、奇妙な組合。仕事は百科事典を書き写すだけで、週4ポンド。うますぎる話の裏にあるものは？"},
 flash:[
  {ja:"データがないうちに推理するのは大きな間違いだ。",en:"It is a capital mistake to theorise before one has data."},
  {ja:"君は見ているが、観察していない。",en:"You see, but you do not observe."},
  {ja:"そこが肝心なところだ。",en:"That is just my point."}
 ]
};
