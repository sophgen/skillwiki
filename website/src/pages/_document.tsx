import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning className="dark">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="SkillWiki: Agent Skills Marketplace" />

      </Head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
