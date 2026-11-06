const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, '..', 'docs_screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function loginApi(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.message || 'Login failed'));
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function capture() {
  console.log('Starting full screenshot capture process...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  const snap = async (name, delay = 1800) => {
    await new Promise(r => setTimeout(r, delay));
    const targetPath = path.join(OUTPUT_DIR, name + '.png');
    await page.screenshot({ path: targetPath, fullPage: false });
    console.log('Saved: ' + name + '.png (' + fs.statSync(targetPath).size + ' bytes)');
  };

  const setAuth = async (authData) => {
    const { token, ...userData } = authData;
    await page.evaluate((t, u) => {
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
      sessionStorage.setItem('krushi_visited', 'true');
    }, token, userData);
  };

  const clearAuth = async () => {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.setItem('krushi_visited', 'true');
    });
  };

  try {
    // 1. PUBLIC PAGES
    console.log('\n--- 1. Capturing Public Pages ---');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await clearAuth();
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await snap('01_home_hero', 1800);

    await page.evaluate(() => window.scrollBy(0, 750));
    await snap('02_home_features', 1200);

    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
    await snap('03_marketplace_products', 1800);

    await page.goto('http://localhost:5173/mandi', { waitUntil: 'networkidle2' });
    await snap('04_mandi_live_rates', 1800);

    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await snap('05_login_page', 1200);

    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
    await snap('06_register_page', 1200);

    // 2. SMART TOOLS
    console.log('\n--- 2. Capturing Smart Tools ---');
    await page.goto('http://localhost:5173/disease', { waitUntil: 'networkidle2' });
    await snap('07_ai_crop_doctor', 1800);

    await page.goto('http://localhost:5173/crop-advisor', { waitUntil: 'networkidle2' });
    await snap('08_crop_advisor', 1500);

    await page.goto('http://localhost:5173/fertilizer-calc', { waitUntil: 'networkidle2' });
    await snap('09_fertilizer_calc', 1500);

    await page.goto('http://localhost:5173/schemes', { waitUntil: 'networkidle2' });
    await snap('10_govt_schemes', 1800);

    await page.goto('http://localhost:5173/freight-calc', { waitUntil: 'networkidle2' });
    await snap('11_freight_calc', 1500);

    await page.goto('http://localhost:5173/passport', { waitUntil: 'networkidle2' });
    await snap('12_digital_crop_passport', 1800);

    // 3. FARMER PORTAL
    console.log('\n--- 3. Capturing Farmer Portal ---');
    const farmerAuth = await loginApi('hetnaik178@gmail.com', 'het@171925');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await setAuth(farmerAuth);

    await page.goto('http://localhost:5173/farmer/dashboard', { waitUntil: 'networkidle2' });
    await snap('13_farmer_dashboard', 2200);

    await page.goto('http://localhost:5173/farmer/my-products', { waitUntil: 'networkidle2' });
    await snap('14_farmer_my_products', 2000);

    await page.goto('http://localhost:5173/farmer/add-product', { waitUntil: 'networkidle2' });
    await snap('15_farmer_add_product', 1800);

    await page.goto('http://localhost:5173/farmer/orders', { waitUntil: 'networkidle2' });
    await snap('16_farmer_orders', 2000);

    await page.goto('http://localhost:5173/farmer/analytics', { waitUntil: 'networkidle2' });
    await snap('17_farmer_analytics', 2000);

    // 4. BUYER PORTAL
    console.log('\n--- 4. Capturing Buyer Portal ---');
    const buyerAuth = await loginApi('naikmeet2535@gmail.com', 'naikmeet2535');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await setAuth(buyerAuth);

    await page.goto('http://localhost:5173/buyer/dashboard', { waitUntil: 'networkidle2' });
    await snap('18_buyer_dashboard', 2200);

    await page.goto('http://localhost:5173/buyer/bulk-demand', { waitUntil: 'networkidle2' });
    await snap('19_buyer_bulk_demand', 2000);

    await page.goto('http://localhost:5173/buyer/orders', { waitUntil: 'networkidle2' });
    await snap('20_buyer_orders', 2000);

    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });
    await snap('21_buyer_cart', 1800);

    // 5. EXPERT PORTAL
    console.log('\n--- 5. Capturing Expert Portal ---');
    const expertAuth = await loginApi('jeet@gmail.com', 'jeet123');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await setAuth(expertAuth);

    await page.goto('http://localhost:5173/experts', { waitUntil: 'networkidle2' });
    await snap('22_expert_directory', 2000);

    await page.goto('http://localhost:5173/expert/dashboard', { waitUntil: 'networkidle2' });
    await snap('23_expert_dashboard', 2200);

    await page.goto('http://localhost:5173/expert/consultations', { waitUntil: 'networkidle2' });
    await snap('24_expert_consultations', 2000);

    // 6. ADMIN PORTAL
    console.log('\n--- 6. Capturing Admin Portal ---');
    const adminAuth = await loginApi('admin@krushi.com', 'Admin@123');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await setAuth(adminAuth);

    await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle2' });
    await snap('25_admin_dashboard', 2200);

    await page.goto('http://localhost:5173/admin/disputes', { waitUntil: 'networkidle2' });
    await snap('26_admin_disputes', 2000);

    // 7. RESPONSIVE MOBILE & TABLET VIEWS
    console.log('\n--- 7. Capturing Responsive Views ---');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/farmer/dashboard', { waitUntil: 'networkidle2' });
    await snap('27_mobile_farmer_dashboard', 2000);

    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
    await snap('28_mobile_marketplace', 2000);

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await snap('29_mobile_home', 2000);

    await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
    await snap('30_tablet_marketplace', 2000);

    console.log('\nALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('Fatal error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
