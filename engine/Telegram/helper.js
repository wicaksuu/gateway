const Switch = async function (data, bot) {
  let first_name, last_name, username, id, type, text, keyboard;
  if (data.message) {
    ({ first_name, last_name, username } = data.message.from);
    id = data.message.chat.id;
    type = data.message.chat.type;
    text = data.message.text + " ";
  } else {
    ({ first_name, last_name, username } = data.callback_query.message.from);
    id = data.callback_query.message.chat.id;
    type = data.callback_query.message.chat.type;
    text = data.callback_query.data + " ";
  }

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

    case "/saldo":
      replay = "*Sisa saldo anda adalah* : Rp.0,-";
      break;
    case "/account":
      replay = "*Akun anda* : ";
      break;
    case "/cekin":
      replay = "Absen masuk " + msg;
      break;
    case "/cekout":
      replay = "Absen pulang " + msg;
      break;

    default:
      replay = "*Command tidak tersedia*";
      break;
  }

  bot.sendMessage(id, replay, options);
  return;
};

module.exports = { Switch };
