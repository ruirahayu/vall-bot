const fs = require('fs');
const groupDbPath = './lib/group.json';

function loadGroupData() {
  if (!fs.existsSync(groupDbPath)) fs.writeFileSync(groupDbPath, '{}');
  return JSON.parse(fs.readFileSync(groupDbPath));
}

function saveGroupData(data) {
  fs.writeFileSync(groupDbPath, JSON.stringify(data, null, 2));
}

function normalizeJid(jid) {
  return jid?.endsWith('@s.whatsapp.net') ? jid : `${jid.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
}

module.exports = async (sock, m, args, sender, from) => {
  if (!from.endsWith('@g.us')) return;

  // Ambil info grup
  const metadata = await sock.groupMetadata(from);
  const adminIds = metadata.participants.filter(p => p.admin).map(p => p.id);

  // Pastikan sender adalah admin
  if (!adminIds.includes(sender)) {
    await sock.sendMessage(from, { text: '❌ Hanya admin yang bisa kasih warn.' });
    return;
  }

  // Ambil mention dari contextInfo
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (!mentioned.length) {
    return await sock.sendMessage(from, { text: '❌ Tag user yang mau di-warn.' });
  }

  const target = normalizeJid(mentioned[0]);
  const reason = args.slice(1).join(' ') || 'Tanpa alasan';

  const db = loadGroupData();
  if (!db[from]) db[from] = {};
  if (!db[from].warn) db[from].warn = {};
  if (!db[from].warn[target]) db[from].warn[target] = { count: 0, reasons: [] };

  db[from].warn[target].count += 1;
  db[from].warn[target].reasons.push(reason);
  const warnCount = db[from].warn[target].count;

  saveGroupData(db);

  await sock.sendMessage(from, {
    text: `⚠️ @${target.split('@')[0]} diberi peringatan ke-${warnCount}\n📝 Alasan: ${reason}`,
    mentions: [target]
  });

  if (warnCount >= 3) {
    await sock.sendMessage(from, {
      text: `🚫 @${target.split('@')[0]} sudah dapat 3 peringatan dan akan dikeluarkan.`,
      mentions: [target]
    });

    await sock.groupParticipantsUpdate(from, [target], 'remove');

    delete db[from].warn[target]; // Reset warn setelah kick
    saveGroupData(db);
  }
};
