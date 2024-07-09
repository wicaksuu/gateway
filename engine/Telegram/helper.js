const UserModel = require("../models/userModel");
const UserAutoAbsenModel = require("../models/userAutoAbsenModel");
const {
  Login,
  getWorkCode,
  CekPresensi,
  Presensi,
  formatRupiah,
} = require("./autoAbsen");

const Switch = async (data, bot) => {
  let {
    user,
    apiKey,
    userAgent,
    imei,
    url,
    latitude,
    longitude,
    respWorkCode,
    lastBalance,
    pesan,
    respLogin,
    userAutoAbsen,
    name,
    balance,
    _id,
    nip,
    respCekPresensi,
    respPresensi,
  } = "";
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
  let options = {};

  if (!id) {
    console.error("Error: chat_id is empty");
    return;
  }

  options = {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Saldo", callback_data: "/saldo" },
          { text: "Pilih Work Code", callback_data: "/workcode" },
        ],
        [{ text: "Get ID", callback_data: "/myid" }],
      ],
    },
  };

  switch (key) {
    case "/start":
      replay =
        "*Selamat datang di BOT Auto Absen*\nUntuk melakukan pembuatan akun dan pengisian saldo silahkan menghubungi @admin\nDaftar Layanan";

      break;
    case "/myid":
      replay = `*Informasi Telegram @${username} :*\n\n`;
      replay += isGroup
        ? `Nama Grub : ${groupName}\nChat Id : ${id}\n`
        : `Nama : ${groupName}\nChat Id : ${id}\n`;
      break;

    case "/user":
      if (id === 1218095835) {
        user = await UserModel.find({
          $or: [
            { username: msg },
            { name: msg },
            { chatIdTelegram: msg },
            { nip: msg },
          ],
        });
        if (user && user.length > 0) {
          user.forEach((usr) => {
            replay = `*Informasi Telegram @${user.name} :*\n\n`;
            bot.sendMessage(id, replay, options);
          });
        } else {
          bot.sendMessage(id, "*User tidak ditemukan*", options);
        }
      } else {
        bot.sendMessage(id, "*Auth invalid*", options);
      }
    case "/saldo":
      user = await UserModel.findOne({ chatIdTelegram: id });
      if (user) {
        name = user.name;
        balance = user.balance;
        nip = user.nip;
        _id = user._id;
        userAutoAbsen = await UserAutoAbsenModel.findOne({ user: _id });
        if (userAutoAbsen) {
          apiKey = userAutoAbsen.apiKey;
          userAgent = userAutoAbsen.userAgent;
          apiKey = userAutoAbsen.apiKey;
          imei = userAutoAbsen.imei;
          url = userAutoAbsen.url;
          latitude = userAutoAbsen.latitude;
          longitude = userAutoAbsen.longitude;

          if (apiKey) {
            respWorkCode = await getWorkCode(
              userAgent,
              apiKey,
              imei,
              url,
              latitude,
              longitude
            );
            if (respWorkCode.result) {
              pesan = "Status akun sudah terlogin";
            } else {
              bot.sendMessage(
                id,
                "Melakukan login ulang karena token sudah tidak berlaku",
                options
              );
              respLogin = await Login(
                userAgent,
                user.nip,
                userAutoAbsen.password,
                imei,
                url,
                latitude,
                longitude
              );

              if (respLogin.result) {
                apiKey = respLogin.result.api_key;
                userAutoAbsen.apiKey = apiKey;
                await userAutoAbsen.save();
                pesan = "Sukses melakukan login ulang";
              } else {
                pesan = "Gagal melakukan login ulang";
              }
            }
          } else {
            respLogin = await Login(
              userAgent,
              user.nip,
              userAutoAbsen.password,
              imei,
              url,
              latitude,
              longitude
            );

            if (respLogin.result) {
              apiKey = respLogin.result.api_key;
              userAutoAbsen.apiKey = apiKey;
              await userAutoAbsen.save();
              pesan = "Sukses melakukan login";
            } else {
              pesan = "Gagal melakukan login";
            }
          }

          replay = `*Hai ${name}*\nNIP anda : ${nip}\nImei anda : ${
            userAutoAbsen.imei
          }\nUrl layanan : ${userAutoAbsen.url}\nToken : ${
            userAutoAbsen.apiKey
          }\nPesan : ${pesan}\nSisa saldo : ${formatRupiah(balance)}\n`;
        } else {
          replay = `*Hai ${name}*\nAnda belum terdaftar pada layanan apapun!`;
        }
      } else {
        replay =
          "*Akun anda belum terdaftar*\n\nApabila anda tertarik dengan layanan ini silahkan menghubungi @admin";
      }

      break;

    case "/workcode":
      user = await UserModel.findOne({ chatIdTelegram: id });
      if (user) {
        name = user.name;
        balance = user.balance;
        nip = user.nip;
        _id = user._id;
        userAutoAbsen = await UserAutoAbsenModel.findOne({ user: _id });
        if (userAutoAbsen) {
          apiKey = userAutoAbsen.apiKey;
          userAgent = userAutoAbsen.userAgent;
          apiKey = userAutoAbsen.apiKey;
          imei = userAutoAbsen.imei;
          url = userAutoAbsen.url;
          latitude = userAutoAbsen.latitude;
          longitude = userAutoAbsen.longitude;

          if (apiKey) {
            respWorkCode = await getWorkCode(
              userAgent,
              apiKey,
              imei,
              url,
              latitude,
              longitude
            );
            if (respWorkCode.result) {
              options.reply_markup = {
                inline_keyboard: respWorkCode.result.map((workCode) => [
                  {
                    text: "CekIn " + workCode.nama,
                    callback_data: `/cekin ${workCode.id}`,
                  },
                  {
                    text: "CekOut " + workCode.nama,
                    callback_data: `/cekout ${workCode.id}`,
                  },
                ]),
              };
              replay =
                "Silahkan pilih presensi sesuai dengan yang anda inginkan\nAnda akan melakukan presensi pada hari *" +
                respWorkCode.result[0].hari.nama +
                "*";
            } else {
              replay = `*Hai ${name}*\nSilahkan pilih button *Saldo* akun anda munkin belum terlogin!`;
            }
          } else {
            replay = `*Hai ${name}*\nSilahkan pilih button *Saldo* akun anda munkin belum terlogin!`;
          }
        } else {
          replay = `*Hai ${name}*\nSilahkan pilih button *Saldo* akun anda munkin belum terlogin!`;
        }
      } else {
        replay = `*Hai ${name}*\nAnda belum terdaftar pada layanan apapun!`;
      }

      break;

    case "/cekin":
      user = await UserModel.findOne({ chatIdTelegram: id });
      if (user) {
        name = user.name;
        balance = parseFloat(user.balance);
        nip = user.nip;
        _id = user._id;
        if (
          balance > parseFloat(process.env.PRICE || 1000) ||
          user.role === "admin"
        ) {
          userAutoAbsen = await UserAutoAbsenModel.findOne({ user: _id });
          if (userAutoAbsen) {
            apiKey = userAutoAbsen.apiKey;
            userAgent = userAutoAbsen.userAgent;
            apiKey = userAutoAbsen.apiKey;
            imei = userAutoAbsen.imei;
            url = userAutoAbsen.url;
            latitude = userAutoAbsen.latitude;
            longitude = userAutoAbsen.longitude;

            if (apiKey) {
              respCekPresensi = await CekPresensi(
                apiKey,
                1,
                msg,
                latitude,
                longitude,
                imei,
                userAgent,
                url
              );
              if (respCekPresensi.result) {
                bot.sendMessage(id, respCekPresensi.result.message, options);

                respPresensi = await Presensi(
                  apiKey,
                  1,
                  msg,
                  latitude,
                  longitude,
                  imei,
                  userAgent,
                  url
                );
                if (respPresensi.result) {
                  if (user.role === "admin") {
                    if (balance < 0) {
                      lastBalance = 0;
                    } else {
                      lastBalance = balance;
                    }
                    user.balance = lastBalance;
                  } else {
                    lastBalance =
                      balance - parseFloat(process.env.PRICE || 1000);
                    user.balance = lastBalance;
                  }
                  await user.save();
                  replay = `*Hai ${name}*\n\nHasil Presensi :\nPesan : ${
                    respPresensi.result.message
                  }\nNama : ${respPresensi.result.nama}\nDinas : ${
                    respPresensi.result.departemen
                  }\nJarak : ${respPresensi.result.jarak}\nType : ${
                    respPresensi.result.checktype
                  }\nWaktu : ${
                    respPresensi.result.waktu
                  }\n\nTerimakasih telah menggunakan jasa kami, sisa saldo anda adalah : ${formatRupiah(
                    lastBalance
                  )}`;
                } else {
                  replay = `*Hai ${name}*\nSilahkan pilih button *Saldo* akun anda munkin belum terlogin!`;
                }
              } else {
                replay = `*Hai ${name}*\nSilahkan pilih button *Saldo* akun anda munkin belum terlogin!`;
              }
            } else {
              replay = `*Hai ${name}*\nSilahkan pilih button *Saldo* akun anda munkin belum terlogin!`;
            }
          } else {
            replay = `*Hai ${name}*\nSilahkan pilih button *Saldo* akun anda munkin belum terlogin!`;
          }
        } else {
          replay = `*Hai ${name}*\nMohon maaf saldo anda tidak cukup untuk melakukan presensi!`;
        }
      } else {
        replay = `*Hai ${name}*\nAnda belum terdaftar pada layanan apapun!`;
      }

      break;
    case "/cekout":
      user = await UserModel.findOne({ chatIdTelegram: id });
      if (user) {
        name = user.name;
        balance = parseFloat(user.balance);
        nip = user.nip;
        _id = user._id;
        if (
          balance > parseFloat(process.env.PRICE || 1000) ||
          user.role === "admin"
        ) {
          userAutoAbsen = await UserAutoAbsenModel.findOne({ user: _id });
          if (userAutoAbsen) {
            apiKey = userAutoAbsen.apiKey;
            userAgent = userAutoAbsen.userAgent;
            apiKey = userAutoAbsen.apiKey;
            imei = userAutoAbsen.imei;
            url = userAutoAbsen.url;
            latitude = userAutoAbsen.latitude;
            longitude = userAutoAbsen.longitude;

            if (apiKey) {
              respCekPresensi = await CekPresensi(
                apiKey,
                2,
                msg,
                latitude,
                longitude,
                imei,
                userAgent,
                url
              );
              if (respCekPresensi.result) {
                bot.sendMessage(id, respCekPresensi.result.message, options);

                respPresensi = await Presensi(
                  apiKey,
                  2,
                  msg,
                  latitude,
                  longitude,
                  imei,
                  userAgent,
                  url
                );
                if (respPresensi.result) {
                  if (user.role === "admin") {
                    if (balance < 0) {
                      lastBalance = 0;
                    } else {
                      lastBalance = balance;
                    }
                    user.balance = lastBalance;
                  } else {
                    lastBalance =
                      balance - parseFloat(process.env.PRICE || 1000);
                    user.balance = lastBalance;
                  }
                  await user.save();
                  replay = `*Hai ${name}*\n\nHasil Presensi :\nPesan : ${
                    respPresensi.result.message
                  }\nNama : ${respPresensi.result.nama}\nDinas : ${
                    respPresensi.result.departemen
                  }\nJarak : ${respPresensi.result.jarak}\nType : ${
                    respPresensi.result.checktype
                  }\nWaktu : ${
                    respPresensi.result.waktu
                  }\n\nTerimakasih telah menggunakan jasa kami, sisa saldo anda adalah : ${formatRupiah(
                    lastBalance
                  )}`;
                } else {
                  replay = `*Hai ${name}*\nSilahkan pilih button *Saldo* akun anda munkin belum terlogin!`;
                }
              } else {
                replay = `*Hai ${name}*\nSilahkan pilih button *Saldo* akun anda munkin belum terlogin!`;
              }
            } else {
              replay = `*Hai ${name}*\nSilahkan pilih button *Saldo* akun anda munkin belum terlogin!`;
            }
          } else {
            replay = `*Hai ${name}*\nSilahkan pilih button *Saldo* akun anda munkin belum terlogin!`;
          }
        } else {
          replay = `*Hai ${name}*\nMohon maaf saldo anda tidak cukup untuk melakukan presensi!`;
        }
      } else {
        replay = `*Hai ${name}*\nAnda belum terdaftar pada layanan apapun!`;
      }

      break;
    default:
      replay = "*Command tidak tersedia*";

      break;
  }

  bot.sendMessage(id, replay, options);
  return;
};

module.exports = { Switch };
