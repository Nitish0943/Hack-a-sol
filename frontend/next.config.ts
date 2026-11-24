import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "sbi.co.in" },
      { protocol: "https", hostname: "www.sbi.co.in" },
      { protocol: "https", hostname: "bankofbaroda.in" },
      { protocol: "https", hostname: "www.bankofbaroda.in" },
      { protocol: "https", hostname: "mahindrafinance.com" },
      { protocol: "https", hostname: "www.mahindrafinance.com" },
      { protocol: "https", hostname: "bajajallianz.com" },
      { protocol: "https", hostname: "www.bajajallianz.com" },
      { protocol: "https", hostname: "hdfcbank.com" },
      { protocol: "https", hostname: "www.hdfcbank.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "pmkisan.gov.in" },
      { protocol: "https", hostname: "pmfby.gov.in" },
      { protocol: "https", hostname: "agriportal.cg.nic.in" },
      { protocol: "https", hostname: "creda.cgstate.gov.in" },
    ],
  },
};

export default nextConfig;