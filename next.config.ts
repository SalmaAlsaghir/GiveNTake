import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dvcmlvyfzliundvyjldq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/listing-images/**',
      },
    ],
  },
};

export default nextConfig;
