module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❗ Hanya bisa di grup.' });

  const metadata = await sock.groupMetadata(from);
  const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);

  if (!groupAdmins.includes(sender)) {
    return sock.sendMessage(from, { text: '🚫 Hanya admin yang bisa mempromosikan member.' });
  }

  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned || mentioned.length === 0) {
    return sock.sendMessage(from, { text: '❗ Tag user yang mau dipromosikan.\nContoh: `.promote @user`' });
  }

  await sock.groupParticipantsUpdate(from, [mentioned[0]], 'promote');
  await sock.sendMessage(from, { text: `✅ @${mentioned[0].split('@')[0]} sekarang adalah admin.`, mentions: mentioned });
};
