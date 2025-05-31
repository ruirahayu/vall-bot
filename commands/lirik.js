const axios = require('axios');
const cheerio = require('cheerio');

// Langsung masukin token kamu di sini:
const GENIUS_TOKEN = 'Bearer LS5WQ3IPzMSC_zYul9hgXmHs5qVWo1Q1i6wFXGUsNsyYED8Rw6ERXTraqWLZiTAC';

module.exports = async (sock, m, args, sender, from, saveBotMessage) => {
  const query = args.join(' ');
  if (!query) {
    return await sock.sendMessage(from, {
      text: '❌ Masukkan judul lagu!\nContoh: .lyrics fix you',
    });
  }

  try {
    // 1. Cari lagu dari Genius API
    const searchRes = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: GENIUS_TOKEN
      }
    });

    const hits = searchRes.data.response.hits;
    if (!hits.length) throw new Error('No result');

    const songPath = hits[0].result.path;

    // 2. Scrape halaman liriknya
    const html = await axios.get(`https://genius.com${songPath}`);
    const $ = cheerio.load(html.data);
    const lyrics = $('.lyrics').text().trim() || $('[data-lyrics-container="true"]').text().trim();

    if (!lyrics) throw new Error('No lyrics found');

    await sock.sendMessage(from, {
      text: `🎵 *Lirik: ${hits[0].result.full_title}* 🎵\n\n${lyrics.substring(0, 4000)}`
    });
  } catch (err) {
    console.error('❌ Lyrics error:', err.message);
    await sock.sendMessage(from, {
      text: '⚠️ Gagal mengambil lirik. Coba lagi atau pastikan judulnya benar.',
    });
  }
};
