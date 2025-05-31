module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us')) 
    return sock.sendMessage(from, { text: '❗ Command ini hanya untuk grup.' });

  const metadata = await sock.groupMetadata(from);
  const participants = metadata.participants.map(p => p.id);

  const text = args.join(' ');
  if (!text) 
    return sock.sendMessage(from, { text: '❗ Gunakan: `.hidetag <pesan>`' });

  await sock.sendMessage(from, {
    text,
    mentions: participants
  });
};
