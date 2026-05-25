const http = require('http');

function request(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch(e) {
          resolve({ status: res.statusCode, data: resBody });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(data);
    req.end();
  });
}

async function run() {
  try {
    const email = `test_${Date.now()}@test.com`;
    // 1. Register
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'Test', email, password: 'password', confirmPassword: 'password'
    });
    console.log('Register:', regRes);

    // 2. Login
    const loginRes = await request('/api/auth/login', 'POST', {
      email, password: 'password'
    });
    console.log('Login:', loginRes);
    const token = loginRes.data.token;

    // 3. Personalize
    const profRes = await request('/api/auth/profile', 'PUT', {
      age: 25, bmi: 22.5, sleep_hours: 7.5, gender: 'Male', 
      work_type: 'Office', fitness_level: 'Medium', device_preference: 'Laptop'
    }, token);
    console.log('Profile:', profRes);

    // 4. Predict
    const predRes = await request('/predict', 'POST', {
      total_sitting: 120
    }, token);
    console.log('Predict:', predRes);
    
  } catch(e) {
    console.error(e);
  }
}

run();
