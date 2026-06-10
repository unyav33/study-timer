# สร้างโค้ดหลังบ้านไฟล์แรก

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime

# สร้างตัวแปรแอปหลังบ้าน
app = FastAPI()

# ปลดล็อก CORS เพื่อให้หน้าบ้านยอมคุยกับหลังบ้าน
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # ยอมให้เปิดจากหน้าเว็บไหนวิ่งมาหาก็ได้
    allow_credentials=True,
    allow_methods=["*"], # ยอมให้ใช้คำสั่ง GET, POST ทุกรูปแบบ
    allow_headers=["*"],
)

# --- 1. ตั้งค่าฐานข้อมูล SQLite ---
DB_NAME = "study_data.db"

def init_db():
    """ฟังก์ชันสำหรับสร้างตารางในฐานข้อมูลเริ่มต้น"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # สร้างตารางชื่อ sessions ถ้ายังไม่มี
    cursor.execute("""
                   CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, duration_minutes INTEGER NOT NULL
                   )
    """)
    conn.commit()
    conn.close()

# สั่งให้ฐานข้อมูลทำงานทันทีที่เปิดระบบหลังบ้าน
init_db()

# --- 2. สร้าง data model สำหรับค่าจากหน้าบ้าน ---
class TimerSession(BaseModel):
    duration_minutes: int

# --- 3. สร้าง route แบบ GET เพื่อทักทาย---

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "สวัสดีครับ! นี่คือระบบหลังบ้านของ Study Timer พร้อมใช้งานแล้ว"
    }

# Gate 1: สำหรับข้อมูลจากหน้าบ้านมาบันทึก (POST)
@app.post("/save-session")
def save_session(session: TimerSession):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # ดึงวันที่ปัจจุบันในรูปแบบ ปี-เดือน-วัน
    current_date = datetime.now() .strftime("%Y-%m-%d")

    # บันทึกลงตาราง
    cursor.execute(
        "INSERT INTO sessions (date, duration_minutes) VALUES (?, ?)",
        (current_date, session.duration_minutes)
    )
    conn.commit()
    conn.close()

    return {"status": "success", "message": f"บันทึกเวลาสำเร็จ {session.duration_minutes} นาที"}

# Gate 2: สำหรับดึงประวัติทั้งหมดไปโชว์หน้าบ้าน (GET)
@app.get("/history")
def get_history():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT date, duration_minutes FROM sessions ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    # แปลงผลลัพธ์ให้อยู่ในรูปที่อ่านง่าย
    history_list = [{"date": row[0], "duration_minutes": row[1]} for row in rows]
    return history_list


