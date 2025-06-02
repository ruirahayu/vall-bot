const fs = require('fs');
const groupDbPath = './db/group.json';

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
  const metadata = await sock.groupMetadata(from);
  const adminIds = metadata.participants.filter(p => p.admin).map(p => p.id);

  if (!adminIds.includes(sender)) {
    return await sock.sendMessage(from, { text: '❌ Hanya admin yang bisa menghapus warn.' });
  }

  const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (!mentioned.length) return await sock.sendMessage(from, { text: '❌ Tag user yang mau dihapus warn-nya.' });

  const target = normalizeJid(mentioned[0]);

  const db = loadGroupData();
  if (db[from]?.warn?.[target]) {
    delete db[from].warn[target];
    saveGroupData(db);
    await sock.sendMessage(from, {
      text: `✅ Warn untuk @${target.split('@')[0]} telah dihapus.`,
      mentions: [target]
    });
  } else {
    await sock.sendMessage(from, {
      text: `ℹ️ @${target.split('@')[0]} belum punya warn.`,
      mentions: [target]
    });
  }
};
