const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const apiKey = process.env.IPAYMU_API_KEY;
const va = process.env.IPAYMU_VA;
const url = process.env.IPAYMU_URL;

const sha256 = (data) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex")
    .toLowerCase();
};

const createSignature = (httpMethod, requestBody, va, apiKey) => {
  const stringToSign = `${httpMethod}:${va}:${sha256(requestBody)}:${apiKey}`;
  return crypto.createHmac("sha256", apiKey).update(stringToSign).digest("hex");
};

const createPaymentLink = async (totalAmount, buyerPhone, buyerName) => {
  const requestBody = {
    price: [totalAmount],
    product: ["Subcribe Layanan"],
    qty: [1],
    returnUrl: "https://wicak.id/webhook",
    cancelUrl: "https://wicak.id/webhook",
    notifyUrl: "https://wicak.id/webhook",
    buyerName: buyerName,
    buyerPhone: buyerPhone,
  };

  const httpMethod = "POST";
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .substring(0, 14);

  const signature = createSignature(httpMethod, requestBody, va, apiKey);

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
        va: va,
        signature: signature,
        timestamp: timestamp,
      },
    });

    if (response.data && response.data.Url) {
      return response.data.Url;
    }
    return response;
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    return error.response;
  }
};

const withdrawMember = async (memberId, amount) => {
  try {
    const response = await axios.post(
      "https://sandbox.ipaymu.com/api/v2/withdraw",
      {
        memberId: memberId,
        amount: amount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "API-Key": process.env.IPAYMU_API_KEY,
          "Merchant-Token": process.env.IPAYMU_MERCHANT_TOKEN,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
  }
};

const handleWebhook = async (req, res) => {
  const { status, data } = req.body;

  if (status === "success") {
    console.log("Pembayaran sukses:", data);
  } else if (status === "cancel") {
    console.log("Pembayaran dibatalkan:", data);
  } else if (status === "notify") {
    console.log("Notifikasi pembayaran:", data);
  } else {
    console.log("Status tidak dikenal:", status);
  }

  res.status(200).send("Webhook diterima");
};

module.exports = {
  createPaymentLink,
  withdrawMember,
  handleWebhook,
};
