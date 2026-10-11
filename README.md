# ระบบจัดการปั๊มน้ำมัน (Gas Station Manager)

เว็บแอปจัดการปั๊มน้ำมัน: ถังน้ำมัน, บันทึกเลขมิเตอร์รายวัน, ราคาขายประจำวัน, สั่งซื้อน้ำมัน, ลูกหนี้สินเชื่อน้ำมัน และสรุปยอดขาย/กำไร

- เป็นไฟล์ HTML ไฟล์เดียว (`index.html`) ไม่ต้อง build
- **ข้อมูลเก็บใน Google Drive ของผู้ใช้** เป็นไฟล์ `gas-station-data.json` ในโฟลเดอร์ `Gas Station Manager`
- ระบบคัดลอกไฟล์ข้อมูลเป็นไฟล์สำรองวันละ 1 ชุดในโฟลเดอร์เดียวกัน
- ใช้ได้หลายเครื่องพร้อมกัน (ลงชื่อด้วยบัญชี Google เดียวกัน) ระบบจะรวมการแก้ไขที่ต่างรายการกันให้อัตโนมัติ
- รหัสยืนยันการแก้ไข/ลบ: `1234` (แก้ได้ที่ `const PIN` ใน `index.html`)

## ขั้นตอนติดตั้ง

### 1) สร้าง Google OAuth Client ID (ครั้งเดียว ~5 นาที)
1. เข้า <https://console.cloud.google.com/> → สร้างโปรเจกต์ใหม่ (เช่น `gas-station`)
2. เมนู **APIs & Services → Library** → ค้นหา **Google Drive API** → กด **Enable**
3. เมนู **APIs & Services → OAuth consent screen**
   - User type: **External** → ใส่ชื่อแอปและอีเมล
   - Scopes: เพิ่ม `.../auth/drive.file`
   - **Test users**: เพิ่มอีเมล Google ของทุกคนที่จะใช้แอป
4. เมนู **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins**: ใส่ URL ของเว็บบน Vercel เช่น `https://gasstation.vercel.app`
     (ถ้าจะทดสอบในเครื่อง เพิ่ม `http://localhost:3000` ด้วย)
   - กด Create แล้วคัดลอก **Client ID** (ลงท้ายด้วย `.apps.googleusercontent.com`)

### 2) ใส่ Client ID
แก้ไฟล์ `config.js`:
```js
window.GSM_CONFIG = {
  googleClientId: "xxxxxxxxxxxx-xxxxxxxx.apps.googleusercontent.com"
};
```
Commit แล้ว push — Vercel จะ deploy ใหม่ให้อัตโนมัติ

### 3) Deploy บน Vercel
1. เข้า <https://vercel.com/new> → **Import** repository `gasstation`
2. Framework Preset: **Other** · ไม่ต้องตั้ง Build Command / Output Directory
3. กด **Deploy** → ได้ URL เช่น `https://gasstation.vercel.app`
4. นำ URL นี้ไปใส่ใน **Authorized JavaScript origins** ในขั้นตอนที่ 1 (ถ้ายังไม่ได้ใส่)

### 4) เริ่มใช้งาน
1. เปิดเว็บ → กด **เชื่อมต่อ Google Drive** → เลือกบัญชี → อนุญาต
2. ย้ายข้อมูลจากเวอร์ชัน Claude: กดไฟสถานะ **Google Drive** มุมขวาบน → **นำเข้าไฟล์สำรอง (.json)** → เลือกไฟล์สำรอง → ใส่รหัส

## หมายเหตุ
- สิทธิ์ `drive.file` ให้แอปเข้าถึงเฉพาะไฟล์ที่แอปสร้างเองเท่านั้น ไม่เห็นไฟล์อื่นใน Drive
- การลงชื่อเข้าใช้ Google มีอายุประมาณ 1 ชั่วโมง เมื่อหมดอายุ ไฟสถานะจะขึ้น "กดเพื่อเชื่อมต่อ" — ข้อมูลที่บันทึกระหว่างนั้นจะเก็บไว้ในเครื่องและส่งขึ้น Drive เมื่อเชื่อมต่อใหม่
- อย่า commit ไฟล์ข้อมูลจริงลง repository นี้
