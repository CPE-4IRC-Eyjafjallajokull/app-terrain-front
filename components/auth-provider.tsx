"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export function AuthProvider({ children }: RootLayoutProps) {
  const disabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === "1";

  if (disabled) {
    const mockSession = {
      user: { name: "Dev User", email: "dev.local@example.com", id: "dev" },
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    } as any;

    return (
      <SessionProvider
        session={mockSession}
        refetchOnWindowFocus={false}
        refetchInterval={0}
      >
        {children}
      </SessionProvider>
    );
  }

  return <SessionProvider>{children}</SessionProvider>;
}
