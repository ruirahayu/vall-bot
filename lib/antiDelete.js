const msgStore = new Map();
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = function antiDelete(sock) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    msgStore.set(msg.key.id, msg);
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || !msg.message.protocolMessage) return;

    const protocol = msg.message.protocolMessage;
    if (protocol.type === 0) {
      const deletedID = protocol.key.id;
      const originalMsg = msgStore.get(deletedID);
      if (!originalMsg) return;

      const sender = originalMsg.pushName || originalMsg.key.participant || originalMsg.key.remoteJid;
      const type = Object.keys(originalMsg.message)[0];
      const content = originalMsg.message[type];

      if (type === 'conversation' || type === 'extendedTextMessage') {
        const text = content?.text || content;
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🕵️ Pesan yang dihapus oleh @${sender.split('@')[0]}:\n\n${text}`,
          mentions: [sender]
        });
      } else {
        const mediaTypes = ['imageMessage', 'videoMessage', 'documentMessage', 'stickerMessage', 'audioMessage'];

        if (mediaTypes.includes(type)) {
          try {
            const mediaBuffer = await downloadMediaMessage(originalMsg, 'buffer', {}, {
              logger: console,
              reuploadRequest: sock.updateMediaMessage
            });

            if (mediaBuffer) {
              await sock.sendMessage(msg.key.remoteJid, {
                [type.replace('Message', '')]: mediaBuffer,
                caption: `🕵️ Media yang dihapus oleh @${sender.split('@')[0]}`,
                mentions: [sender]
              }, { quoted: originalMsg });
            } else {
              console.warn('[antiDelete] Media tidak bisa diunduh.');
            }
          } catch (err) {
            console.error('[antiDelete] Gagal kirim ulang media:', err);
          }
        } else {
          console.warn('[antiDelete] Tipe tidak didukung untuk dikembalikan:', type);
        }
      }
    }
  });
};
