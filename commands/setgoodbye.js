const { setGroupSetting } = require('../lib/groupDb');

module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us'))
    return sock.sendMessage(from, { text: '❗ Command ini hanya untuk grup.' });

  const metadata = await sock.groupMetadata(from);
  const isAdmin = metadata.participants.some(p => p.id === sender && p.admin);
  if (!isAdmin)
    return sock.sendMessage(from, { text: '🚫 Hanya admin yang bisa mengatur goodbye message.' });

  const goodbyeMsg = args.join(' ').replace(/\\n/g, '\n');

  if (!goodbyeMsg.trim())
    return sock.sendMessage(from, { text: '❗ Gunakan: `.setgoodbye <pesan>`\nContoh: `.setgoodbye Selamat tinggal @user, semoga sukses di luar sana!`' });

  setGroupSetting(from, 'goodbye', goodbyeMsg);
  setGroupSetting(from, 'goodbyeOn', true);

  await sock.sendMessage(from, { text: `✅ Pesan goodbye berhasil disimpan:\n\n${goodbyeMsg}` });
};
