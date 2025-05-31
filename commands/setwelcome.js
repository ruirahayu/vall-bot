const { setGroupSetting } = require('../lib/groupDb');

module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us'))
    return sock.sendMessage(from, { text: '❗ Command ini hanya untuk grup.' });

  const metadata = await sock.groupMetadata(from);
  const isAdmin = metadata.participants.some(p => p.id === sender && p.admin);
  if (!isAdmin)
    return sock.sendMessage(from, { text: '🚫 Hanya admin yang bisa mengatur welcome message.' });

  const welcomeMsg = args.join(' ').replace(/\\n/g, '\n'); // <-- FIX DI SINI

  if (!welcomeMsg.trim())
    return sock.sendMessage(from, { text: '❗ Gunakan: `.setwelcome <pesan>`\nContoh: `.setwelcome Halo @user, selamat datang di grup @group!`' });

  setGroupSetting(from, 'welcome', welcomeMsg);
  setGroupSetting(from, 'welcomeOn', true);

  await sock.sendMessage(from, { text: `✅ Pesan welcome berhasil disimpan:\n\n${welcomeMsg}` });
};
