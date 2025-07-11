import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{
        loader: '@svgr/webpack',
        options: { 
          svgo: false 
        }
      }]
    });

    // Handle other image files
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif)$/i,
      type: 'asset/resource'
    });

    return config;
  },
  images: {
    disableStaticImages: true
  }
};

export default nextConfig;
