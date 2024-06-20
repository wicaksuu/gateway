# Gunakan image resmi Node.js sebagai parent image
FROM node:22

# Atur direktori kerja
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json
COPY package*.json ./


# Instalasi dependensi
RUN npm install

# Salin seluruh kode aplikasi
COPY . .

# Buka port yang digunakan aplikasi
EXPOSE 3000

# Tentukan perintah untuk menjalankan aplikasi
CMD [ "node", "gateway.js" ]
