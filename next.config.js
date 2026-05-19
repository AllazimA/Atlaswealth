/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    unoptimized: true,
  },
  typescript: {
    // Temporarily ignore type errors since wealthos will be refactored
    ignoreBuildErrors: true,
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  webpack: (config, { isServer }) => {
    // Handle libsql bindings and excluded file types
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'libsql': false,
      '@libsql/client': false,
      '@libsql/darwin-arm64': false,
      '@libsql/darwin-x64': false,
      '@libsql/linux-x64': false,
      '@libsql/linux-arm64': false,
      '@libsql/win32-x64': false,
    }

    // Add rule to exclude non-JS/TS files from node_modules
    config.module.rules.push({
      test: /\.(md|MD|LICENSE|node|node-gyp-build)$/,
      include: /node_modules/,
      type: 'asset/resource',
      parser: {
        dataUrlCondition: {
          maxSize: 0,
        },
      },
    })

    // Also exclude from all rules that might try to parse them
    const newRules = config.module.rules.map((rule) => {
      if (!rule.test) return rule;
      return {
        ...rule,
        exclude: [
          ...(rule.exclude instanceof RegExp ? [rule.exclude] : rule.exclude ? Array.isArray(rule.exclude) ? rule.exclude : [rule.exclude] : []),
          /node_modules\/@libsql/,
          /node_modules\/libsql/,
          /\.md$/,
          /\.node$/,
          /LICENSE/,
        ]
      };
    });
    config.module.rules = newRules;

    return config
  },
}

module.exports = nextConfig
