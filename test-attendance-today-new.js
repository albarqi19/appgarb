// Test for the new attendance-today API endpoint
const API_BASE_URL = 'http://localhost:8000/api';

async function testAttendanceTodayAPI() {
    console.log('🔍 Testing new attendance-today API endpoint...\n');
    
    // Test data - replace with actual values
    const mosqueId = 1; // Replace with actual mosque ID
    const teacherId = 1; // Replace with actual teacher ID
    
    try {
        const url = `${API_BASE_URL}/mosques/${mosqueId}/attendance-today?teacher_id=${teacherId}`;
        console.log(`📡 Making request to: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
        console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ Error Response Body:`, errorText);
            return;
        }
        
        const data = await response.json();
        console.log('\n✅ Success! Response data:');
        console.log(JSON.stringify(data, null, 2));
        
        // Analyze the structure
        if (Array.isArray(data)) {
            console.log(`\n📈 Analysis: Received ${data.length} attendance records`);
            if (data.length > 0) {
                console.log('📋 Sample record structure:');
                console.log('Keys:', Object.keys(data[0]));
                console.log('First record:', JSON.stringify(data[0], null, 2));
            }
        } else if (typeof data === 'object') {
            console.log('\n📈 Analysis: Received object response');
            console.log('Keys:', Object.keys(data));
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        console.error('Full error:', error);
    }
}

// Test with different mosque/teacher combinations
async function testMultipleScenarios() {
    console.log('🧪 Testing multiple scenarios...\n');
    
    const testCases = [
        { mosque_id: 1, teacher_id: 1 },
        { mosque_id: 1, teacher_id: 2 },
        { mosque_id: 2, teacher_id: 1 }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n--- Testing Mosque ID: ${testCase.mosque_id}, Teacher ID: ${testCase.teacher_id} ---`);
        
        try {
            const url = `${API_BASE_URL}/mosques/${testCase.mosque_id}/attendance-today?teacher_id=${testCase.teacher_id}`;
            const response = await fetch(url);
            
            console.log(`Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Success - Records: ${Array.isArray(data) ? data.length : 'Object response'}`);
            } else {
                const errorText = await response.text();
                console.log(`❌ Error: ${errorText}`);
            }
        } catch (error) {
            console.log(`❌ Network Error: ${error.message}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Run the tests
async function runAllTests() {
    console.log('🚀 Starting attendance-today API tests...\n');
    
    await testAttendanceTodayAPI();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testMultipleScenarios();
    
    console.log('\n✨ Tests completed!');
}

runAllTests();
