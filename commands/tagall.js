module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us')) {
    return sock.sendMessage(from, { text: '❗Fitur ini hanya bisa digunakan di grup.' });
  }

  const metadata = await sock.groupMetadata(from);
  const participants = metadata.participants;

  let mentions = [];
  let message = '👥 *Tag All Member:*\n\n';

  participants.forEach(p => {
    mentions.push(p.id);
    message += `@${p.id.split('@')[0]}\n`;
  });

  await sock.sendMessage(from, {
    text: message,
    mentions,
  });
};
