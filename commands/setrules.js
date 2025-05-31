const { setGroupSetting } = require('../lib/groupDb');

module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❗ Command ini hanya untuk grup.' });
  }

  const metadata = await sock.groupMetadata(from);
  const isAdmin = metadata.participants.some(p => p.id === sender && p.admin);
  if (!isAdmin) {
    return sock.sendMessage(from, { text: '🚫 Hanya admin yang bisa mengatur rules.' });
  }

  const rawText = args.join(' ');
  if (!rawText) {
    return sock.sendMessage(from, {
      text: '❗ Gunakan: `.setrules <isi aturan grup>`'
    });
  }

  // Ubah baris baru jadi \n literal (biar aman di JSON)
  const rulesText = rawText.replace(/\n/g, '\\n');

  setGroupSetting(from, 'rules', rulesText);
  await sock.sendMessage(from, { text: '✅ Aturan grup berhasil disimpan!' });
};
