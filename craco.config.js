module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
      if (oneOfRule && oneOfRule.oneOf) {
        oneOfRule.oneOf.forEach((rule) => {
          if (rule.use && Array.isArray(rule.use)) {
            rule.use.forEach((u) => {
              if (u.loader && u.loader.includes('source-map-loader')) {
                rule.exclude = /node_modules/;
              }
            });
          }
        });
      }
      return webpackConfig;
    },
  },
};
