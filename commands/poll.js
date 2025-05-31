module.exports = async (sock, m, args, sender, from) => {
  const text = args.join(' ');
  if (!text.includes('|')) {
    return sock.sendMessage(from, { text: '📊 Format salah!\nContoh: `.poll Makanan favorit? | Nasi | Roti | Mie`' });
  }

  const [title, ...options] = text.split('|').map(x => x.trim());
  if (options.length < 2) {
    return sock.sendMessage(from, { text: '⚠️ Minimal 2 opsi diperlukan untuk polling.' });
  }

  await sock.sendMessage(from, {
    poll: {
      name: title,
      values: options,
      selectableCount: 1
    }
  });
};
