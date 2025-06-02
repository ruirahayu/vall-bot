const fs = require('fs');
const groupDbPath = './lib/group.json';

function loadGroupData() {
  if (!fs.existsSync(groupDbPath)) fs.writeFileSync(groupDbPath, '{}');
  return JSON.parse(fs.readFileSync(groupDbPath));
}

module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us')) return;

  const metadata = await sock.groupMetadata(from);
  const adminIds = metadata.participants.filter(p => p.admin).map(p => p.id);

  if (!adminIds.includes(sender)) {
    return await sock.sendMessage(from, { text: '❌ Hanya admin yang bisa melihat daftar warn.' });
  }

  const db = loadGroupData();
  if (!db[from] || !db[from].warn) {
    return await sock.sendMessage(from, { text: 'ℹ️ Belum ada member yang diberi peringatan.' });
  }

  const warns = db[from].warn;
  const groupWarns = Object.entries(warns);

  if (groupWarns.length === 0) {
    return await sock.sendMessage(from, { text: 'ℹ️ Belum ada member yang diberi peringatan.' });
  }

  let text = '*📋 Daftar Warn Member Grup:*\n\n';

  for (const [jid, data] of groupWarns) {
    const user = jid.split('@')[0];
    text += `@${user} — Peringatan: ${data.count}\nAlasan:\n`;

    data.reasons.forEach((r, i) => {
      text += `  ${i + 1}. ${r}\n`;
    });

    text += '\n';
  }

  const mentions = groupWarns.map(([jid]) => jid);

  await sock.sendMessage(from, { text, mentions });
};
