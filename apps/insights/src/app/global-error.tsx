"use client";

import { LoggerProvider } from "@pythnetwork/component-library/useLogger";
import type { ComponentProps } from "react";

import { Error } from "../components/Error";

const GlobalError = (props: ComponentProps<typeof Error>) => (
  <LoggerProvider>
    <html lang="en" dir="ltr">
      <body>
        <Error {...props} />
      </body>
    </html>
  </LoggerProvider>
);
export default GlobalError;
