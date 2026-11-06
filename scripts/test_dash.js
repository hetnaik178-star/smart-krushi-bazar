const puppeteer = require('puppeteer-core');
const fs = require('fs');
const http = require('http');

function loginApi(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.write(postData);
    req.end();
  });
}

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const auth = await loginApi('hetnaik178@gmail.com', 'het@171925');
  const { token, ...userData } = auth;

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.evaluate((t, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    sessionStorage.setItem('krushi_visited', 'true');
  }, token, userData);

  await page.goto('http://localhost:5173/farmer/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'docs_screenshots/13_farmer_dashboard.png' });
  console.log('Farmer dashboard size:', fs.statSync('docs_screenshots/13_farmer_dashboard.png').size);

  const adminAuth = await loginApi('admin@krushi.com', 'Admin@123');
  const { token: aToken, ...aUserData } = adminAuth;
  await page.evaluate((t, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  }, aToken, aUserData);

  await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'docs_screenshots/25_admin_dashboard.png' });
  console.log('Admin dashboard size:', fs.statSync('docs_screenshots/25_admin_dashboard.png').size);

  await browser.close();
}
test();
