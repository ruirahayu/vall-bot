const fs = require('fs');
const path = require('path');
const { ensureGroup } = require('../lib/groupDb');
const { addWarn, resetWarn } = require('../lib/groupWarn'); // Pastikan kamu buat file groupWarn.js

const commands = {};
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands'));
for (const file of commandFiles) {
  const cmdName = file.replace('.js', '');
  commands[cmdName] = require(`../commands/${file}`);
}

function normalizeJid(jid) {
  return jid?.endsWith('@s.whatsapp.net') ? jid : `${jid.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
}

async function handleMessage(sock, m) {
  const msg = m.message?.conversation || m.message?.extendedTextMessage?.text;
  const from = m.key.remoteJid;
  const rawSender = m.key.participant || from;
  const sender = normalizeJid(rawSender);

  // === Ambil konfigurasi grup
  const groupConfig = from.endsWith('@g.us') ? ensureGroup(from) : {};

  // Cek pelanggaran antilink di grup
  if (
    from.endsWith('@g.us') &&
    groupConfig.antilink &&
    msg &&
    /(https?:\/\/|chat\.whatsapp\.com)/i.test(msg)
  ) {
    const metadata = await sock.groupMetadata(from);
    const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);

    if (!groupAdmins.includes(sender)) {
      // Tambah warn
      const warnCount = addWarn(from, sender);

      await sock.sendMessage(from, {
        text: `⚠️ @${sender.split('@')[0]} mengirim link, peringatan ke-${warnCount}/3.`,
        mentions: [sender]
      });

      if (warnCount >= 3) {
        await sock.sendMessage(from, {
          text: `🚫 @${sender.split('@')[0]} sudah 3x peringatan, akan dikeluarkan dari grup.`,
          mentions: [sender]
        });

        try {
          await sock.groupRemove(from, [sender]);
          resetWarn(from, sender);
        } catch (e) {
          await sock.sendMessage(from, {
            text: `⚠️ Gagal mengeluarkan @${sender.split('@')[0]}.`,
            mentions: [sender]
          });
        }
      }

      // Hapus pesan pelanggaran
      await sock.sendMessage(from, { delete: m.key });
      return; // stop proses command supaya gak lanjut
    }
  }

  if (!msg || !msg.startsWith('.')) return;

  const args = msg.trim().slice(1).split(/\s+/);
  const cmd = args.shift().toLowerCase();

  if (commands[cmd]) {
    try {
      await commands[cmd](sock, m, args, sender, from);
    } catch (err) {
      console.error('❌ Error command', cmd, err);
      await sock.sendMessage(from, { text: '⚠️ Terjadi kesalahan saat menjalankan perintah.' });
    }
  }
}

module.exports = handleMessage;
