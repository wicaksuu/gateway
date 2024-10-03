const midtransClient = require("midtrans-client");

let snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
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
      email: "",
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

const handlePaymentCallback = (callbackData) => {
  switch (callbackData.transaction_status) {
    case "capture":
      if (callbackData.fraud_status === "accept") {
        // Pembayaran sukses
      } else if (callbackData.fraud_status === "deny") {
        // Pembayaran ditolak
      }
      break;
    case "settlement":
      // Pembayaran sukses
      break;
    case "cancel":
    case "deny":
    case "expire":
      // Pembayaran gagal
      break;
    case "pending":
      // Pembayaran tertunda
      break;
    default:
      // Notifikasi lain
      break;
  }
};

module.exports = {
  createTransaction,
  withdrawUser,
  handlePaymentCallback,
};
