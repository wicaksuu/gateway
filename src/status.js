const si = require("systeminformation");
const authMiddleware = require("../engine/middleware/authMiddleware");

module.exports = {
  name: "status",
  description: "Receive status of server",
  params: [],
  paramTypes: {},
  sampleRequest: {
    query: "status",
    params: {},
  },
  middlewares: [authMiddleware],
  execute: async (req, res) => {
    try {
      const cpu = await si.cpu();
      const cpuUsage = await si.currentLoad();
      const memory = await si.mem();
      const disk = await si.fsSize();
      const osInfo = await si.osInfo();
      const temp = await si.cpuTemperature();

      const response = {
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          speed: cpu.speed,
          cores: cpu.cores,
          usage: cpuUsage.currentLoad.toFixed(2),
          temperature: temp.main !== -1 ? temp.main + " °C" : "N/A",
        },
        memory: {
          total: (memory.total / 1024 ** 3).toFixed(2) + " GB", // Total memory in GB
          free: (memory.free / 1024 ** 3).toFixed(2) + " GB", // Free memory in GB
          used: (memory.used / 1024 ** 3).toFixed(2) + " GB", // Used memory in GB
          active: (memory.active / 1024 ** 3).toFixed(2) + " GB", // Active memory in GB
          available: (memory.available / 1024 ** 3).toFixed(2) + " GB", // Available memory in GB
          usage: ((memory.used / memory.total) * 100).toFixed(2), // Memory usage in percentage
        },
        disk: disk.map((d) => ({
          filesystem: d.fs,
          size: (d.size / 1024 ** 3).toFixed(2) + " GB", // Disk size in GB
          used: (d.used / 1024 ** 3).toFixed(2) + " GB", // Used disk space in GB
          available: (d.available / 1024 ** 3).toFixed(2) + " GB", // Available disk space in GB
          usage: d.use.toFixed(2) + " %", // Disk usage in percentage
          mount: d.mount,
        })),
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          codename: osInfo.codename,
          kernel: osInfo.kernel,
        },
      };

      res.status(200).json({ data: response });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving system information" });
    }
  },
};
