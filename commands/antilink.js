const { setGroupSetting } = require('../lib/groupDb');

module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❗ Command ini hanya untuk grup.' });

  const metadata = await sock.groupMetadata(from);
  const isAdmin = metadata.participants.some(p => p.id === sender && p.admin);

  if (!isAdmin) return sock.sendMessage(from, { text: '🚫 Hanya admin yang bisa ubah pengaturan ini.' });

  const opt = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(opt)) {
    return sock.sendMessage(from, { text: '❗ Penggunaan: `.antilink on` atau `.antilink off`' });
  }

  const status = opt === 'on';
  setGroupSetting(from, 'antilink', status);
  await sock.sendMessage(from, { text: `🔗 Fitur antilink telah *${opt.toUpperCase()}* di grup ini.` });
};
