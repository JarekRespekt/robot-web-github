import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Генерує "стендалоун" білд, зручний для Heroku
  output: "standalone",

  // Прибере заголовок "X-Powered-By: Next.js"
  poweredByHeader: false,
};

export default nextConfig;