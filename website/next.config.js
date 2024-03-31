module.exports = {
    webpack: (config) => {
      config.resolve.fallback = { fs: false, path:false, "crypto": false  };
      return config;
    },
};