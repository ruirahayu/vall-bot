const fs = require('fs');
const path = require('path');

const groupJsonPath = path.join(__dirname, '../db/group.json');

function loadGroupData() {
  if (!fs.existsSync(groupJsonPath)) return {};
  return JSON.parse(fs.readFileSync(groupJsonPath, 'utf-8'));
}

function saveGroupData(data) {
  fs.writeFileSync(groupJsonPath, JSON.stringify(data, null, 2));
}

// Tambah warn user di grup
function addWarn(groupId, userId) {
  const data = loadGroupData();

  if (!data[groupId]) {
    data[groupId] = { antilink: false, warn: {} };
  }
  if (!data[groupId].warn) {
    data[groupId].warn = {};
  }

  data[groupId].warn[userId] = (data[groupId].warn[userId] || 0) + 1;
  saveGroupData(data);

  return data[groupId].warn[userId];
}

// Ambil jumlah warn user di grup
function getWarn(groupId, userId) {
  const data = loadGroupData();
  return data[groupId]?.warn?.[userId] || 0;
}

// Reset warn user di grup
function resetWarn(groupId, userId) {
  const data = loadGroupData();
  if (data[groupId]?.warn?.[userId]) {
    data[groupId].warn[userId] = 0;
    saveGroupData(data);
  }
}

module.exports = { addWarn, getWarn, resetWarn };
