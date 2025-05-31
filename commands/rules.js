const { loadDb } = require('../lib/groupDb');

module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❗ Command ini hanya untuk grup.' });
  }

  const db = loadDb();
  const groupData = db[from];
  const rules = groupData?.rules;

  if (!rules) {
    return sock.sendMessage(from, { text: 'ℹ️ Belum ada aturan yang diset. Gunakan `.setrules` untuk mengatur.' });
  }

  await sock.sendMessage(from, {
    text: rules.replace(/\\n/g, '\n')
  });
};
