module.exports = async (sock, m, args, sender, from) => {
  if (args.length < 3 || args[0].toLowerCase() !== 'ke') {
    return await sock.sendMessage(from, {
      text: '❌ Format salah. Contoh:\n.confess ke 6281234567890 Aku suka kamu.'
    });
  }

  const number = args[1].replace(/[^0-9]/g, '');
  const targetJid = number + '@s.whatsapp.net';
  const confessMessage = args.slice(2).join(' ');

  try {
    const [check] = await sock.onWhatsApp(number);
    if (!check?.exists) {
      return await sock.sendMessage(from, {
        text: `❌ Nomor ${number} tidak ditemukan di WhatsApp.`
      });
    }

    await sock.sendMessage(check.jid, {
      text: `💌 Kamu menerima *confess* anonim:\n\n"${confessMessage}"`
    });

    await sock.sendMessage(from, {
      text: '✅ Confess kamu berhasil dikirim secara anonim!'
    });
  } catch (err) {
    console.error('❌ Gagal mengirim confess:', err);
    await sock.sendMessage(from, {
      text: '⚠️ Terjadi kesalahan saat mengirim confess.'
    });
  }
};
