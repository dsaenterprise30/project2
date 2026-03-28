import https from 'https';

const data = JSON.stringify({
  mobileNumber: "+917021062721",
  password: "123456"
});

const options = {
  hostname: 'project2-mj7h.onrender.com',
  port: 443,
  path: '/api/users/admin-login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
