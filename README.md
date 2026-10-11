# ระบบจัดการปั๊มน้ำมัน (Gas Station Manager)

เว็บแอปจัดการปั๊มน้ำมัน: ถังน้ำมัน, บันทึกเลขมิเตอร์รายวัน, ราคาขายประจำวัน, สั่งซื้อน้ำมัน, ลูกหนี้สินเชื่อน้ำมัน และสรุปยอดขาย/กำไร

- ไฟล์ HTML ไฟล์เดียว (`index.html`) ไม่ต้อง build — deploy บน Vercel ได้ทันที
- **ข้อมูลเก็บใน Google Sheet ของคุณ** (ไม่ต้องใช้ Google Cloud) แต่ละหมวดอยู่คนละแท็บ เปิดดูได้ตลอด
- ใช้หลายเครื่องพร้อมกันได้ ระบบรวมการแก้ไขให้อัตโนมัติ
- ย้อนดูข้อมูลเก่าได้จาก **File → Version history** ใน Google Sheet
- รหัสยืนยันการแก้ไข/ลบในแอป: `1234` (แก้ได้ที่ `const PIN` ใน `index.html`)

---

## ขั้นตอนที่ 1 — เตรียม Google Sheet (ครั้งเดียว ~5 นาที)

1. เปิด **https://sheets.new** → ได้ Google Sheet ใหม่ → ตั้งชื่อ เช่น `ข้อมูลปั๊มน้ำมัน`
2. เมนู **Extensions → Apps Script** (ส่วนขยาย → Apps Script)
3. ลบโค้ดเดิมในไฟล์ `Code.gs` ทั้งหมด → วางโค้ดจากไฟล์ [`apps-script/Code.gs`](apps-script/Code.gs) ใน repo นี้ → กด 💾 **Save**
4. กดปุ่มสีน้ำเงิน **Deploy → New deployment**
5. กดไอคอน ⚙️ ข้าง "Select type" → เลือก **Web app**
6. ตั้งค่า
   - Description: `gas station api`
   - **Execute as: Me** (อีเมลของคุณ)
   - **Who has access: Anyone**
7. กด **Deploy** → กด **Authorize access** → เลือกบัญชี Google
   - ถ้าขึ้น "Google hasn't verified this app" → กด **Advanced** → **Go to … (unsafe)** → **Allow**
     (เป็นสคริปต์ของคุณเอง เข้าถึงได้เฉพาะชีตนี้)
8. คัดลอก **Web app URL** (ขึ้นต้น `https://script.google.com/macros/s/` ลงท้าย `/exec`)

## ขั้นตอนที่ 2 — Deploy บน Vercel

1. เข้า **https://vercel.com/new** → Import repository **gasstation**
2. Framework Preset: **Other** → กด **Deploy**

## ขั้นตอนที่ 3 — เชื่อมต่อในแอป

1. เปิดเว็บบน Vercel → กด **เชื่อมต่อ Google Sheets**
2. วาง **Web app URL** และตั้ง **รหัสเข้าใช้งาน** (อย่างน้อย 4 ตัวอักษร) → กด **เชื่อมต่อ**
   - ครั้งแรกระบบจะจำรหัสนี้ไว้ เครื่องอื่น ๆ ต้องใช้รหัสเดียวกัน
3. ย้ายข้อมูลเดิม: กดไฟสถานะ **Google Sheets** มุมขวาบน → **นำเข้าไฟล์สำรอง (.json)** → เลือกไฟล์ → ใส่รหัส 1234

> ไม่อยากวางลิงก์ทุกเครื่อง? ใส่ URL ใน `config.js` (`sheetApiUrl`) แล้ว commit — เครื่องใหม่จะถามแค่รหัสเข้าใช้งาน

---

## คำถามที่พบบ่อย
- **ลืมรหัสเข้าใช้งาน** → เปิด Apps Script → เลือกฟังก์ชัน `resetAccessKey` → กด ▶ Run → แล้วตั้งรหัสใหม่จากแอป
- **แก้โค้ด Apps Script แล้ว** → ต้อง **Deploy → Manage deployments → ✏️ → Version: New version → Deploy** (ลิงก์เดิมใช้ต่อได้)
- **แก้ข้อมูลในชีตโดยตรงได้ไหม** → ไม่แนะนำ แอปใช้คอลัมน์ `data (ระบบ)` เป็นข้อมูลจริง ให้แก้ผ่านแอป
- **อินเทอร์เน็ตหลุด** → ข้อมูลที่กรอกเก็บไว้ในเครื่องก่อน และส่งขึ้นชีตอัตโนมัติเมื่อกลับมาออนไลน์
- อย่า commit ไฟล์ข้อมูลจริง (.json) ลง repository นี้
