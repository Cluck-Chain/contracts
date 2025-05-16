'use client';

import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>区块链农场管理系统</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
