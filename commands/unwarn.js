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

  const metadata = await sock.groupMetadata(from);
  const adminIds = metadata.participants.filter(p => p.admin).map(p => p.id);

  if (!adminIds.includes(sender)) {
    return await sock.sendMessage(from, { text: '❌ Hanya admin yang bisa un-warn.' });
  }

  const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  let target;
  if (quoted) {
    target = normalizeJid(quoted);
  } else if (mentioned.length > 0) {
    target = normalizeJid(mentioned[0]);
  } else {
    return await sock.sendMessage(from, { text: '❌ Harus reply pesan atau tag user yang mau di-unwarn.' });
  }

  const db = loadGroupData();
  if (!db[from] || !db[from].warn || !db[from].warn[target]) {
    return await sock.sendMessage(from, {
      text: `ℹ️ @${target.split('@')[0]} belum pernah diberi peringatan.`,
      mentions: [target]
    });
  }

  // === Kurangi 1 atau reset total
  if (args.includes('reset') || db[from].warn[target].count <= 1) {
    delete db[from].warn[target];
    saveGroupData(db);
    return await sock.sendMessage(from, {
      text: `✅ Peringatan @${target.split('@')[0]} telah direset.`,
      mentions: [target]
    });
  }

  db[from].warn[target].count -= 1;
  db[from].warn[target].reasons.pop();
  saveGroupData(db);

  await sock.sendMessage(from, {
    text: `➖ Peringatan @${target.split('@')[0]} dikurangi. Sekarang: ${db[from].warn[target].count}`,
    mentions: [target]
  });
};
