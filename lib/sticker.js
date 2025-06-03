const { Sticker } = require('wa-sticker-formatter');

async function sticker(buffer) {
  const sticker = new Sticker(buffer, {
    pack: 'Stiker Meme',
    author: 'BotKamu',
    type: 'full',
    quality: 80,
  });
  return await sticker.toBuffer();
}

module.exports = { sticker };
