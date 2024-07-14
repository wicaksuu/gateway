const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const NodeCache = require("node-cache");

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;
const cache = new NodeCache({ stdTTL: 600 }); // Cache dengan TTL 10 menit

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const { message } = req.body;

  if (message && message.text) {
    const chatId = message.chat.id;
    const text = message.text;

    // Ambil status percakapan dari cache
    let conversationState = cache.get(chatId) || {};

    // Logika percakapan
    if (!conversationState.step) {
      await sendMessage(chatId, "Halo! Apa nama Anda?");
      conversationState.step = "ASK_NAME";
    } else if (conversationState.step === "ASK_NAME") {
      conversationState.name = text;
      await sendMessage(
        chatId,
        `Senang bertemu dengan Anda, ${text}! Berapa umur Anda?`
      );
      conversationState.step = "ASK_AGE";
    } else if (conversationState.step === "ASK_AGE") {
      conversationState.age = text;
      await sendMessage(
        chatId,
        `Terima kasih, ${conversationState.name}. Anda berumur ${text} tahun.`
      );
      conversationState.step = "DONE";
    } else {
      await sendMessage(chatId, "Percakapan selesai. Terima kasih!");
      cache.del(chatId); // Hapus status percakapan dari cache
    }

    // Simpan status percakapan ke cache
    cache.set(chatId, conversationState);
  }

  res.sendStatus(200);
});

async function sendMessage(chatId, text) {
  const url = `${TELEGRAM_API}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text }),
  });

  return response.json();
}

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
