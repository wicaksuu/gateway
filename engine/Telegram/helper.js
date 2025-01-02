const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const UserAutoAbsenModel = require("../models/userAutoAbsenModel");
const { createTransaction } = require("./mtrans");

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
  } = {};
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

  const createInlineKeyboardButton = (text, callback_data) => ({
    text,
    callback_data,
  });

  options = {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          createInlineKeyboardButton("Info", "/info"),
          createInlineKeyboardButton("Pilih Work Code", "/workcode"),
        ],
        [
          createInlineKeyboardButton("Get ID", "/myid"),
          createInlineKeyboardButton("Admin", "/admin"),
        ],
        [createInlineKeyboardButton("Perpanjang", "/perpanjang")],
      ],
    },
  };

  switch (key) {
    case "/start":
      replay =
        "*Selamat datang di BOT Auto Absen*\nUntuk melakukan pembuatan akun dan pengisian saldo silahkan menghubungi\n\n@miminabsen \n\natau \n\nhttps://t.me/miminabsen\n\nBiaya layanan sebesar Rp. 50.000,- per bulan \n";

      break;

    case "/admin":
      replay =
        "*Informasi*\nJika kesusahan melakukan perpanjangan silahkan hubungi admin kami, agar bisa di bantu \n\n@miminabsen \n\natau \n\nhttps://t.me/miminabsen\n\nterimakasih";
      break;

    case "/format":
      if (id === 1218095835 || id === 6915731358) {
        replay =
          "/add NIP : \nPassword : \nURL : https://absen.madiunkab.go.id\nLatitude : \nLongitude : \nChat ID Telegram : \nNama : \nIMEI : \nUser Agent : \nWHATSAPP : \nEMAIL : \nREF : \n";

        bot.sendMessage(id, replay, {
          parse_mode: "Markdown",
        });
        replay =
          "*Format Pengisian*\nNIP : 198201142014021002\nPassword : 198201142014021002\nURL : https://absen.madiunkab.go.id\nLatitude : -7.54350646208995\nLongitude : 111.65470339160038\nChat ID Telegram : 6939373220\nNama : NUR EKOWAHYUDI, S.E.\nIMEI : 8c7c8e731c868e84\nUser Agent : Dalvik/2.1.0 (Linux; U; Android 13; 22041219G Build/TP1A.220624.014)\nWHATSAPP : 08123456789\nEMAIL : tes@test.com\nREF : <username afiliasi>";
      } else {
        replay = `*Hai ${name}*\nAnda tidak memiliki akses untuk melakukan pembuatan akun`;
      }
      break;

    case "/perpanjang":
      user = await UserModel.findOne({ chatIdTelegram: id });
      if (user) {
        try {
          const resMitrans = await createTransaction(user);
          replay = `Biaya yang di bayar adalah (Rp. 55.000,-) sudah termasuk biaya layanan bank, pastikan melakukan transfer dengan nominal yang sesuai !!!.\n\nBerikut link pembayaran nya :\n\n${resMitrans.redirectUrl}\n\nId transaksi : ${resMitrans.transactionToken}`;
        } catch (e) {
          const pesanMimin = `*Payment Creating Error*\n\n ${e}\n\nUser : ${user.name}`;
          bot.sendMessage(id, pesanMimin);
          replay = `Permintaan pembayaran gagal. Tolong ulangi atau kontak admin.`;
        }
      } else {
        replay = "Anda belum terdaftar di layanan manapun !!!";
      }
      break;

    case "/add":
      if (id === 1218095835 || id === 6915731358) {
        const msgArray = msg.split("\n");
        const nip = msgArray[0].split(" : ")[1].replace(/\s+/g, "");
        const password = msgArray[1].split(" : ")[1];
        const url = msgArray[2].split(" : ")[1];
        const latitude = msgArray[3].split(" : ")[1];
        const longitude = msgArray[4].split(" : ")[1];
        const chatIdTelegram = msgArray[5].split(" : ")[1].replace(/\s+/g, "");
        const name = msgArray[6].split(" : ")[1];
        const imei = msgArray[7].split(" : ")[1];
        const userAgent = msgArray[8].split(" : ")[1];
        const whatsapp = msgArray[9].split(" : ")[1];
        const email = msgArray[10].split(" : ")[1];
        const ref = msgArray[11].split(" : ")[1];

        try {
          let user = await UserModel.findOne({ nip });
          if (!user) {
            user = new UserModel({
              name: name,
              username: nip,
              whatsapp: whatsapp,
              email: email,
              password: await bcrypt.hash(password, 10),
              role: "user",
              permission: { read: true, write: false },
              nip: nip,
              ref: ref,
              chatIdTelegram,
            });
            await user.save();
          } else {
            user.name = name;
            user.username = nip;
            user.password = await bcrypt.hash(password, 10);
            user.chatIdTelegram = chatIdTelegram;
            await user.save();
          }

          let userAutoAbsen = await UserAutoAbsenModel.findOne({
            user: user._id,
          });
          if (!userAutoAbsen) {
            userAutoAbsen = new UserAutoAbsenModel({
              user: user._id,
              password: password,
              imei: imei,
              userAgent: userAgent,
              latitude: latitude,
              longitude: longitude,
              url: url,
              validUntil: new Date(),
            });
          } else {
            userAutoAbsen.password = password;
            userAutoAbsen.imei = imei;
            userAutoAbsen.userAgent = userAgent;
            userAutoAbsen.latitude = latitude;
            userAutoAbsen.longitude = longitude;
            userAutoAbsen.url = url;
          }

          await userAutoAbsen.save();
          replay = "User berhasil di buat atau diperbarui";
        } catch (error) {
          replay = `Gagal membuat atau memperbarui user ada sesuatu yang salah`;
        }
      } else {
        replay = `*Hai ${name}*\nAnda tidak memiliki akses untuk melakukan pembuatan akun`;
      }
      break;

    case "/tambah":
      if (id === 1218095835 || id === 6915731358) {
        const [nip, durasiHari] = msg.split(" ");
        if (!nip || !durasiHari) {
          replay = `*Hai admin*\nFormat pesan salah. Pastikan nip dan durasi hari diisi.\nFormat: /tambah nip hari\nContoh: /tambah 123 20`;
          break;
        }
        const durasi = parseInt(durasiHari, 10);
        user = await UserModel.findOne({ nip: nip });
        if (user) {
          userAutoAbsen = await UserAutoAbsenModel.findOne({ user: user._id });
          if (userAutoAbsen) {
            userAutoAbsen.validUntil =
              new Date(userAutoAbsen.validUntil).getTime() +
              durasi * 24 * 60 * 60 * 1000;
            await userAutoAbsen.save();
            replay = `*Hai admin User : ${user.name}*\nMasa aktif anda telah diperpanjangkan ${durasi} hari`;
          } else {
            replay = `*Hai admin*\nUser Auto Absen tidak ditemukan untuk user dengan nip ${nip}`;
          }
        } else {
          replay = `*Hai admin*\nUser dengan nip ${nip} tidak ditemukan`;
        }
      } else {
        replay = `*Hai ${name}*\nAnda tidak memiliki akses untuk melakukan perpanjangan masa aktif`;
      }
      break;

    // Pengumuman
    case "/pengumuman":
      if (id === 1218095835 || id === 6915731358) {
        const pesanPengumuman = msg.split(" ").slice(1).join(" ");
        if (!pesanPengumuman) {
          replay = `*Hai admin*\nFormat pesan salah. Pastikan pesan diisi.\nFormat: /pengumuman isi_pesan\nContoh: /pengumuman Pengumuman penting untuk semua user.`;
          break;
        }

        // Ambil semua user
        const users = await UserModel.find();
        if (users.length > 0) {
          // Kirim pesan ke setiap user
          for (const user of users) {
            bot.sendMessage(user.id, pesanPengumuman, options);
          }
          replay = `*Hai admin*\nPengumuman berhasil dikirim ke semua user.`;
        } else {
          replay = `*Hai admin*\nUser tidak ditemukan.`;
        }
      } else {
        replay = `*Hai ${name}*\nAnda tidak memiliki akses untuk melakukan perpanjangan masa aktif.`;
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
            user.role === "admin"
              ? "Unlimited"
              : validUntil > currentDate
              ? validUntilDate
              : "Layanan Tidak Aktif";
          replay = `*Hai ${name}*\nNIP anda : ${nip}\nImei anda : ${
            userAutoAbsen.imei
          }\nUrl layanan : ${userAutoAbsen.url}\nToken : ${
            userAutoAbsen.apiKey
          }\nPesan : ${pesan}\nAktif Sampai: ${activeStatus}\nSaldo : ${formatRupiah(
            user.balance
          )}\n\n`;
        } else {
          if (user.role == "admin") {
            replay = `*Hai ${name}*\nUserName : ${
              user.username
            }\nSaldo : ${formatRupiah(user.balance)}`;
          } else {
            replay = `*Hai ${name}*\nAnda belum terdaftar pada layanan apapun!`;
          }
        }
      } else {
        replay =
          "*Akun anda belum terdaftar*\n\nApabila anda tertarik dengan layanan ini silahkan menghubungi \n\n@miminabsen \n\natau \n\nhttps://t.me/miminabsen\n\nTerimakasih";
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
                inline_keyboard: respWorkCode.result.map((workCode) => {
                  var nameSimple = workCode.nama
                    .replace(/\(GLOBAL\)/gi, "G") // Gantikan "(GLOBAL)" dengan "G", abaikan case
                    .replace(/\bHARI\b/gi, "") // Gantikan kata "HARI" dengan string kosong
                    .replace(/\bNON\b/gi, "N") // Gantikan kata "HARI" dengan string kosong
                    .replace(/\bSEKOLAH\b/gi, "SKH"); // Gantikan kata "SEKOLAH" dengan "SKLH"

                  return [
                    {
                      text: "Msk " + nameSimple,
                      callback_data: `/cekin ${workCode.id}`,
                    },
                    {
                      text: "Plg " + nameSimple,
                      callback_data: `/cekout ${workCode.id}`,
                    },
                  ];
                }),
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
                  validUntilDate =
                    user.role === "admin"
                      ? "Unlimited"
                      : new Date(userAutoAbsen.validUntil).toLocaleString(
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
                  validUntilDate =
                    user.role === "admin"
                      ? "Unlimited"
                      : new Date(userAutoAbsen.validUntil).toLocaleString(
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
