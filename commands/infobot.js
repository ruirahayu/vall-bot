const os = require('os');

module.exports = async (sock, m, args, sender, from) => {
  const uptime = process.uptime();
  const ramUsage = process.memoryUsage();
  const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
  const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
  const usedMem = (totalMem - freeMem).toFixed(2);

  // Kalau kamu punya fungsi buat cek jumlah grup, misal dari state atau db
  // Misal:
  // const groupCount = getActiveGroupCount();

  const infoText = `🤖 *Info Bot*\n
⏳ Uptime: ${Math.floor(uptime / 60)} menit ${Math.floor(uptime % 60)} detik
💾 RAM digunakan: ${usedMem} MB / ${totalMem} MB
📂 Grup aktif: (kamu bisa isi sesuai data grup aktif kamu)
`;

  await sock.sendMessage(from, { text: infoText });
};
