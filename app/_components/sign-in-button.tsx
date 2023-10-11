"use client";

import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

export function SignInButton({ session }: { session: Session | null }) {
  const pathname = usePathname();

  const signInButtonClick = useCallback(() => {
    signIn("google", {
      callbackUrl: pathname,
    });
  }, [pathname]);

  const signOutButtonClick = useCallback(() => {
    if (!confirm("ログアウトしますか？")) {
      return;
    }

    signOut({
      callbackUrl: pathname,
    });
  }, [pathname]);

  return session ? (
    <button
      className="btn btn-outline-secondary"
      onClick={signOutButtonClick}
      style={{
        maxWidth: "10em",
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      {((): string => {
        if (session.user.email) {
          const chunk = session.user.email.split("@")[0];

          if (chunk) {
            return chunk;
          }
        }

        return "ログイン中";
      })()}
    </button>
  ) : (
    <button className="btn btn-outline-secondary" onClick={signInButtonClick}>
      SignIn
    </button>
  );
}
