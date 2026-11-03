import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Righteous, Source_Code_Pro } from 'next/font/google';
import './globals.css';

const display = Righteous({
  variable: '--font-display',
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  style: ['normal'],
});

const sans = Source_Code_Pro({
  variable: '--font-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  style: ['normal'],
});

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable} h-full antialiased`}>
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale} className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <NextIntlClientProvider messages={messages}>
          <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
        </NextIntlClientProvider>
    </html>
  );
}