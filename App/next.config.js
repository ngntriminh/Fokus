const { useRouter } = require('next/router')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig

module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        '@svgr/webpack',
      ],
    })
    return config
  },
  async rewrites() {
    return [
      {
        source: "/feed",
        destination: "/sidebar_nav/Feed",
      },
      {
        source: "/timemanagement",
        destination: "/sidebar_nav/TimeManagement",
      },
      {
        source: "/store",
        destination: "/sidebar_nav/Store",
      },
      {
        source: "/leaderboard",
        destination: "/sidebar_nav/Leaderboard",
      },      {
        source: "/assistant",
        destination: "/sidebar_nav/Assistant",
      },
    ];
  }, 
}






