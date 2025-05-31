const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const showQR = require('../utils/qr');
const handleMessage = require('../handlers/messageHandler');
const { ensureGroup } = require('../lib/groupDb');

const antiDelete = require('../lib/antiDelete');


async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const sock = makeWASocket({
    auth: state,
    qrTimeout: 0,
    getMessage: async () => ({}),
  });

  // setelah sock connect:
  antiDelete(sock);


  // QR code & reconnect logic
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) await showQR(qr);

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startSock();
    } else if (connection === 'open') {
      console.log('✅ Bot berhasil terhubung ke WhatsApp!');
    }
  });

  // Simpan kredensial jika diperbarui
  sock.ev.on('creds.update', saveCreds);

  // Tangani pesan masuk
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;
    await handleMessage(sock, msg);
  });

  sock.ev.on('group-participants.update', async (update) => {
    const groupId = update.id;
    const participants = update.participants;
    const action = update.action; // 'add' atau 'remove'

    const groupConfig = ensureGroup(groupId);
    const metadata = await sock.groupMetadata(groupId);
    const groupName = metadata.subject; // nama grup

    if (action === 'add' && groupConfig.welcomeOn) {
      for (const user of participants) {
        let welcomeMsg = groupConfig.welcome || 'Selamat datang @user di grup @group!';
        welcomeMsg = welcomeMsg
          .replace(/@user/g, `@${user.split('@')[0]}`)
          .replace(/@group/g, groupName);
        await sock.sendMessage(groupId, {
          text: welcomeMsg,
          mentions: [user]
        });
      }
    }

    if (action === 'remove' && groupConfig.goodbyeOn) {
      for (const user of participants) {
        let goodbyeMsg = groupConfig.goodbye || 'Selamat tinggal @user dari grup @group!';
        goodbyeMsg = goodbyeMsg
          .replace(/@user/g, `@${user.split('@')[0]}`)
          .replace(/@group/g, groupName);
        await sock.sendMessage(groupId, {
          text: goodbyeMsg,
          mentions: [user]
        });
      }
    }
  });
}

module.exports = startSock;
