# BTC Monitor

แดชบอร์ดราคาและข้อมูลตลาด Bitcoin แบบเรียลไทม์ สร้างด้วย Next.js โดยดึงข้อมูลจาก public API เท่านั้น (ไม่ต้องรัน Bitcoin full node)

## ข้อมูลที่แสดง

- ราคา BTC/USD แบบเรียลไทม์ผ่าน WebSocket — [Binance](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams) (ล้มแล้วเชื่อมต่อใหม่อัตโนมัติ, fallback เป็นราคาจาก CoinGecko เมื่อขาดการเชื่อมต่อ)
- การเปลี่ยนแปลง 24 ชม. / 7 วัน / 30 วัน — [CoinGecko](https://www.coingecko.com/en/api)
- Market Cap, ปริมาณซื้อขาย 24 ชม., All-Time High — CoinGecko
- BTC Dominance — CoinGecko
- ดัชนีกลัว/โลภ (Fear & Greed Index) — [Alternative.me](https://alternative.me/crypto/fear-and-greed-index/)
- Funding Rate และ Open Interest — [Binance Futures](https://binance-docs.github.io/apidocs/futures/en/)
- กราฟราคาย้อนหลัง 365 วัน (log/linear) พร้อม Moving Average (50/200 วัน) และ RSI (14 วัน), และผลตอบแทนรายเดือน — คำนวณจากข้อมูล CoinGecko
- นับถอยหลัง Bitcoin Halving ครั้งถัดไป (ประมาณจากความสูงบล็อกและเวลาบล็อกเฉลี่ย) — [mempool.space](https://mempool.space/docs/api/rest)
- ตั้งแจ้งเตือนราคา (สูงกว่า/ต่ำกว่าที่กำหนด) พร้อม Browser Notification — เก็บไว้ใน localStorage ของเบราว์เซอร์ ไม่มีบัญชีผู้ใช้หรือเซิร์ฟเวอร์เก็บข้อมูล

**หมายเหตุ:** ตัวชี้วัด on-chain เช่น MVRV, SOPR, Realized Price, HODL Waves ไม่รวมอยู่ในเว็บนี้ เพราะต้องใช้ Bitcoin full node + UTXO indexer ของตัวเอง (ข้อมูลระดับเดียวกับ Glassnode/CryptoQuant)

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm run start
```
