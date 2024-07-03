const axios = require("axios");

let { config, Data } = {};
let { Random } = "";

const Login = async function Login(
  userAgent,
  username,
  password,
  imei,
  url,
  latitude,
  longitude
) {
  Random = await randomKoordinat(latitude, longitude);
  Data = {
    jsonrpc: 2,
    filter: 1,
    method: "POST",
    object: "login",
    param: {
      email: username,
      password: password,
      latlong: Random,
      imei: imei,
    },
  };
  config = {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
  };

  try {
    const response = await axios.post(url + "/index.php/service", Data, config);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getWorkCode = async function getWorkCode(
  userAgent,
  api_key,
  imei,
  url,
  latitude,
  longitude
) {
  Random = await randomKoordinat(latitude, longitude);
  Data = {
    jsonrpc: 2,
    filter: 1,
    method: "POST",
    object: "getworkcode",
    param: {
      api_key: api_key,
      last_latlong: Random,
      imei: imei,
    },
  };
  config = {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
  };

  try {
    const response = await axios.post(url + "/index.php/service", Data, config);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const CekPresensi = async function CekPresensi(
  api_key,
  checktype,
  work_code,
  latitude,
  longitude,
  imei,
  userAgent,
  url
) {
  Random = await randomKoordinat(latitude, longitude);
  Data = {
    jsonrpc: 2,
    filter: 1,
    method: "POST",
    object: "cekabsen",
    version: 13,
    param: {
      api_key: api_key,
      checktype: checktype,
      iswfh: 0,
      work_code: work_code,
      last_latlong: Random,
      imei: imei,
    },
  };
  config = {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
  };

  try {
    const response = await axios.post(url + "/index.php/service", Data, config);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
const Presensi = async function Presensi(
  api_key,
  checktype,
  work_code,
  latitude,
  longitude,
  imei,
  userAgent,
  url
) {
  Random = await randomKoordinat(latitude, longitude);
  Data = {
    jsonrpc: 2,
    filter: 1,
    method: "POST",
    object: "absen",
    version: 13,
    param: {
      api_key: api_key,
      checktype: checktype,
      iswfh: 0,
      work_code: work_code,
      last_latlong: Random,
      imei: imei,
      type_ijin: "",
      ijin: "",
      keterangan: "",
    },
  };
  config = {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
  };

  try {
    const response = await axios.post(url + "/index.php/service", Data, config);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const randomKoordinat = async function randomKoordinat(latitude, longitude) {
  const EARTH_RADIUS = 6378137;
  let newLatitude, newLongitude;
  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  do {
    const distance = Math.random() * (80 - 10) + 10;
    const angle = Math.random() * 2 * Math.PI;
    const deltaLatitude = (distance / EARTH_RADIUS) * Math.cos(angle);
    const deltaLongitude =
      ((distance / EARTH_RADIUS) * Math.sin(angle)) /
      Math.cos((latitude * Math.PI) / 180);
    newLatitude = latitude + deltaLatitude * (180 / Math.PI);
    newLongitude = longitude + deltaLongitude * (180 / Math.PI);
  } while (newLatitude === latitude && newLongitude === longitude);
  return (
    parseFloat(newLatitude).toFixed(8) +
    "," +
    parseFloat(newLongitude).toFixed(8)
  );
};

const formatRupiah = (nominal) => {
  return `Rp. ${nominal.toLocaleString()} ,-`;
};

module.exports = { Login, getWorkCode, Presensi, CekPresensi, formatRupiah };
