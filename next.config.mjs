// export default nextConfig;
/// <reference types="next" />
/// <reference types="next/image-types/global" />

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'lh3.googleusercontent.com',
    //     port: '',
    //     pathname: '/**',
    //   },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;


// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information. 
