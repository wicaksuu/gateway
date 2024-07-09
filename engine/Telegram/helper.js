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
    validUntilDate,
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
          { text: "Info", callback_data: "/info" },
          { text: "Pilih Work Code", callback_data: "/workcode" },
        ],
        [
          { text: "Get ID", callback_data: "/myid" },
          { text: "Admin", callback_data: "/admin" },
        ],
      ],
    },
  };

  switch (key) {
    case "/start":
      replay =
        "*Selamat datang di BOT Auto Absen*\nUntuk melakukan pembuatan akun dan pengisian saldo silahkan menghubungi @admin\nDaftar Layanan";

      break;

    case "/admin":
      replay =
        "*Perpanjang Masa Aktif*\nSilahkan silahkan menghubungi admin kami (Biaya per bulan Rp. 50.000,-) \n\n@miminabsen \n\natau \n\nhttps://t.me/miminabsen\n\nterimakasih";
      break;

    case "/format":
      replay =
        "*Format Pengisian*\nNIP : 198201142014021002\nPassword : 198201142014021002\nURL : https://absen.madiunkab.go.id\nLatitude : -7.54350646208995\nLongitude : 111.65470339160038\nChat ID Telegram : 6939373220\nNama : NUR EKOWAHYUDI, S.E.\nIMEI : 8c7c8e731c868e84\nUser Agent : Dalvik/2.1.0 (Linux; U; Android 13; 22041219G Build/TP1A.220624.014)\nURL : https://absen.madiunkab.go.id";
      break;

    case "/add":
      if (id === 1218095835 || id === 6915731358) {
        const msgArray = msg.split("\n");
        const nip = msgArray[0].split(" : ")[1].replace(/\s+/g, "");
        const password = msgArray[1].split(" : ")[1];
        const url = msgArray[2].split(" : ")[1];
        const latitude = parseFloat(msgArray[3].split(" : ")[1]);
        const longitude = parseFloat(msgArray[4].split(" : ")[1]);
        const chatIdTelegram = msgArray[5].split(" : ")[1].replace(/\s+/g, "");
        const name = msgArray[6].split(" : ")[1];
        const imei = msgArray[7].split(":")[1];
        const userAgent = msgArray[8].split(" : ")[1];
        const userUrl = msgArray[9].split(" : ")[1];

        replay = `*NIP : ${nip}\n*Password : ${password}\n*URL : ${url}\n*Latitude : ${latitude}\n*Longitude : ${longitude}\n*Chat ID Telegram : ${chatIdTelegram}\n*Nama : ${name}\n*IMEI : ${imei}\n*User Agent : ${userAgent}\n*URL : ${userUrl}`;
      }
      break;

    case "/tambah":
      if (id === 1218095835 || id === 6915731358) {
        user = await UserModel.findOne({ nip: msg });
        if (user) {
          userAutoAbsen = await UserAutoAbsenModel.findOne({ user: user._id });
          if (userAutoAbsen) {
            userAutoAbsen.validUntil =
              new Date(userAutoAbsen.validUntil).getTime() +
              30 * 24 * 60 * 60 * 1000;
            await userAutoAbsen.save();
            replay = `*Hai admin User : ${user.name}*\nMasa aktif anda telah diperpanjangkan 30 hari`;
          }
        }
      } else {
        replay = `*Hai ${name}*\nAnda tidak memiliki akses untuk melakukan perpanjangan masa aktif`;
      }
      break;

    case "/myid":
      replay = `*Informasi Telegram @${username} :*\n\n`;
      replay += isGroup
        ? `Nama Grub : ${groupName}\nChat Id : ${id}\n`
        : `Nama : ${groupName}\nChat Id : ${id}\n`;
      break;

    case "/user":
      if (id === 1218095835 || id === 6915731358) {
        user = await UserModel.find({
          $or: [
            { username: msg },
            { name: msg },
            { chatIdTelegram: msg },
            { nip: msg },
          ],
        });
        if (user && user.length > 0) {
          for (const usr of user) {
            name = usr.name;
            balance = usr.balance;
            nip = usr.nip;
            _id = usr._id;
            userAutoAbsen = await UserAutoAbsenModel.findOne({ user: _id });
            if (userAutoAbsen) {
              apiKey = userAutoAbsen.apiKey;
              userAgent = userAutoAbsen.userAgent;
              imei = userAutoAbsen.imei;
              url = userAutoAbsen.url;
              latitude = userAutoAbsen.latitude;
              longitude = userAutoAbsen.longitude;
            }
            replay = `*Informasi User :*\n\n`;
            replay += `Nama: ${name}\n`;
            replay += `Saldo: ${formatRupiah(balance)}\n`;
            replay += `NIP: ${nip}\n`;
            replay += `API Key: ${apiKey}\n`;
            replay += `User Agent: ${userAgent}\n`;
            replay += `IMEI: ${imei}\n`;
            replay += `URL: ${url}\n`;
            replay += `Latitude: ${latitude}\n`;
            replay += `Longitude: ${longitude}\n`;
            validUntilDate = new Date(userAutoAbsen.validUntil).toLocaleString(
              "id-ID",
              {
                timeZone: "Asia/Jakarta",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }
            );
            replay += `Valid Until: ${validUntilDate}\n\n`;
            bot.sendMessage(id, replay, options);
          }
          replay = `*User telah ditampilkan*`;
        } else {
          replay = `*User tidak ditemukan*`;
        }
      } else {
        replay = `*Auth invalid*`;
      }
      break;
    case "/info":
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

          validUntilDate = new Date(userAutoAbsen.validUntil).toLocaleString(
            "id-ID",
            {
              timeZone: "Asia/Jakarta",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }
          );
          const currentDate = new Date();
          const validUntil = new Date(userAutoAbsen.validUntil);
          const activeStatus =
            validUntil > currentDate ? validUntilDate : "Layanan Tidak Aktif";
          replay = `*Hai ${name}*\nNIP anda : ${nip}\nImei anda : ${userAutoAbsen.imei}\nUrl layanan : ${userAutoAbsen.url}\nToken : ${userAutoAbsen.apiKey}\nPesan : ${pesan}\nAktif Sampai: ${activeStatus}\n\n`;
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
              replay = `*Hai ${name}*\nSilahkan pilih button *Info* akun anda munkin belum terlogin!`;
            }
          } else {
            replay = `*Hai ${name}*\nSilahkan pilih button *Info* akun anda munkin belum terlogin!`;
          }
        } else {
          replay = `*Hai ${name}*\nSilahkan pilih button *Info* akun anda munkin belum terlogin!`;
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

        userAutoAbsen = await UserAutoAbsenModel.findOne({ user: _id });
        if (userAutoAbsen) {
          if (user.role === "admin" || userAutoAbsen.validUntil > new Date()) {
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
                  validUntilDate = new Date(
                    userAutoAbsen.validUntil
                  ).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  replay = `*Hai ${name}*\n\nHasil Presensi :\nPesan : ${respPresensi.result.message}\nNama : ${respPresensi.result.nama}\nDinas : ${respPresensi.result.departemen}\nJarak : ${respPresensi.result.jarak}\nType : ${respPresensi.result.checktype}\nWaktu : ${respPresensi.result.waktu}\n\nTerimakasih telah menggunakan jasa kami, masa aktif anda sampai ${validUntilDate}`;
                } else {
                  replay = `*Hai ${name}*\nSilahkan pilih button *Info* akun anda munkin belum terlogin!`;
                }
              } else {
                replay = `*Hai ${name}*\nSilahkan pilih button *Info* akun anda munkin belum terlogin!`;
              }
            } else {
              replay = `*Hai ${name}*\nSilahkan pilih button *Info* akun anda munkin belum terlogin!`;
            }
          } else {
            replay = `*Hai ${name}*\nMasa aktif layanan telah habis, mohon melakukan perpanjangan masa aktif!`;
          }
        } else {
          replay = `*Hai ${name}*\nAnda belum terdaftar pada layanan apapun!`;
        }
      } else {
        replay = `*Hai ${name}*\nAnda tidak memiliki account!`;
      }

      break;
    case "/cekout":
      user = await UserModel.findOne({ chatIdTelegram: id });
      if (user) {
        name = user.name;
        balance = parseFloat(user.balance);
        nip = user.nip;
        _id = user._id;

        userAutoAbsen = await UserAutoAbsenModel.findOne({ user: _id });
        if (userAutoAbsen) {
          if (user.role === "admin" || userAutoAbsen.validUntil > new Date()) {
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
                  validUntilDate = new Date(
                    userAutoAbsen.validUntil
                  ).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  replay = `*Hai ${name}*\n\nHasil Presensi :\nPesan : ${respPresensi.result.message}\nNama : ${respPresensi.result.nama}\nDinas : ${respPresensi.result.departemen}\nJarak : ${respPresensi.result.jarak}\nType : ${respPresensi.result.checktype}\nWaktu : ${respPresensi.result.waktu}\n\nTerimakasih telah menggunakan jasa kami, masa aktif anda sampai ${validUntilDate}`;
                } else {
                  replay = `*Hai ${name}*\nSilahkan pilih button *Info* akun anda munkin belum terlogin!`;
                }
              } else {
                replay = `*Hai ${name}*\nSilahkan pilih button *Info* akun anda munkin belum terlogin!`;
              }
            } else {
              replay = `*Hai ${name}*\nSilahkan pilih button *Info* akun anda munkin belum terlogin!`;
            }
          } else {
            replay = `*Hai ${name}*\nMasa aktif layanan telah habis, mohon melakukan perpanjangan masa aktif!`;
          }
        } else {
          replay = `*Hai ${name}*\nAnda belum terdaftar pada layanan apapun!`;
        }
      } else {
        replay = `*Hai ${name}*\nAnda tidak memiliki account!`;
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
