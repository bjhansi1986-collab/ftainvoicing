import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FTA Invoice Pro - UAE Invoice Management',
  description: 'Next.js invoice generation system for UAE companies with multicurrency, VAT compliance, and PDF export',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
