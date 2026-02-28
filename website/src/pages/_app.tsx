import type { AppProps } from 'next/app';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import Footer from '../components/Footer';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className={`${inter.variable} ${outfit.variable} font-sans leading-relaxed min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}>
        <Component {...pageProps} />
        <Footer />
      </div>
    </ThemeProvider>
  );
}
