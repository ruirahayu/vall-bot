const axios = require('axios');
const cheerio = require('cheerio');

// Ganti token ini dengan milik kamu dari Genius API
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
    const songTitle = hits[0].result.full_title;

    // 2. Scrape halaman lirik dari Genius
    const html = await axios.get(`https://genius.com${songPath}`);
    const $ = cheerio.load(html.data);

    // Ganti tag <br> dengan newline \n
    $('br').replaceWith('\n');

    let lyrics = '';
    $('[data-lyrics-container="true"]').each((i, el) => {
      lyrics += $(el).text().trim() + '\n';
    });

    // 3. Bersihkan teks
    lyrics = lyrics
      .replace(/\[.*?\]/g, '') // hapus tag seperti [Verse]
      .replace(/^\s*[\d]+ Contributors.*$/gm, '') // hapus "4 Contributors..." dsb
      .replace(/(\n\s*){2,}/g, '\n\n') // rapikan spasi antar paragraf
      .trim();

    if (!lyrics) throw new Error('No lyrics found');

    await sock.sendMessage(from, {
      text: `🎵 *Lirik: ${songTitle}* 🎵\n\n${lyrics.substring(0, 4000)}`
    });
  } catch (err) {
    console.error('❌ Lyrics error:', err.message);
    await sock.sendMessage(from, {
      text: '⚠️ Gagal mengambil lirik. Coba lagi atau pastikan judulnya benar.',
    });
  }
};
