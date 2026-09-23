import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokCred — Academic Credentials, Verified.",
  description:
    "Issue, secure and verify academic credentials with cryptographic proof anchored on blockchain. A trusted infrastructure for academic credential verification.",
  keywords: [
    "academic credentials",
    "blockchain verification",
    "credential verification",
    "cryptographic proof",
    "university credentials",
    "TokCred",
  ],
  openGraph: {
    title: "TokCred — Academic Credentials, Verified.",
    description:
      "A trusted infrastructure for academic credential verification using blockchain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#050508" />
      </head>
      <body style={{ background: '#050508' }}>{children}</body>
    </html>
  );
}
