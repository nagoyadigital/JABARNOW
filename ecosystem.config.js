// PM2 — menjalankan JabarNow! (Next.js standalone) di VPS.
// Jalankan: pm2 start ecosystem.config.js && pm2 save
//
// Prasyarat: sudah `npm run build` sehingga folder .next/standalone ada,
// dan aset statis sudah disalin (lihat scripts/deploy.sh / docs).
module.exports = {
  apps: [
    {
      name: "jabarnow",
      // Server mandiri hasil output:"standalone"
      script: ".next/standalone/server.js",
      cwd: __dirname,
      instances: 1, // naikkan / "max" untuk cluster bila CPU banyak
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        // Port internal yang di-proxy Nginx
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      max_memory_restart: "512M",
      autorestart: true,
      watch: false,
    },
  ],
};
