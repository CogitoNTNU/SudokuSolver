module.exports = {
    // The app runs entirely in the browser, so it can be exported to static
    // files and served by any web server -- no Node runtime needed.
    output: "export",
    // next/image cannot optimise on demand without a server.
    images: { unoptimized: true },
    webpack: (config) => {
      config.resolve.fallback = { fs: false, path:false, "crypto": false  };
      return config;
    },
};
