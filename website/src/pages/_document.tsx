import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="SkillWiki: Agent Skills Marketplace" />

      </Head>
      <body className="antialiased text-zinc-800 bg-zinc-50 selection:bg-indigo-500 selection:text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
