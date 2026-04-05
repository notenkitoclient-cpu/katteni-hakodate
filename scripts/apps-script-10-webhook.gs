/**
 * カッテニハコダテ 情報収集システム
 * 10_webhook.gs - GitHub Actionsからのステータス更新受け口
 *
 * GitHub の sheets-import.mjs が処理完了後にここを呼び出し、
 * 03_求人リード シートの対象行ステータスを「処理済み」に更新する。
 *
 * 対応カラムレイアウト:
 *   新フォーマット (03_jobs.gs 書き込み):
 *     B列(2): 生成ID "20260402-NEWS-001"
 *     C列(3): タイトル
 *     J列(10): URL
 *     L列(12): ステータス
 *
 *   旧フォーマット (蓄積データ):
 *     B列(2): "タイトル - ソース名"
 *     D列(4): URL
 *     L列(12): ステータス
 */

var TARGET_SHEET_NAME = '03_求人リード';

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var ids = body.ids || [];          // B列の値（rawId）の配列

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TARGET_SHEET_NAME);
    if (!sheet) {
      return _jsonRes({ error: TARGET_SHEET_NAME + ' シートが見つかりません' });
    }

    var data = sheet.getDataRange().getValues();
    var idSet = new Set(ids.map(function(id) { return String(id).trim(); }));
    var updated = 0;

    for (var i = 1; i < data.length; i++) {
      var rowId = String(data[i][1]).trim();  // B列 = 共通ID（両フォーマット共通）
      if (idSet.has(rowId)) {
        sheet.getRange(i + 1, 12).setValue('処理済み'); // L列
        updated++;
      }
    }

    return _jsonRes({ success: true, updated: updated });

  } catch (err) {
    return _jsonRes({ error: err.message });
  }
}

function _jsonRes(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * テスト用: スクリプトエディタから手動実行して動作確認
 */
function testDoPost() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TARGET_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    console.log('シートにデータがありません');
    return;
  }
  // 先頭データ行のB列値を取得してテスト
  var sampleId = String(sheet.getRange(2, 2).getValue()).trim();
  console.log('テストID: ' + sampleId);

  var fakeEvent = { postData: { contents: JSON.stringify({ ids: [sampleId] }) } };
  var result = doPost(fakeEvent);
  console.log('結果: ' + result.getContent());
}
