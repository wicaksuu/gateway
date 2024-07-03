const UserModel = require("../models/userModel");
const UserAutoAbsenModel = require("../models/userAutoAbsenModel");

const Switch = async function (data, bot) {
  const { first_name, last_name, username, id, type, text } =
    data.message || data.callback_query.message;
  const key = text.split(" ")[0];
  const msg = text.slice(key.length + 1).trim();
  let replay = "";
  let options = {
    parse_mode: "Markdown",
    reply_markup: {},
  };

  const groupName =
    type === "private"
      ? `${first_name} ${last_name}`
      : data.message?.chat.title;
  const isGroup = type !== "private";

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
      console.log(user);
      if (user) {
        const { name, balance, nip } = user;
        replay = `*Hai ${name}*\n`;
        replay += `NIP anda : ${nip}\n`;
        replay += `Sisa anda : ${balance}\n`;
      } else {
        replay =
          "*Akun anda belum terdaftar*\n\nApabila anda tertarik dengan layanan ini silahkan menghubungi @wicakbay";
      }
      break;
    case "/account":
      replay = "*Akun anda* : ";
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
