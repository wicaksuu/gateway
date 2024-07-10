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
  const { message, callback_query } = data;
  const botData = message || callback_query.message;
  const { first_name, last_name, username, id, type } = botData.chat;
  const isGroup = type !== "private";
  const groupName = isGroup
    ? message?.chat.title
    : `${first_name} ${last_name}`;

  const text = callback_query?.data || botData.text || "";
  const [key, ...msgArray] = text.split(" ");
  const msg = msgArray.join(" ").trim();
  let replay = "";
  let options = {
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

  if (!id) {
    console.error("Error: chat_id is empty");
    return;
  }

  const sendMessage = (message) => bot.sendMessage(id, message, options);

  const handleAdminCommands = async (command) => {
    if (id !== 1218095835 && id !== 6915731358) {
      return `*Hai ${name}*\nAnda tidak memiliki akses untuk melakukan ${command}`;
    }

    switch (command) {
      case "format":
        sendMessage(
          "/add NIP : \nPassword : \nURL : https://absen.madiunkab.go.id\nLatitude : \nLongitude : \nChat ID Telegram : \nNama : \nIMEI : \nUser Agent : "
        );
        return "*Format Pengisian*\nNIP : 198201142014021002\nPassword : 198201142014021002\nURL : https://absen.madiunkab.go.id\nLatitude : -7.54350646208995\nLongitude : 111.65470339160038\nChat ID Telegram : 6939373220\nNama : NUR EKOWAHYUDI, S.E.\nIMEI : 8c7c8e731c868e84\nUser Agent : Dalvik/2.1.0 (Linux; U; Android 13; 22041219G Build/TP1A.220624.014)";
      case "add":
        const [
          nip,
          password,
          url,
          latitude,
          longitude,
          chatIdTelegram,
          name,
          imei,
          userAgent,
        ] = msgArray.map((item) => item.split(" : ")[1].trim());

        try {
          let user = await UserModel.findOne({ nip });
          if (!user) {
            user = new UserModel({
              name,
              username: nip,
              password: await bcrypt.hash(password, 10),
              role: "user",
              permission: { read: true, write: false },
              nip,
              chatIdTelegram,
            });
            await user.save();
          }

          const userAutoAbsen = new UserAutoAbsenModel({
            user: user._id,
            password,
            imei,
            userAgent,
            latitude,
            longitude,
            url,
            validUntil: new Date(new Date().setDate(new Date().getDate() + 30)),
          });

          await userAutoAbsen.save();
          return "User berhasil di buat";
        } catch (error) {
          return "Gagal membuat user";
        }
      case "tambah":
        const user = await UserModel.findOne({ nip: msg });
        if (user) {
          const userAutoAbsen = await UserAutoAbsenModel.findOne({
            user: user._id,
          });
          if (userAutoAbsen) {
            userAutoAbsen.validUntil =
              new Date(userAutoAbsen.validUntil).getTime() +
              30 * 24 * 60 * 60 * 1000;
            await userAutoAbsen.save();
            return `*Hai admin User : ${user.name}*\nMasa aktif anda telah diperpanjangkan 30 hari`;
          }
        }
        return `*Hai ${name}*\nAnda tidak memiliki akses untuk melakukan perpanjangan masa aktif`;
      case "user":
        const users = await UserModel.find({
          $or: [
            { username: msg },
            { name: msg },
            { chatIdTelegram: msg },
            { nip: msg },
          ],
        });
        if (users && users.length > 0) {
          for (const usr of users) {
            const userAutoAbsen = await UserAutoAbsenModel.findOne({
              user: usr._id,
            });
            if (userAutoAbsen) {
              const validUntilDate = new Date(
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
              replay = `*Informasi User :*\n\nNama: ${
                usr.name
              }\nSaldo: ${formatRupiah(usr.balance)}\nNIP: ${
                usr.nip
              }\nAPI Key: ${userAutoAbsen.apiKey}\nUser Agent: ${
                userAutoAbsen.userAgent
              }\nIMEI: ${userAutoAbsen.imei}\nURL: ${
                userAutoAbsen.url
              }\nLatitude: ${userAutoAbsen.latitude}\nLongitude: ${
                userAutoAbsen.longitude
              }\nValid Until: ${validUntilDate}\n\n`;
              sendMessage(replay);
            }
          }
          return `*User telah ditampilkan*`;
        }
        return `*User tidak ditemukan*`;
      default:
        return `*Command tidak tersedia*`;
    }
  };

  const handleUserCommands = async (command) => {
    const user = await UserModel.findOne({ chatIdTelegram: id });
    if (!user) {
      return "*Akun anda belum terdaftar*\n\nApabila anda tertarik dengan layanan ini silahkan menghubungi \n\n@miminabsen \n\natau \n\nhttps://t.me/miminabsen\n\nTerimakasih";
    }

    const userAutoAbsen = await UserAutoAbsenModel.findOne({ user: user._id });
    if (!userAutoAbsen) {
      return `*Hai ${user.name}*\nAnda belum terdaftar pada layanan apapun!`;
    }

    const validUntilDate = new Date(userAutoAbsen.validUntil).toLocaleString(
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

    switch (command) {
      case "info":
        const currentDate = new Date();
        const validUntil = new Date(userAutoAbsen.validUntil);
        const activeStatus =
          validUntil > currentDate ? validUntilDate : "Layanan Tidak Aktif";
        return `*Hai ${user.name}*\nNIP anda : ${user.nip}\nImei anda : ${userAutoAbsen.imei}\nUrl layanan : ${userAutoAbsen.url}\nToken : ${userAutoAbsen.apiKey}\nPesan : ${pesan}\nAktif Sampai: ${activeStatus}\n\n`;
      case "workcode":
        const respWorkCode = await getWorkCode(
          userAutoAbsen.userAgent,
          userAutoAbsen.apiKey,
          userAutoAbsen.imei,
          userAutoAbsen.url,
          userAutoAbsen.latitude,
          userAutoAbsen.longitude
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
          return `Silahkan pilih presensi sesuai dengan yang anda inginkan\nAnda akan melakukan presensi pada hari *${respWorkCode.result[0].hari.nama}*`;
        }
        return `*Hai ${user.name}*\nSilahkan pilih button *Info* akun anda munkin belum terlogin!`;
      case "cekin":
      case "cekout":
        const presensiType = command === "cekin" ? 1 : 2;
        const respCekPresensi = await CekPresensi(
          userAutoAbsen.apiKey,
          presensiType,
          msg,
          userAutoAbsen.latitude,
          userAutoAbsen.longitude,
          userAutoAbsen.imei,
          userAutoAbsen.userAgent,
          userAutoAbsen.url
        );
        if (respCekPresensi.result) {
          sendMessage(respCekPresensi.result.message);
          const respPresensi = await Presensi(
            userAutoAbsen.apiKey,
            presensiType,
            msg,
            userAutoAbsen.latitude,
            userAutoAbsen.longitude,
            userAutoAbsen.imei,
            userAutoAbsen.userAgent,
            userAutoAbsen.url
          );
          if (respPresensi.result) {
            return `*Hai ${user.name}*\n\nHasil Presensi :\nPesan : ${respPresensi.result.message}\nNama : ${respPresensi.result.nama}\nDinas : ${respPresensi.result.departemen}\nJarak : ${respPresensi.result.jarak}\nType : ${respPresensi.result.checktype}\nWaktu : ${respPresensi.result.waktu}\n\nTerimakasih telah menggunakan jasa kami, masa aktif anda sampai ${validUntilDate}`;
          }
        }
        return `*Hai ${user.name}*\nSilahkan pilih button *Info* akun anda munkin belum terlogin!`;
      default:
        return `*Command tidak tersedia*`;
    }
  };

  switch (key) {
    case "/start":
      replay =
        "*Selamat datang di BOT Auto Absen*\nUntuk melakukan pembuatan akun dan pengisian saldo silahkan menghubungi\n\n@miminabsen \n\natau \n\nhttps://t.me/miminabsen\n\nBiaya layanan sebesar Rp. 50.000,- per bulan \n";
      break;
    case "/admin":
      replay =
        "*Perpanjang Masa Aktif*\nSilahkan silahkan menghubungi admin kami (Biaya per bulan Rp. 50.000,-) \n\n@miminabsen \n\natau \n\nhttps://t.me/miminabsen\n\nterimakasih";
      break;
    case "/format":
    case "/add":
    case "/tambah":
    case "/user":
      replay = await handleAdminCommands(key.slice(1));
      break;
    case "/myid":
      replay = `*Informasi Telegram @${username} :*\n\n`;
      replay += isGroup
        ? `Nama Grub : ${groupName}\nChat Id : ${id}\n`
        : `Nama : ${groupName}\nChat Id : ${id}\n`;
      break;
    case "/info":
    case "/workcode":
    case "/cekin":
    case "/cekout":
      replay = await handleUserCommands(key.slice(1));
      break;
    default:
      replay = "*Command tidak tersedia*";
      break;
  }

  sendMessage(replay);
};

module.exports = { Switch };
