const fs = require('fs');
const file = './db/group.json';

function loadDb() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '{}');
  return JSON.parse(fs.readFileSync(file));
}

function saveDb(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function ensureGroup(jid) {
  const db = loadDb();
  if (!db[jid]) {
    db[jid] = {
      welcomeOn: true,
        goodbyeOn: true,
        antilink: true,
        antidelete: false, // ✅ tambahkan ini
        rules: '',
        welcome: '',
        goodbye: ''
    };
    saveDb(db);
  }
  return db[jid];
}

function setGroupSetting(jid, key, value) {
  const db = loadDb();
  if (!db[jid]) db[jid] = {};
  db[jid][key] = value;
  saveDb(db);
}

function getGroupSetting(jid, key) {
  const db = loadDb();
  return db[jid]?.[key];
}

module.exports = {
  loadDb,
  saveDb,
  ensureGroup,
  setGroupSetting,
  getGroupSetting
};
