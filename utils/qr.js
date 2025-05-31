const qrcode = require('qrcode-terminal');

module.exports = async (qr) => {
  console.log("📱 Scan QR Code ini:");
  qrcode.generate(qr, { small: true }); // Menggunakan opsi small untuk menghasilkan QR lebih kecil
};
