const midtransClient = require("midtrans-client");

// Inisiasi Snap API instance
let snap = new midtransClient.Snap({
  isProduction: false, // Set ke true jika aplikasi sudah live
  serverKey: "SB-Mid-server-tmYg6t7fcEzakh36ch91Weqn",
});

let parameter = {
  transaction_details: {
    order_id: "order-id-12345s",
    gross_amount: 100000, // Jumlah total transaksi dalam IDR
  },
  customer_details: {
    first_name: "Budi",
    last_name: "Utomo",
    email: "budi.utomo@example.com",
    phone: "081234567890",
  },
  item_details: [
    {
      id: "item01",
      price: 100000,
      quantity: 1,
      name: "Produk A",
    },
  ],
  enabled_payments: ["gopay-qris"], // Hanya menerima pembayaran dengan QRIS
  expiry: {
    start_time: new Date().toISOString(),
    unit: "hour",
    duration: 1,
  },
};

snap
  .createTransaction(parameter)
  .then((transaction) => {
    let transactionToken = transaction.token;
    let redirectUrl = transaction.redirect_url;
    console.log("Payment Link:", redirectUrl);
  })
  .catch((e) => {
    console.error("Error:", e.message);
  });
