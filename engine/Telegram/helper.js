const Switch = async function (data, bot) {
  const { first_name, last_name, username } = data.message.from;
  const chatId = data.message.chat.id;
  const type = data.message.chat.type;
  const text = data.message.text + " ";
  const key = text.split(" ")[0];
  const msg = text.slice(key.length + 1).trim();
  let replay = "";
  let options = {
    parse_mode: "Markdown",
    reply_markup: {},
  };

  const groupName =
    type === "private" ? `${first_name} ${last_name}` : data.message.chat.title;
  const isGroup = type !== "private";

  switch (key) {
    case "/start":
      replay = "*Selamat datang di BOT Auto Absen*\n\nLayanan";
      options.reply_markup = {
        inline_keyboard: [
          [
            { text: "Saldo", callback_data: "/saldo" },
            { text: "Account", callback_data: "/account" },
          ],
          [
            { text: "Absen Masuk", callback_data: "/cekin test" },
            { text: "Absen Keluar", callback_data: "/cekout test" },
          ],
        ],
      };
      break;

    default:
      replay = "*Command tidak tersedia*";
      break;
  }

  bot.sendMessage(chatId, replay, options);
  return;
};

module.exports = { Switch };
