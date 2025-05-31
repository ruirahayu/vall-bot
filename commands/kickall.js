module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us'))
    return sock.sendMessage(from, { text: '❗ Command ini hanya untuk grup.' });

  const metadata = await sock.groupMetadata(from);
  const participants = metadata.participants;
  const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
  const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

  const isAdmin = groupAdmins.includes(sender);
  const isBotAdmin = groupAdmins.includes(botNumber);

  if (!isAdmin)
    return sock.sendMessage(from, { text: '🚫 Hanya admin yang bisa menggunakan perintah ini.' });

  if (!isBotAdmin)
    return sock.sendMessage(from, { text: '⚠️ Bot harus admin untuk dapat mengeluarkan member.' });

  const toKick = participants
    .map(p => p.id)
    .filter(id => !groupAdmins.includes(id) && id !== botNumber); // hindari kick admin & bot

  if (toKick.length === 0)
    return sock.sendMessage(from, { text: '✅ Tidak ada member non-admin yang bisa dikick.' });

  for (const jid of toKick) {
    try {
      await sock.groupParticipantsUpdate(from, [jid], 'remove');
      await new Promise(resolve => setTimeout(resolve, 1500)); // delay antar kick biar aman
    } catch (err) {
      console.error(`❌ Gagal kick ${jid}:`, err);
    }
  }

  await sock.sendMessage(from, { text: `✅ Berhasil kick ${toKick.length} member.` });
};
