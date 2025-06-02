const axios = require('axios');
const cheerio = require('cheerio');

// Ganti token ini dengan token Genius kamu
const GENIUS_TOKEN = 'Bearer LS5WQ3IPzMSC_zYul9hgXmHs5qVWo1Q1i6wFXGUsNsyYED8Rw6ERXTraqWLZiTAC';

module.exports = async (sock, m, args, sender, from, saveBotMessage) => {
  const query = args.join(' ');
  if (!query) {
    return await sock.sendMessage(from, {
      text: '❌ Masukkan judul lagu!\nContoh: .lyrics yellow',
    });
  }

  try {
    // 1. Cari lagu via Genius API
    const searchRes = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: GENIUS_TOKEN,
      },
    });

    const hits = searchRes.data.response.hits;
    if (!hits.length) throw new Error('Lagu tidak ditemukan');

    const song = hits[0].result;
    const songPath = song.path;

    // 2. Scrape halaman lirik
    const html = await axios.get(`https://genius.com${songPath}`);
    const $ = cheerio.load(html.data);

    // Ambil baris-baris dari container lirik
    let lyrics = '';
    $('[data-lyrics-container="true"]').each((i, el) => {
      lyrics += $(el).text().trim() + '\n';
    });

    lyrics = lyrics.trim();
    if (!lyrics) throw new Error('Lirik tidak ditemukan');

    await sock.sendMessage(from, {
      text: `🎵 *Lirik: ${song.full_title}* 🎵\n\n${lyrics.substring(0, 4000)}`,
    });

  } catch (err) {
    console.error('❌ Lyrics error:', err.message);
    await sock.sendMessage(from, {
      text: '⚠️ Gagal mengambil lirik. Coba lagi atau pastikan judulnya benar.',
    });
  }
};
