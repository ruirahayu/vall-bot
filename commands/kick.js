module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❗Fitur ini hanya untuk grup.' });
  }

  const metadata = await sock.groupMetadata(from);
  const groupAdmins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id);

  // Cek apakah pengirim adalah admin
  if (!groupAdmins.includes(sender)) {
    return sock.sendMessage(from, { text: '❌ Hanya admin yang bisa menggunakan perintah ini.' });
  }

  const mentions = m.message.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentions || mentions.length === 0) {
    return sock.sendMessage(from, { text: '⚠️ Tag user yang ingin di-kick.\nContoh: .kick @user' });
  }

  for (const user of mentions) {
    if (!groupAdmins.includes(user)) {
      await sock.groupParticipantsUpdate(from, [user], 'remove');
    } else {
      await sock.sendMessage(from, { text: `❗Tidak bisa kick admin: @${user.split('@')[0]}`, mentions: [user] });
    }
  }
};
