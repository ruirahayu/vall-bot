module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us')) 
    return sock.sendMessage(from, { text: '❗ Command ini hanya bisa dipakai di grup.' });

  const metadata = await sock.groupMetadata(from);
  const isAdmin = metadata.participants.some(p => p.id === sender && p.admin);
  if (!isAdmin)
    return sock.sendMessage(from, { text: '🚫 Hanya admin grup yang bisa menggunakan perintah ini.' });

  const botId = sock.user.id;
  const isBotAdmin = metadata.participants.some(p => p.id === botId && p.admin);
  if (!isBotAdmin)
    return sock.sendMessage(from, { text: '⚠️ Bot harus jadi admin agar bisa menambahkan member.' });

  if (!args.length) 
    return sock.sendMessage(from, { text: '❗ Kirim nomor yang ingin ditambahkan. Contoh: .add 6281234567890' });

  const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

  try {
    await sock.groupParticipantsUpdate(from, [number], 'add');
    await sock.sendMessage(from, { text: `✅ Berhasil menambahkan @${number.split('@')[0]}!`, mentions: [number] });
  } catch (err) {
    console.error(err);
    await sock.sendMessage(from, { text: `❌ Gagal menambahkan @${number.split('@')[0]}. Pastikan nomor benar dan tidak memprivasi grup.`, mentions: [number] });
  }
};
