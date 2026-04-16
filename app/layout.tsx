import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { FloatingHeader } from '@/components/floating-header'
import { Footer } from '@/components/footer'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'kqMatches',
  description: 'kqMatches - Streamy meczów piłki nożnej',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              
              var scrollPos = sessionStorage.getItem('scrollPosition');
              if (scrollPos !== null) {
                window.scrollTo(0, parseInt(scrollPos, 10));
                sessionStorage.removeItem('scrollPosition');
              }
              
              window.addEventListener('beforeunload', function() {
                sessionStorage.setItem('scrollPosition', window.pageYOffset.toString());
              });
            })();
          `
        }} />
        <FloatingHeader />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
