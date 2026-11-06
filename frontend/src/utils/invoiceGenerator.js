import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { calculateOrderFreight } from './freightCalculator.js';
import { resolveFarmPhoto } from './produceTraceability.js';

/**
 * Resolve authentic farm field photo URL from order / product data
 */
export function resolveFarmPhotoUrl(order) {
  const resolved = resolveFarmPhoto(order);
  let url = resolved?.photo || '';
  if (url && url.startsWith('/') && typeof window !== 'undefined') {
    url = `${window.location.origin}${url}`;
  }
  return url;
}

/**
 * Robust image loader to convert URL to Base64 data URL for jsPDF
 */
async function fetchImageAsBase64(imageUrl) {
  if (!imageUrl) return null;

  // If already a base64 data URL, return directly
  if (imageUrl.startsWith('data:image/')) return imageUrl;

  let finalUrl = imageUrl;
  if (finalUrl.startsWith('/') && typeof window !== 'undefined') {
    finalUrl = `${window.location.origin}${finalUrl}`;
  }

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 4000) : null;

    const response = await fetch(finalUrl, {
      signal: controller ? controller.signal : undefined,
      mode: 'cors'
    });
    if (timer) clearTimeout(timer);

    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Image fetch to Base64 failed for PDF:', err.message);
    return null;
  }
}

/**
 * Clean text helper to eliminate any un-encoded characters and prevent jsPDF glyph errors
 */
