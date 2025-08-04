/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 ignore: [
  '**/node_modules/**',
  '**/Application Data/**',
  '**/AppData/**',
  '**/.git/**'
]
};

export default nextConfig;
