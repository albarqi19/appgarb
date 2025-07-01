// فحص وجود المعلم teacher_id = 34 في قائمة المعلمين
import fetch from 'node-fetch';

const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app/api';

async function checkTeacher34() {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    const data = await response.json();
    const found = (data.البيانات || data.data || []).find(t => t.id === 34);
    if (found) {
      console.log('✅ المعلم موجود:', found);
    } else {
      console.log('❌ المعلم غير موجود في قائمة المعلمين!');
    }
  } catch (err) {
    console.error('خطأ في جلب قائمة المعلمين:', err.message);
  }
}

checkTeacher34();