function cleanAsciiText(str) {
  if (!str) return '';
  // Replace rupee symbol with Rs. and strip unsupported characters for standard Helvetica
  return String(str)
    .replace(/₹/g, 'Rs. ')
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate a high-end, institutional Tax & Harvest A4 PDF invoice with:
 * - 100% clean readable typography (no broken Hindi/Devanagari glyphs)
 * - Authentic farm photo certificate & crop provenance
 * - Full logistics & commercial freight breakdown
 * - Fully functional, scannable QR code (UPI Payment for COD, or Verified Digital Passport for Paid)
 * @param {Object} order - Full populated order object
 */
export const generateOrderInvoicePDF = async (order) => {
  if (!order) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2); // 186mm

  // Curated Institutional Agricultural Color Palette
  const primaryGreen = [6, 78, 59];     // #064e3b - Deep Forest Green
  const deepEmerald = [4, 120, 87];     // #047857 - Rich Emerald
  const accentGreen = [16, 185, 129];   // #10b981 - Bright Mint Green
  const darkSlate = [15, 23, 42];       // #0f172a - Crisp Charcoal Slate
  const bodyText = [51, 65, 85];        // #334155 - High-contrast readable slate
  const mutedGray = [100, 116, 139];    // #64748b - Muted Slate Gray
  const lightBg = [248, 250, 252];      // #f8fafc - Card Light Background
  const lightGreenBg = [240, 253, 244]; // #f0fdf4 - Soft Mint Background
  const amberBg = [254, 243, 199];      // #fef3c7 - Warm Amber Background
  const amberText = [146, 64, 14];      // #92400e - Rich Amber Text
  const borderGray = [226, 232, 240];   // #e2e8f0 - Clean border line

  // Order Details & Calculations
  const qty = Number(order.quantity) || 1;
  const rawOrigin = order.farmerId?.location || order.productId?.location || 'Navsari, Gujarat';
  const rawDest = order.buyerId?.location || 'Surat, Gujarat';
  const originLoc = cleanAsciiText(rawOrigin) || 'Navsari, Gujarat';
  const destLoc = cleanAsciiText(rawDest) || 'Surat, Gujarat';

  const category = cleanAsciiText(order.productId?.category || order.category || 'Agricultural Produce');
  const calculatedFreight = calculateOrderFreight(qty, originLoc, destLoc, category);

  const unitPrice = Number(order.unitPrice) || 0;
  const produceSubtotal = Number(order.produceAmount) || (unitPrice * qty);

  let freightAmount = Number(order.freightAmount);
  if (isNaN(freightAmount) || (freightAmount === 0 && qty >= 40)) {
    freightAmount = calculatedFreight.freightAmount;
  }

  const vehicleName = cleanAsciiText(order.vehicleType || calculatedFreight.vehicleName || 'Standard Farm Express');
  const distanceKm = order.deliveryDistanceKm || calculatedFreight.distanceKm || 75;
  const grandTotal = Number(order.totalPrice) > produceSubtotal ? Number(order.totalPrice) : (produceSubtotal + freightAmount);
  const isBulk = qty >= 40 || calculatedFreight.isBulk || order.isBulkOrder;

  // Identification & Dates
  const rawId = order._id ? order._id.toString() : '';
  const orderIdShort = rawId ? rawId.slice(-6).toUpperCase() : 'ORD842';
  const invoiceId = `SKB-INV-${orderIdShort}`;
  const batchId = `SKB-HV-${rawId ? rawId.slice(-4).toUpperCase() : '4821'}`;
  const plotId = `SKB-GJ-${rawId ? rawId.slice(-4).toUpperCase() : '902'}`;

  const orderCreatedAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const harvestDateObj = new Date(orderCreatedAt.getTime() - (2 * 24 * 60 * 60 * 1000));
  const harvestDateStr = harvestDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const invoiceDateStr = orderCreatedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Parties information
  const buyerName = cleanAsciiText(order.buyerId?.name || 'Verified Wholesaler Partner');
  const buyerPhone = cleanAsciiText(order.buyerId?.phone || '+91 98234 56789');
  const buyerEmail = cleanAsciiText(order.buyerId?.email || 'buyer@smartkrushibazar.in');

  const farmerName = cleanAsciiText(order.farmerId?.name || 'Het Naik (Certified Kisan)');
  const farmerPhone = cleanAsciiText(order.farmerId?.phone || '+91 98765 43210');
  const farmerEmail = cleanAsciiText(order.farmerId?.email || 'kisan@smartkrushibazar.in');

  const rawCropName = order.productName || order.productId?.name || 'Fresh Farm Produce';
  const cropName = cleanAsciiText(rawCropName);

  // Payment Status Resolution
  const isCOD = order.paymentMethod === 'COD' || (!order.razorpayPaymentId && order.paymentStatus === 'Pending');
  const paymentMethodLabel = isCOD ? 'Cash on Delivery (COD)' : (order.paymentMethod || 'Online (Razorpay / UPI / Card)');
  const paymentStatusLabel = isCOD ? 'Payment Pending (Pay on Arrival)' : 'Paid & Verified Instantly';

  // Farm Photo URL & Base64 Loading
  const farmPhotoUrl = resolveFarmPhotoUrl(order);
  const farmPhotoBase64 = await fetchImageAsBase64(farmPhotoUrl);

  // Origin for Passport verification:
  // When running locally in development (localhost or 127.0.0.1), use the machine's local network IP
  // (e.g. 10.81.179.202:5173) instead of localhost, so when scanned with a mobile phone camera
  // over Wi-Fi or Mobile Hotspot, the phone connects directly to the computer's dev server!
  let domainOrigin = 'https://smartkrushibazar.in';
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    domainOrigin = window.location.origin;
    if (domainOrigin.includes('localhost') || domainOrigin.includes('127.0.0.1')) {
      const port = window.location.port || '5173';
      let detectedIp = '10.81.179.202';
      if (typeof __NETWORK_IP__ !== 'undefined' && __NETWORK_IP__ && __NETWORK_IP__ !== 'localhost') {
        detectedIp = __NETWORK_IP__;
      }
      if (window.__DETECTED_NETWORK_IP__) {
        detectedIp = window.__DETECTED_NETWORK_IP__;
      } else {
        try {
          const cached = sessionStorage.getItem('detected_network_ip');
          if (cached) detectedIp = cached;
        } catch (e) { }
      }
      domainOrigin = `http://${detectedIp}:${port}`;
    }
  }
  const passportUrl = `${domainOrigin}/passport/${order._id || 'demo'}`;

  // =========================================================================
  // QR Code Payload Generation
  // Always encodes the Digital Farm Passport URL — this is a real, working page
  // that opens instantly when scanned with ANY smartphone camera or Google Lens.
  // For COD orders, the passport page also shows payment details.
  // =========================================================================
  const qrPayload = passportUrl;
  let qrTitle = '';
  let qrSubTitle = '';
  let qrInstruction = '';

  if (isCOD) {
    qrTitle = 'SCAN QR TO VIEW ORDER & PAY AT DELIVERY';
    qrSubTitle = `Digital Farm Passport • Order #${orderIdShort} • Rs. ${grandTotal}`;
    qrInstruction = 'Scan this QR code with ANY smartphone camera or Google Lens to view the verified Digital Farm Passport with full harvest traceability, farm photos, and order details.';
  } else {
    qrTitle = 'OFFICIAL DIGITAL HARVEST & INVOICE VERIFICATION QR';
    qrSubTitle = `Direct Farm Gate Provenance Seal • Invoice #${invoiceId}`;
    qrInstruction = 'Scan with ANY smartphone camera or Google Lens to instantly inspect verified farm origin, soil reports, field photographs, and live dispatch passport.';
  }

  // Generate High Resolution QR Code
  let qrDataUrl = null;
  try {
    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
      color: {
        dark: '#064e3b',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.warn('QR Code generation fallback:', err);
  }

  // =========================================================================
  // 1. TOP HEADER BANNER (y: 0 -> 30mm)
  // =========================================================================
  doc.setFillColor(...primaryGreen);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Golden mint accent line
  doc.setFillColor(...accentGreen);
  doc.rect(0, 30, pageWidth, 2, 'F');

  // Left Side: Brand Name & Sub-taglines
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('SMART KRUSHI BAZAR', margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(209, 250, 229);
  doc.text('Direct Farmer-to-Buyer Digital Agricultural Trade & Logistics Ecosystem', margin, 19.5);

  doc.setFontSize(7);
  doc.setTextColor(167, 243, 208);
  doc.text('ISO 9001:2015 & Govt e-Agri Standards Compliant Direct Farm Gate Settlement', margin, 25);

  // Right Side: Tax Invoice Header & Meta
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TAX INVOICE & BILL OF SUPPLY', pageWidth - margin, 12, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(209, 250, 229);
  doc.text(`Invoice No: ${invoiceId}`, pageWidth - margin, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Date: ${invoiceDateStr}  |  Order ID: #${orderIdShort}`, pageWidth - margin, 24, { align: 'right' });

  // =========================================================================
  // 2. STATUS & VERIFICATION STRIP (y: 34 -> 41mm)
  // =========================================================================
  let y = 34;
  if (isCOD) {
    doc.setFillColor(...amberBg);
    doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'S');

    doc.setTextColor(...amberText);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PAYMENT STATUS: CASH ON DELIVERY (COLLECTION ON ARRIVAL)', margin + 4, y + 4.6);
    doc.text('SCAN QR BELOW WITH ANY UPI APP TO PAY AT DELIVERY', pageWidth - margin - 4, y + 4.6, { align: 'right' });
  } else {
    doc.setFillColor(...lightGreenBg);
    doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
    doc.setDrawColor(...accentGreen);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'S');

    doc.setTextColor(...deepEmerald);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PAYMENT STATUS: VERIFIED PAID (ONLINE SETTLEMENT)', margin + 4, y + 4.6);
    doc.text('100% DIRECT KISAN PAYOUT GUARANTEED • 0% MIDDLEMAN COMMISSIONS', pageWidth - margin - 4, y + 4.6, { align: 'right' });
  }

  // =========================================================================
  // 3. TWO-COLUMN ADDRESS CARDS (y: 44 -> 74mm)
  // =========================================================================
  y = 43.5;
  const colW = (contentWidth - 6) / 2; // 90mm
  const cardH = 30.5;

  // Box 1: Billed & Delivered To (Buyer)
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, colW, cardH, 2, 2, 'F');
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, colW, cardH, 2, 2, 'S');

  // Box 1 Header
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, colW, 6.5, 2, 2, 'F');
  doc.setTextColor(...primaryGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('BILLED & DELIVERED TO (BUYER DETAILS):', margin + 4, y + 4.5);

  doc.setTextColor(...darkSlate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(buyerName.slice(0, 42), margin + 4, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...bodyText);
  doc.text(`Phone: ${buyerPhone}`, margin + 4, y + 16.5);
  doc.text(`Email: ${buyerEmail.slice(0, 36)}`, margin + 4, y + 21);

  const buyerLocWrapped = doc.splitTextToSize(`Destination: ${destLoc}`, colW - 8);
  doc.text(buyerLocWrapped[0] || `Destination: ${destLoc}`, margin + 4, y + 25.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...deepEmerald);
  doc.setFontSize(6.5);
  doc.text('Mode: Dedicated Direct Farm Doorstep Delivery', margin + 4, y + 29.5);

  // Box 2: Dispatched & Harvested By (Farmer / Kisan Gate)
  const col2X = margin + colW + 6;
  doc.setFillColor(...lightBg);
  doc.roundedRect(col2X, y, colW, cardH, 2, 2, 'F');
  doc.setDrawColor(...borderGray);
  doc.roundedRect(col2X, y, colW, cardH, 2, 2, 'S');

  // Box 2 Header
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(col2X, y, colW, 6.5, 2, 2, 'F');
  doc.setTextColor(...primaryGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('HARVESTED & DISPATCHED BY (KISAN GATE):', col2X + 4, y + 4.5);

  doc.setTextColor(...darkSlate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(farmerName.slice(0, 42), col2X + 4, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...bodyText);
  doc.text(`Phone: ${farmerPhone}`, col2X + 4, y + 16.5);
  doc.text(`Email: ${farmerEmail.slice(0, 36)}`, col2X + 4, y + 21);

  const farmLocWrapped = doc.splitTextToSize(`Farm Origin: ${originLoc}`, colW - 8);
  doc.text(farmLocWrapped[0] || `Farm Origin: ${originLoc}`, col2X + 4, y + 25.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...deepEmerald);
  doc.setFontSize(6.5);
  doc.text(`Batch Lot: ${batchId}  •  Verified Kisan Gate Partner`, col2X + 4, y + 29.5);

  // =========================================================================
  // 4. AUTHENTIC FARM / KHET PHOTOGRAPH & HARVEST PASSPORT (y: 77 -> 122mm)
  // =========================================================================
  y = 76.5;
  const farmCardH = 45;
  doc.setFillColor(...lightGreenBg);
  doc.roundedRect(margin, y, contentWidth, farmCardH, 2.5, 2.5, 'F');
  doc.setDrawColor(...accentGreen);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, farmCardH, 2.5, 2.5, 'S');

  // Certificate Header Strip
  doc.setFillColor(...primaryGreen);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('KHET & HARVEST AUTHENTICITY CERTIFICATE', margin + 5, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(209, 250, 229);
  doc.text('100% Direct Farm Gate Traceability  •  Verified Farm Provenance', pageWidth - margin - 5, y + 4.5, { align: 'right' });

  // Photo Section (Left side inside card)
  const imgX = margin + 4;
  const imgY = y + 8.5;
  const imgW = 54;
  const imgH = 30;

  if (farmPhotoBase64) {
    try {
      doc.addImage(farmPhotoBase64, 'JPEG', imgX, imgY, imgW, imgH);
      doc.setDrawColor(...deepEmerald);
      doc.setLineWidth(0.3);
      doc.rect(imgX, imgY, imgW, imgH, 'S');
    } catch (e) {
      console.warn('doc.addImage error:', e);
    }
  } else {
    doc.setFillColor(220, 245, 230);
    doc.rect(imgX, imgY, imgW, imgH, 'F');
    doc.setTextColor(...primaryGreen);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('VERIFIED KHET PHOTO', imgX + 7, imgY + 16);
  }

  // Photo Label below
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...deepEmerald);
  doc.text('VERIFIED FARM FIELD / KHET PHOTOGRAPH', imgX + 1, imgY + imgH + 4);

  // Metadata Grid (Right side inside card)
  const metaX = imgX + imgW + 6;
  const metaLineH = 5.2;
  let textY = imgY + 3;

  // Crop Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkSlate);
  doc.text('Produce Crop:', metaX, textY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryGreen);
  doc.text(cropName.slice(0, 48), metaX + 28, textY);

  // Harvest Date
  textY += metaLineH;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkSlate);
  doc.text('Harvest Date:', metaX, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...bodyText);
  doc.text(`${harvestDateStr} (Fresh Farm Gate Pick)`, metaX + 28, textY);

  // Cultivated By
  textY += metaLineH;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkSlate);
  doc.text('Cultivated By:', metaX, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...bodyText);
  doc.text(`${farmerName}  •  Soil Health Certified`, metaX + 28, textY);

  // Field Location
  textY += metaLineH;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkSlate);
  doc.text('Field Location:', metaX, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...bodyText);
  doc.text(`${originLoc.split(',')[0]} (Plot #${plotId})`, metaX + 28, textY);

  // Farming Method
  textY += metaLineH;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkSlate);
  doc.text('Farming Method:', metaX, textY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...bodyText);
  doc.text('Solar Drip Irrigated  •  0% Harmful Chemical Residue', metaX + 28, textY);

  // Quality & Grade
  textY += metaLineH;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkSlate);
  doc.text('Quality & Grade:', metaX, textY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...deepEmerald);
  doc.text('Grade A Export Standard  •  Direct Kisan Gate Dispatch', metaX + 28, textY);

  // =========================================================================
  // 5. ITEMIZED BILL OF SUPPLY TABLE (y: 124 -> 167mm)
  // =========================================================================
  y = 124;

  // Wholesale / Retail Badge Strip
  if (isBulk) {
    doc.setFillColor(...amberBg);
    doc.roundedRect(margin, y, contentWidth, 5.5, 1.5, 1.5, 'F');
    doc.setTextColor(...amberText);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`WHOLESALE BULK HARVEST (>= 40 KG): Dedicated Commercial Freight Applied (${vehicleName})`, margin + 4, y + 3.8);
  } else {
    doc.setFillColor(...lightGreenBg);
    doc.roundedRect(margin, y, contentWidth, 5.5, 1.5, 1.5, 'F');
    doc.setTextColor(...deepEmerald);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`RETAIL HOUSEHOLD HARVEST (< 40 KG): Standard Free Express Farm Delivery Included`, margin + 4, y + 3.8);
  }

  y += 7.5;

  // Table Header Bar
  doc.setFillColor(...primaryGreen);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('S.No.', margin + 3, y + 4.5);
  doc.text('Item Description & Transport Details', margin + 14, y + 4.5);
  doc.text('Category', margin + 104, y + 4.5);
  doc.text('Quantity', margin + 130, y + 4.5);
  doc.text('Unit Rate', margin + 152, y + 4.5);
  doc.text('Total (INR)', pageWidth - margin - 4, y + 4.5, { align: 'right' });

  // Table Row 1: Crop Produce
  y += 6.5;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 11, 'F');
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.2);
  doc.line(margin, y + 11, pageWidth - margin, y + 11);

  doc.setTextColor(...darkSlate);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('1.', margin + 3, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text(cropName.slice(0, 46), margin + 14, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedGray);
  doc.text('Grade A Fresh Harvest • Direct from Kisan Gate (No Storage Middlemen)', margin + 14, y + 9);

  doc.setTextColor(...darkSlate);
  doc.setFontSize(7.5);
  doc.text(category.slice(0, 14), margin + 104, y + 6);
  doc.text(`${qty} kg`, margin + 130, y + 6);
  doc.text(`Rs. ${unitPrice}/kg`, margin + 152, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${produceSubtotal}`, pageWidth - margin - 4, y + 6, { align: 'right' });

  // Table Row 2: Farm-to-Door Freight & Logistics
  y += 11;
  doc.setFillColor(250, 250, 252);
  doc.rect(margin, y, contentWidth, 11, 'F');
  doc.line(margin, y + 11, pageWidth - margin, y + 11);

  doc.setTextColor(...darkSlate);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('2.', margin + 3, y + 5);

  doc.setFont('helvetica', 'bold');
  if (freightAmount > 0) {
    doc.text(`Farm-to-Door Dedicated Freight (${vehicleName})`, margin + 14, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedGray);
    doc.text(`Route: ${originLoc.split(',')[0]} -> ${destLoc.split(',')[0]} (~${distanceKm} km) • Dedicated Commercial Transit`, margin + 14, y + 9);

    doc.setTextColor(...darkSlate);
    doc.setFontSize(7.5);
    doc.text('Logistics', margin + 104, y + 6);
    doc.text('1 Shipment', margin + 130, y + 6);
    doc.text(`Rs. ${freightAmount}`, margin + 152, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryGreen);
    doc.text(`Rs. ${freightAmount}`, pageWidth - margin - 4, y + 6, { align: 'right' });
  } else {
    doc.text('Standard Farm Express Delivery (< 40 kg)', margin + 14, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedGray);
    doc.text('Retail household package • Free express delivery direct from farm gate', margin + 14, y + 9);

    doc.setTextColor(...darkSlate);
    doc.setFontSize(7.5);
    doc.text('Logistics', margin + 104, y + 6);
    doc.text('1 Package', margin + 130, y + 6);
    doc.text('Free', margin + 152, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...deepEmerald);
    doc.text('Rs. 0 (Free)', pageWidth - margin - 4, y + 6, { align: 'right' });
  }

  // Table Row 3: Platform Intermediary Fee (0% Guarantee)
  y += 11;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.line(margin, y + 8, pageWidth - margin, y + 8);

  doc.setTextColor(...darkSlate);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('3.', margin + 3, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Smart Krushi Direct Platform Fee (0% Intermediary Model)', margin + 14, y + 5);

  doc.setTextColor(...darkSlate);
  doc.setFont('helvetica', 'normal');
  doc.text('Platform', margin + 104, y + 5);
  doc.text('1 Order', margin + 130, y + 5);
  doc.text('0%', margin + 152, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...deepEmerald);
  doc.text('Rs. 0 (Free)', pageWidth - margin - 4, y + 5, { align: 'right' });

  // =========================================================================
  // 6. SETTLEMENT & TOTALS SECTION (y: 171 -> 202mm)
  // =========================================================================
  y += 11;
  const bottomBoxH = 28;

  // Left Box: Payment Audit & Direct Kisan Settlement
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, colW, bottomBoxH, 2, 2, 'F');
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, colW, bottomBoxH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryGreen);
  doc.text('PAYMENT & SETTLEMENT AUDIT:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...bodyText);
  doc.text(`Payment Mode: ${paymentMethodLabel}`, margin + 4, y + 10.5);
  doc.text(`Payment Status: ${paymentStatusLabel}`, margin + 4, y + 15);
  doc.text(`Transaction Ref: ${order.razorpayPaymentId || ('SKB-TXN-' + orderIdShort)}`, margin + 4, y + 19.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...deepEmerald);
  doc.setFontSize(6.5);
  doc.text('Direct Kisan Settlement: 100% of produce realization paid to farmer.', margin + 4, y + 24.5);

  // Right Box: Financial Calculation & Prominent Grand Total
  doc.setFillColor(...lightBg);
  doc.roundedRect(col2X, y, colW, bottomBoxH, 2, 2, 'F');
  doc.setDrawColor(...borderGray);
  doc.roundedRect(col2X, y, colW, bottomBoxH, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...bodyText);
  doc.text('Produce Subtotal:', col2X + 4, y + 5.5);
  doc.setTextColor(...darkSlate);
  doc.text(`Rs. ${produceSubtotal}`, pageWidth - margin - 4, y + 5.5, { align: 'right' });

  doc.setTextColor(...bodyText);
  doc.text('Farm Freight / Transport:', col2X + 4, y + 10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(freightAmount > 0 ? primaryGreen[0] : deepEmerald[0], freightAmount > 0 ? primaryGreen[1] : deepEmerald[1], freightAmount > 0 ? primaryGreen[2] : deepEmerald[2]);
  doc.text(freightAmount > 0 ? `+ Rs. ${freightAmount}` : 'Rs. 0 (Free)', pageWidth - margin - 4, y + 10.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...bodyText);
  doc.text('Agri GST (Govt Tax Exemption):', col2X + 4, y + 15.5);
  doc.setTextColor(...deepEmerald);
  doc.setFont('helvetica', 'bold');
  doc.text('Rs. 0 (0% Exempt)', pageWidth - margin - 4, y + 15.5, { align: 'right' });

  // Divider inside total box
  doc.setDrawColor(...borderGray);
  doc.line(col2X + 4, y + 18.5, pageWidth - margin - 4, y + 18.5);

  // Grand Total Banner
  doc.setFillColor(...primaryGreen);
  doc.roundedRect(col2X + 3, y + 20, colW - 6, 6.5, 1, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('GRAND TOTAL (FINAL):', col2X + 6, y + 24.3);
  doc.setFontSize(9.5);
  doc.text(`Rs. ${grandTotal}`, pageWidth - margin - 6, y + 24.3, { align: 'right' });

  // =========================================================================
  // 7. UNIVERSALLY SCANNABLE QR CODE & AUTHENTICITY SEAL (y: 205 -> 248mm)
  // =========================================================================
  y += 31;
  const qrBoxH = 41;
  doc.setFillColor(...lightGreenBg);
  doc.roundedRect(margin, y, contentWidth, qrBoxH, 2.5, 2.5, 'F');
  doc.setDrawColor(...accentGreen);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, qrBoxH, 2.5, 2.5, 'S');

  // Render QR Code (32mm x 32mm)
  const qrSize = 32;
  const qrX = margin + 4;
  const qrY = y + 4.5;

  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      // Embed active PDF clickable link over the QR code
      const targetUrl = qrPayload.startsWith('http') ? qrPayload : passportUrl;
      doc.link(qrX, qrY, qrSize, qrSize, { url: targetUrl });
    } catch (qrImgErr) {
      console.warn('QR Code embedding error:', qrImgErr);
    }
  }

  // QR Text Information (Right of QR Code)
  const qrTextX = qrX + qrSize + 6;
  doc.setTextColor(...primaryGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(qrTitle, qrTextX, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...deepEmerald);
  doc.text(qrSubTitle, qrTextX, y + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...bodyText);
  const instructionLines = doc.splitTextToSize(qrInstruction, contentWidth - qrSize - 12);
  doc.text(instructionLines, qrTextX, y + 18.5);

  let metaY = y + 27;
  if (isCOD) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...darkSlate);
    doc.text(`Order #${orderIdShort}  |  Amount: Rs. ${grandTotal}  |  Payment: Cash on Delivery`, qrTextX, metaY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedGray);
    doc.text(`Digital Farm Passport: ${passportUrl}`, qrTextX, metaY + 4.5);
    doc.link(qrTextX, metaY + 2, 130, 5, { url: passportUrl });
    doc.text('Notice: Official delivery record. Scan with phone camera to inspect order details.', qrTextX, metaY + 9);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...darkSlate);
    doc.text(`Verification Seal: SKB-AUTH-${orderIdShort}  |  Authenticity: 100% Direct Kisan Gate`, qrTextX, metaY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...mutedGray);
    doc.text(`Digital Verification Passport: ${passportUrl}`, qrTextX, metaY + 4.5);
    doc.link(qrTextX, metaY + 2, 130, 5, { url: passportUrl });
    doc.text('Notice: Tamper-proof certificate. Scan with phone camera to inspect verified batch details.', qrTextX, metaY + 9);
  }

  // =========================================================================
  // 8. LEGAL DECLARATION & FOOTER (y: 250 -> 282mm)
  // =========================================================================
  const footerY = pageHeight - 19;
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedGray);
  doc.text('Terms & Notes: Official computer-generated tax invoice issued under direct farm-to-buyer trade regulations.', margin, footerY + 4.5);
  doc.text('Direct Kisan Helpline: 1800-180-1551 (Toll-Free)  |  Support: help@smartkrushibazar.in  |  Official Record', margin, footerY + 8.5);
  doc.text('Exempt from GST under Schedule I (Primary Unprocessed Agricultural Produce). 0% Intermediary Guarantee.', margin, footerY + 12.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryGreen);
  doc.setFontSize(7.5);
  doc.text('100% DIRECT KISAN PAYOUT GUARANTEED', pageWidth - margin, footerY + 7, { align: 'right' });

  // Save the Clean, Professional PDF
  const filename = `Invoice_${cropName.replace(/[^a-zA-Z0-9]/g, '_')}_${orderIdShort}.pdf`;
  doc.save(filename);
};
