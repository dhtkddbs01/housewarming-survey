/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 는 네이티브 모듈 — 번들에 넣지 않고 node_modules 에서 그대로 불러온다
  serverExternalPackages: ['better-sqlite3'],
  // ESLint 는 쓰지 않는다
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
};

export default nextConfig;
