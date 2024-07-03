const UserModel = require("../models/userModel");
const UserAutoAbsenModel = require("../models/userAutoAbsenModel");

const Switch = async (data, bot) => {
  const { message, callback_query } = data;
  const botData = message || callback_query.message;
  const { first_name, last_name, username, id, type } = botData.chat;
  const isGroup = type !== "private";
  const groupName = isGroup
    ? message?.chat.title
    : `${first_name} ${last_name}`;

  let text = callback_query?.data || botData.text || "";
  const key = text.split(" ")[0];
  const msg = text.slice(key.length + 1).trim();
  let replay = "";
  let options = {
    parse_mode: "Markdown",
    reply_markup: {},
  };

  if (!id) {
    console.error("Error: chat_id is empty");
    return;
  }

  switch (key) {
    case "/start":
      replay =
        "*Selamat datang di BOT Auto Absen*\nUntuk melakukan pembuatan akun dan pengisian saldo silahkan menghubungi @wicakbay\nDaftar Layanan";
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
    case "/myid":
      replay = `*Informasi Telegram @${username} :*\n\n`;
      replay += isGroup
        ? `Nama Grub : ${groupName}\nChat Id : ${id}\n`
        : `Nama : ${groupName}\nChat Id : ${id}\n`;
      break;
    case "/saldo":
      const user = await UserModel.findOne({ chatIdTelegram: id });
      if (user) {
        const { name, balance, nip, _id } = user;
        const userAutoAbsen = await UserAutoAbsenModel.findOne({ user: _id });
        replay = userAutoAbsen
          ? `*Hai ${name}*\nNIP anda : ${nip}\nImei anda : ${userAutoAbsen.imei}\nUrl layanan : ${userAutoAbsen.url}\nSisa saldo : ${balance}\n`
          : `*Hai ${name}*\nAnda belum terdaftar pada layanan apapun!`;
      } else {
        replay =
          "*Akun anda belum terdaftar*\n\nApabila anda tertarik dengan layanan ini silahkan menghubungi @wicakbay";
      }
      break;
    case "/cekin":
      replay = `Absen masuk ${msg}`;
      break;
    case "/cekout":
      replay = `Absen pulang ${msg}`;
      break;
    default:
      replay = "*Command tidak tersedia*";
      break;
  }

  bot.sendMessage(id, replay, options);
  return;
};

module.exports = { Switch };
