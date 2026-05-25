const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Login Response:", body);
    const data = JSON.parse(body);
    if(data.token) {
        // Now try predict
        const predictOpts = {
            hostname: 'localhost',
            port: 5000,
            path: '/predict',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + data.token
            }
        };
        const req2 = http.request(predictOpts, (res2) => {
            let body2 = '';
            res2.on('data', chunk => body2 += chunk);
            res2.on('end', () => {
                console.log("Predict Response:", body2);
            });
        });
        req2.write(JSON.stringify({ total_sitting: 120 }));
        req2.end();
    }
  });
});

req.write(JSON.stringify({ email: 'admin3@gmail.com', password: 'password123' }));
req.end();
