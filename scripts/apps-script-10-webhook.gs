/**
 * カッテニハコダテ 情報収集システム
 * 10_webhook.gs - GitHub Actionsからのステータス更新・行削除受け口
 *
 * action: "mark"  (デフォルト) → L列を「処理済み」に更新
 * action: "delete"             → 該当行をシートから物理削除
 *
 * リクエスト形式:
 *   { "action": "delete", "ids": ["20260402-NEWS-001", ...] }
 *   { "ids": ["..."] }  ← action省略時は "mark"
 */

var TARGET_SHEET_NAME = '03_求人リード';

function doPost(e) {
  try {
    var body   = JSON.parse(e.postData.contents);
    var ids    = body.ids    || [];
    var action = body.action || 'mark';   // 'mark' | 'delete'

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TARGET_SHEET_NAME);
    if (!sheet) {
      return _jsonRes({ error: TARGET_SHEET_NAME + ' シートが見つかりません' });
    }

    var idSet = new Set(ids.map(function(id) { return String(id).trim(); }));

    // ── 行削除 ──────────────────────────────────────────────────
    if (action === 'delete') {
      var data        = sheet.getDataRange().getValues();
      var rowsToDelete = [];

      for (var i = 1; i < data.length; i++) {
        var rowId = String(data[i][1]).trim();   // B列 = 共通ID
        if (idSet.has(rowId)) {
          rowsToDelete.push(i + 1);              // 1-indexed
        }
      }

      // 下から削除して行番号ずれを防ぐ
      rowsToDelete.sort(function(a, b) { return b - a; });
      for (var j = 0; j < rowsToDelete.length; j++) {
        sheet.deleteRow(rowsToDelete[j]);
      }

      return _jsonRes({ success: true, deleted: rowsToDelete.length });
    }

    // ── ステータスを「処理済み」に更新 ──────────────────────────
    var data    = sheet.getDataRange().getValues();
    var updated = 0;

    for (var i = 1; i < data.length; i++) {
      var rowId = String(data[i][1]).trim();
      if (idSet.has(rowId)) {
        sheet.getRange(i + 1, 12).setValue('処理済み');   // L列
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
 * テスト用（スクリプトエディタから手動実行）
 * action を 'delete' にすると実際に削除されるので注意
 */
function testDoPost() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TARGET_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    console.log('シートにデータがありません');
    return;
  }
  var sampleId = String(sheet.getRange(2, 2).getValue()).trim();
  console.log('テストID: ' + sampleId);

  // mark テスト（削除しない）
  var fakeEvent = { postData: { contents: JSON.stringify({ action: 'mark', ids: [sampleId] }) } };
  var result = doPost(fakeEvent);
  console.log('結果: ' + result.getContent());
}
