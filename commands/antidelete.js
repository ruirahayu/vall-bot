const { ensureGroup, setGroupSetting } = require('../lib/groupDb');

module.exports = async (sock, m, args, sender, from, saveBotMessage) => {
  try {
    if (!from.endsWith('@g.us')) {
      return sock.sendMessage(from, { text: '❌ Command ini hanya bisa dipakai di grup.' });
    }

    const metadata = await sock.groupMetadata(from);
    const groupAdmins = metadata.participants
      .filter(p => p.admin)
      .map(p => p.id || p.jid);

    const isAdmin = groupAdmins.includes(sender);
    if (!isAdmin) {
      return sock.sendMessage(from, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini.' });
    }

    const setting = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(setting)) {
      return sock.sendMessage(from, {
        text: '❌ Format salah!\n\nGunakan:\n.antidelete on\n.antidelete off'
      });
    }

    ensureGroup(from);
    setGroupSetting(from, 'antidelete', setting === 'on');

    await sock.sendMessage(from, {
      text: `✅ Fitur anti-delete berhasil di *${setting === 'on' ? 'AKTIFKAN' : 'NONAKTIFKAN'}*.`
    });
  } catch (err) {
    console.error('❌ Error di command .antidelete:', err);
    await sock.sendMessage(from, { text: '⚠️ Terjadi kesalahan saat menjalankan perintah.' });
  }
};
