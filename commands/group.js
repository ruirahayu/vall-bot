module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us'))
    return sock.sendMessage(from, { text: '❗ Command ini hanya untuk grup.' });

  const metadata = await sock.groupMetadata(from);
  const isAdmin = metadata.participants.some(p => p.id === sender && p.admin);
  const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const botAdmin = metadata.participants.some(p => p.id === botNumber && p.admin);

  if (!isAdmin) return sock.sendMessage(from, { text: '🚫 Hanya admin yang bisa mengubah setting grup.' });
  if (!botAdmin) return sock.sendMessage(from, { text: '⚠️ Bot harus jadi admin untuk ubah setting grup.' });

  const subcmd = args[0];
  if (subcmd === 'open') {
    await sock.groupSettingUpdate(from, 'not_announcement');
    await sock.sendMessage(from, { text: '✅ Grup dibuka untuk semua member.' });
  } else if (subcmd === 'close') {
    await sock.groupSettingUpdate(from, 'announcement');
    await sock.sendMessage(from, { text: '✅ Grup ditutup. Hanya admin yang bisa kirim pesan.' });
  } else {
    await sock.sendMessage(from, {
      text: '❗ Gunakan: `.group open` atau `.group close`'
    });
  }
};
