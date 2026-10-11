/**
 * ระบบจัดการปั๊มน้ำมัน — API สำหรับ Google Sheets
 * วางโค้ดนี้ใน Extensions → Apps Script ของ Google Sheet แล้ว Deploy เป็น Web app
 * (Execute as: Me, Who has access: Anyone)
 *
 * ข้อมูลแต่ละหมวดอยู่คนละแท็บ คอลัมน์สุดท้าย "data (ระบบ)" คือข้อมูลจริงที่แอปใช้
 * กรุณาแก้ไขข้อมูลผ่านแอป ไม่ใช่แก้ในชีตโดยตรง
 */
const SHEETS = {
  tanks: 'ถังน้ำมัน', nozzles: 'หัวจ่าย', readings: 'เลขมิเตอร์', orders: 'สั่งซื้อน้ำมัน',
  dayprices: 'ราคาขายรายวัน', customers: 'ลูกค้าสินเชื่อ', credits: 'รายการสินเชื่อ', settings: 'ตั้งค่า'
};
const DATA_COL = 'data (ระบบ)';

function doGet() {
  return out({ ok: true, app: 'gas-station-sheets', message: 'API พร้อมใช้งาน — นำลิงก์นี้ไปใส่ในแอป' });
}

function doPost(e) {
  let req = {};
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'bad_request' }); }

  // รหัสเข้าใช้งาน: ครั้งแรกที่เชื่อมต่อ ระบบจะจำรหัสที่ใส่ไว้ (ต้องมีอย่างน้อย 4 ตัวอักษร)
  const props = PropertiesService.getScriptProperties();
  let key = props.getProperty('ACCESS_KEY');
  if (!key) {
    if (!req.key || String(req.key).length < 4) return out({ ok: false, error: 'key_too_short' });
    key = String(req.key);
    props.setProperty('ACCESS_KEY', key);
  }
  if (String(req.key) !== key) return out({ ok: false, error: 'wrong_key' });

  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    if (req.action === 'rev') return out({ ok: true, rev: getRev() });
    if (req.action === 'load') return out({ ok: true, rev: getRev(), data: readAll(), sheetUrl: SpreadsheetApp.getActive().getUrl() });
    if (req.action === 'save') {
      const data = readAll(), touched = {};
      (req.changes || []).forEach(function (ch) {
        if (!SHEETS[ch.c] || !ch.id) return;
        data[ch.c] = data[ch.c] || {};
        if (ch.data === null) delete data[ch.c][ch.id]; else data[ch.c][ch.id] = ch.data;
        touched[ch.c] = true;
      });
      Object.keys(touched).forEach(function (c) { writeSheet(c, data[c]); });
      return out({ ok: true, rev: bumpRev(), data: data });
    }
    if (req.action === 'replace') {
      const d = req.data || {};
      Object.keys(SHEETS).forEach(function (c) { writeSheet(c, d[c] || {}); });
      return out({ ok: true, rev: bumpRev(), data: readAll() });
    }
    return out({ ok: false, error: 'unknown_action' });
  } finally {
    lock.releaseLock();
  }
}

function readAll() {
  const data = {};
  Object.keys(SHEETS).forEach(function (c) { data[c] = readSheet(c); });
  return data;
}

function readSheet(c) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEETS[c]);
  const res = {};
  if (!sh || sh.getLastRow() < 2) return res;
  const values = sh.getDataRange().getValues();
  const head = values[0], iId = head.indexOf('id'), iData = head.indexOf(DATA_COL);
  if (iId < 0 || iData < 0) return res;
  for (let r = 1; r < values.length; r++) {
    const id = String(values[r][iId] || ''); if (!id) continue;
    try { res[id] = JSON.parse(values[r][iData]); } catch (err) { /* แถวที่แก้มือจนเสีย ข้ามไป */ }
  }
  return res;
}

function writeSheet(c, obj) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEETS[c]);
  if (!sh) sh = ss.insertSheet(SHEETS[c]);
  const ids = Object.keys(obj || {}).sort();
  const fields = [];
  ids.forEach(function (id) { Object.keys(obj[id] || {}).forEach(function (k) { if (fields.indexOf(k) < 0) fields.push(k); }); });
  const head = ['id'].concat(fields, [DATA_COL]);
  const rows = [head].concat(ids.map(function (id) {
    const o = obj[id] || {};
    return [id].concat(fields.map(function (k) {
      const v = o[k];
      return v === null || v === undefined ? '' : (typeof v === 'object' ? JSON.stringify(v) : v);
    }), [JSON.stringify(o)]);
  }));
  sh.clear();
  const rng = sh.getRange(1, 1, rows.length, head.length);
  rng.setNumberFormat('@');           // เก็บเป็นข้อความ ไม่ให้ชีตแปลงวันที่/ตัวเลขเอง
  rng.setValues(rows.map(function (r) { return r.map(function (v) { return typeof v === 'string' ? v : String(v); }); }));
  sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#fdf1d8');
  sh.setFrozenRows(1);
}

function getRev() { return Number(PropertiesService.getScriptProperties().getProperty('REV') || 0); }
function bumpRev() { const n = getRev() + 1; PropertiesService.getScriptProperties().setProperty('REV', String(n)); return n; }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** ล้างรหัสเข้าใช้งาน (กด Run ฟังก์ชันนี้ใน Apps Script ถ้าลืมรหัส แล้วตั้งรหัสใหม่จากแอป) */
function resetAccessKey() { PropertiesService.getScriptProperties().deleteProperty('ACCESS_KEY'); }
