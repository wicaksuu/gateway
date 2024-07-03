const {
  Login,
  getWorkCode,
  Presensi,
  CekPresensi,
} = require("./engine/Telegram/autoAbsen");

const AutoMasuk = async function AutoMasuk(
  username,
  password,
  userAgent,
  imei,
  api_key,
  url,
  latitude,
  longitude
) {
  let {
    webhook,
    login,
    workCode,
    ProsesPresensi,
    VerifikasiPresensi,
    PesanVerifikasi,
    PesanProses,
  } = {};
  if (!api_key) {
    login = await Login(
      userAgent,
      username,
      password,
      imei,
      url,
      latitude,
      longitude
    );
    if (login.result) {
      api_key = login.result.api_key;
    } else {
      console.log("Api key tidak ditemukan");
      process.exit();
    }
  } else {
    webhook = await getWorkCode(
      userAgent,
      api_key,
      imei,
      url,
      latitude,
      longitude
    );

    if (webhook.result) {
      workCode = webhook.result;
    } else {
      console.log("Work code tidak ditemukan");
      process.exit();
    }

    ProsesPresensi = await CekPresensi(
      api_key,
      1,
      "25277",
      latitude,
      longitude,
      imei,
      userAgent,
      url
    );
    if (ProsesPresensi.result) {
      PesanVerifikasi = ProsesPresensi.result.message;
      console.log(PesanVerifikasi);
    } else {
      console.log("Gagal melakukan cek presensi");
      process.exit();
    }
    VerifikasiPresensi = await Presensi(
      api_key,
      1,
      "25277",
      latitude,
      longitude,
      imei,
      userAgent,
      url
    );
    if (VerifikasiPresensi.result) {
      PesanProses = VerifikasiPresensi.result.message;
      console.log(PesanProses);
    } else {
      console.log("Gagal melakukan presensi");
      process.exit();
    }
  }
};

const userAgent =
  "Dalvik/2.1.0 (Linux; U; Android 13; SM-G985F Build/TP1A.220624.014)";
const username = "wicaksu";
const password = "Jack03061997";
const api_key = "101395664666857970408805.84469463.20240703111648";
const imei = "3be18a532c24ade2";
const url = "https://absen.madiunkab.go.id";
const latitude = "-7.63250691";
const longitude = "111.53012497";

const resp = AutoMasuk(
  username,
  password,
  userAgent,
  imei,
  api_key,
  url,
  latitude,
  longitude
);
