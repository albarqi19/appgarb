// Test script with corrected validation values for recitation API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api/recitation';

// Test data with correct validation values
const testSessionData = {
    student_id: 1,
    teacher_id: 1,
    quran_circle_id: 1,
    start_surah_number: 1,
    start_verse: 1,
    end_surah_number: 1,
    end_verse: 7,
    recitation_type: "حفظ",  // Valid value from docs
    duration_minutes: 30,
    grade: 8.5,
    evaluation: "جيد جداً",  // Valid value from docs
    teacher_notes: "تسميع ممتاز"
};

async function testCreateSession() {
    try {
        console.log('🔄 Testing POST /api/recitation/sessions/');
        console.log('📤 Sending data:', JSON.stringify(testSessionData, null, 2));
        
        const response = await axios.post(`${API_BASE_URL}/sessions/`, testSessionData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('✅ Success! Status:', response.status);
        console.log('📥 Response data:', JSON.stringify(response.data, null, 2));
        
        return response.data;
        
    } catch (error) {
        console.log('❌ Error occurred:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Network error:', error.message);
        }
        return null;
    }
}

async function testGetSessions() {
    try {
        console.log('\n🔄 Testing GET /api/recitation/sessions/');
        
        const response = await axios.get(`${API_BASE_URL}/sessions/`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('✅ Success! Status:', response.status);
        console.log('📥 Response data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error occurred:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Network error:', error.message);
        }
    }
}

async function runTests() {
    console.log('🚀 Starting API tests with corrected validation values...\n');
    
    // Test creating a session
    const sessionResult = await testCreateSession();
    
    // Test getting sessions
    await testGetSessions();
    
    console.log('\n🏁 Testing completed!');
}

// Run the tests
runTests().catch(console.error);
