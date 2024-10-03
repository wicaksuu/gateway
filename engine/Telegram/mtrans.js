const midtransClient = require("midtrans-client");
const TelegramBot = require("node-telegram-bot-api");

const decodeBase64 = (encodedString) => {
  return Buffer.from(encodedString, "base64").toString("utf-8");
};

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: decodeBase64(process.env.MIDTRANS_SERVER_KEY),
  clientKey: decodeBase64(process.env.MIDTRANS_CLIENT_KEY),
});

const createTransaction = async (user) => {
  const uniqueCode = Date.now().toString();

  const parameter = {
    transaction_details: {
      order_id: `order-id-${user.nip}-${uniqueCode}`,
      gross_amount: 55000,
    },
    customer_details: {
      first_name: user.name,
      last_name: "",
      email: user.email,
      phone: user.whatsapp,
    },
    item_details: [
      {
        id: "sub-1",
        price: 55000,
        quantity: 1,
        name: "Subscribe 1",
      },
    ],
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    const { token: transactionToken, redirect_url: redirectUrl } = transaction;
    return { transactionToken, redirectUrl };
  } catch (e) {
    throw new Error(`Gagal membuat link pembayaran: ${e.message}`);
  }
};

const withdrawUser = async (user, amount) => {
  // Implementasi logika penarikan dana untuk user
};

const handlePaymentCallback = (callbackData, user) => {
  const bot = new TelegramBot(
    "6723275259:AAEuLPp-CvYQSioGZjvpqJ4rLyAP6b8vT80",
    { polling: false }
  );

  const options = {
    parse_mode: "Markdown",
  };

  let message = `*Notifikasi Pembayaran*\n\n`;
  message += `*Nama:* ${user.name}\n`;
  message += `*WhatsApp:* ${user.whatsapp}\n\n`;
  message += `*Status Transaksi:* ${callbackData.transaction_status}\n`;
  message += `*Tipe Pembayaran:* ${callbackData.payment_type}\n`;
  message += `*ID Pesanan:* ${callbackData.order_id}\n`;
  message += `*Jumlah Pembayaran:* Rp ${callbackData.gross_amount}\n`;
  message += `*Waktu Kadaluarsa:* ${callbackData.expiry_time}\n\n`;

  const statusMessages = {
    capture:
      callbackData.fraud_status === "accept"
        ? "Pembayaran sukses"
        : "Pembayaran ditolak",
    settlement: "Pembayaran sukses",
    cancel: "Pembayaran dibatalkan",
    deny: "Pembayaran ditolak",
    expire: "Pembayaran kadaluarsa",
    pending: "Pembayaran tertunda",
    refund: "Pembayaran dikembalikan",
    partial_refund: "Pembayaran sebagian dikembalikan",
    authorize: "Pembayaran terotorisasi",
    void: "Pembayaran dibatalkan",
  };

  message += `*Status:* ${
    statusMessages[callbackData.transaction_status] || "Notifikasi lain"
  }\n`;

  bot.sendMessage(user.chatIdTelegram, message, options);
  return message;
};

module.exports = {
  createTransaction,
  withdrawUser,
  handlePaymentCallback,
};
