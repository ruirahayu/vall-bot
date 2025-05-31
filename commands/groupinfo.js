module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us')) 
    return sock.sendMessage(from, { text: '❗ Command ini hanya untuk grup.' });

  const metadata = await sock.groupMetadata(from);
  const participants = metadata.participants;

  const groupName = metadata.subject;
  const groupDesc = metadata.desc || 'Tidak ada deskripsi';
  const groupOwner = metadata.owner || 'Unknown';

  const admins = participants
    .filter(p => p.admin)
    .map(p => `@${p.id.split('@')[0]}`)
    .join(', ');

  const totalMembers = participants.length;

  let msg = `*Info Grup*\n\n`;
  msg += `📛 Nama Grup: ${groupName}\n`;
  msg += `📝 Deskripsi: ${groupDesc}\n`;
  msg += `👑 Owner: @${groupOwner.split('@')[0]}\n`;
  msg += `👮‍♂️ Admins (${admins.split(',').length}): ${admins}\n`;
  msg += `👥 Total anggota: ${totalMembers}\n`;

  await sock.sendMessage(from, { text: msg, mentions: participants.map(p => p.id) });
};
