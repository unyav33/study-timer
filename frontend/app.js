// 1. ดึง Elements จาก html เก็บไว้ในตัวแปร
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 2. ตั้งค่าตัวแปรเริ่มต้น สำหรับระบบจับเวลา
let timer;              // ใช้เก็บตัวจับเวลา (Interval)
let timeLeft = 25 * 60; // แปลง 25 min to 1500 second
let isRunning = false;  // เช็คสถานะ ว่าเวลาเดินอยู่ไหม

// 3. ฟังก์ชันอัปเดตตัวเลขบนจอ (แปลงวิกลับเป็นนาที)
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // เติมเลข 0 ข้างหน้าถ้าตัวเลขเหลือหลักเดียว
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    const displaySeconds = seconds < 10 ? '0' + seconds : seconds;    

    display.textContent = displayMinutes+':'+displaySeconds;
}

// 4. ฟังก์ชันสั่งให้เวลาเดินถอยหลัง
function startTimer() {
    if (isRunning) return; // ถ้าแอปเดินอยู่แล้ว กดซ้ำก็ไม่ต้องทำอะไร

    isRunning = true;
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;      // ลดเวลาลงทีละ 1 วิ
            updateDisplay(); // อัปเดตตัวเลขหน้าจอ
        } else {
            // ถ้าเวลาเหลือ 0
            // 🚨บล็อกตอนหมดเวลา
            clearInterval(timer);
            isRunning = false;

            // 1. ส่งเสียงเตือนให้ผู้ใช้รู้ตัวก่อน
            alert('หมดเวลาอ่านหนังสือแล้ว! พักผ่อนได้ค่ะ ☕');

            // 2. ส่งข้อมูลไปบันทึกที่หลังบ้าน (ยิง API to Backend)
            // สมมติอ่านครบ 25 นาทีเต็ม
            fetch('http://127.0.0.1:8000/save-session', {
                method: 'POST', //ใช้ post เพื่อส่งข้อมูลไปบันทึก
                headers: {
                    'Content-Type': 'application/json' // บอกหลังบ้านว่าส่งข้อมูลแบบ JSON ไปนะ
                },
                body: JSON.stringify({
                    duration_minutes: 25 // ส่งเลข 25 นาทีไปหลังบ้านหยอดลงฐานข้อมูล
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('สำเร็จ:', data);
                alert('บันทึกสถิติลงฐานข้อมูลหลังบ้านเรียบร้อยแล้วค่ะ! ✨');
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาด:', error);
                alert('ไม่สามารถเชื่อมต่อหลังบ้านได้ ข้อมูลยังไม่ถูกบันทึกค่ะ');
            });

            // 3. รีเซ็ตเวลากลับมาเริ่มต้นใหม่
            resetTimer();
        }
    }, 1000); // 1000 millisecond = 1 second
}

// 5. ฟังก์ชันหยุดเวลาชั่วคราว
function pauseTimer() {
    clearInterval(timer); // สั่งหยุดตัวนับเวลา
    isRunnung = false;
}

// 6. ฟังก์ชันรีเซ็ตเวลากลับเป็น 25 วิ
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = 25 * 60; // reset to 25 seconds
    updateDisplay();
}

// 7. ผูกฟังก์ชันเข้ากับปุ่มต่าง ๆ
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
