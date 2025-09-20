/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        serverComponentsExternalPackages: ['@prisma/client'],
    },
    // Force dynamic rendering for all pages
    trailingSlash: false,
};

export default nextConfig;
