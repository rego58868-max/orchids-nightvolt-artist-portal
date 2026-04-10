const https = require('https');

const data = JSON.stringify({
  name: 'ticket-attachments',
  public: true
});

const options = {
  hostname: 'bwfnoernduvuhpupvutj.supabase.co',
  port: 443,
  path: '/storage/v1/bucket',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Zm5vZXJuZHV2dWhwdXB2dXRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM3MDcyOCwiZXhwIjoyMDgwOTQ2NzI4fQ.dXjkSxhZtepyNhPl4_nMJDZ99xZCyn0TvvzuQSnJ8OQ',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
