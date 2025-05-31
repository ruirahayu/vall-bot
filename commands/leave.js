module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us'))
    return sock.sendMessage(from, { text: '❗ Command ini hanya untuk grup.' });

  const metadata = await sock.groupMetadata(from);
  const isAdmin = metadata.participants.some(p => p.id === sock.user.id && p.admin);
  if (!isAdmin) return sock.sendMessage(from, { text: '⚠️ Bot harus admin untuk keluar grup.' });

  await sock.sendMessage(from, { text: '👋 Bot keluar dari grup ini.' });
  await sock.groupLeave(from);
};
