// app/providers/chakra-provider.tsx
'use client';

import { ChakraProvider, cookieStorageManagerSSR, localStorageManager } from '@chakra-ui/react';
import { useServerInsertedHTML } from 'next/navigation';
import React, { useState } from 'react';

export function ChakraProviders({ children }: { children: React.ReactNode }) {
  const [cookies, setCookies] = useState('');

  const colorModeManager =
    typeof document === 'undefined'
      ? cookieStorageManagerSSR(cookies)
      : localStorageManager;

  useServerInsertedHTML(() => {
    const attrs = document.documentElement.getAttribute('style');
    const colorModeStyles = `html{${attrs}}`;
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `(function() { try {
            var attr = ${JSON.stringify(attrs)};
            if (attr) document.documentElement.setAttribute('style', attr);
          } catch (e) {}) })();`,
        }}
      />
    );
  });

  return (
    <ChakraProvider colorModeManager={colorModeManager}>
      {children}
    </ChakraProvider>
  );
}