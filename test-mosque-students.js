import https from 'https';

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/teachers/1/mosques/1/students',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

console.log('Testing API: /api/teachers/1/mosques/1/students');
console.log('Expected: Real students for teacher 1 in mosque 1');

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== Raw Response ===');
    console.log(data);
    try {
      const parsed = JSON.parse(data);
      console.log('\n=== Parsed JSON ===');
      console.log(JSON.stringify(parsed, null, 2));
      
      // Check if we have real students
      if (parsed && parsed.length > 0) {
        console.log('\n=== Analysis ===');
        console.log('Number of students found:', parsed.length);
        parsed.forEach((student, index) => {
          console.log(`Student ${index + 1}:`, student.الاسم || student.name);
        });
      } else if (parsed && parsed.الطلاب) {
        console.log('\n=== Analysis (nested format) ===');
        console.log('Number of students found:', parsed.الطلاب.length);
        parsed.الطلاب.forEach((student, index) => {
          console.log(`Student ${index + 1}:`, student.الاسم || student.name);
        });
      } else {
        console.log('\n=== Analysis ===');
        console.log('No students found or unexpected format');
      }
    } catch (e) {
      console.log('\n=== Parse Error ===');
      console.log('Failed to parse JSON:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
