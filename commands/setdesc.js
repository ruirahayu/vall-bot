module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us'))
    return sock.sendMessage(from, { text: '❗ Command ini hanya untuk grup.' });

  const metadata = await sock.groupMetadata(from);
  const isAdmin = metadata.participants.some(p => p.id === sender && p.admin);
  const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const botAdmin = metadata.participants.some(p => p.id === botNumber && p.admin);

  if (!isAdmin) return sock.sendMessage(from, { text: '🚫 Hanya admin yang bisa ubah nama grup.' });
  if (!botAdmin) return sock.sendMessage(from, { text: '⚠️ Bot harus jadi admin untuk ubah nama grup.' });

  const name = args.join(' ');
  if (!name) return sock.sendMessage(from, { text: '❗ Gunakan: `.setname <nama grup>`' });

  await sock.groupUpdateSubject(from, name);
  await sock.sendMessage(from, { text: '✅ Nama grup berhasil diubah!' });
};
