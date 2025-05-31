module.exports = async (sock, m, args, sender, from) => {
  const ownerNumber = '6288287806861@s.whatsapp.net'; // ← Ganti nomor ini
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Owner Bot
ORG:Developer Bot;
TEL;type=CELL;type=VOICE;waid=6281234567890:+62 812-3456-7890
END:VCARD`;

  await sock.sendMessage(from, {
    contacts: {
      displayName: 'Owner Bot',
      contacts: [{ vcard }]
    }
  }, { quoted: m });
};
