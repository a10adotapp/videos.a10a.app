"use client";

import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

export function Navbar() {
  const pathname = usePathname();

  const signInButtonClick = useCallback(() => {
    signIn("google", {
      callbackUrl: pathname,
    });
  }, [pathname]);

  return (
    <nav className="navbar fixed-bottom navbar-light bg-light">
      <div className="container-fluid">
        <ul className="navbar-nav flex-row justify-content-around w-100">
          <li className="nav-item">
            <a className="nav-link" href="/videos/new">
              New
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="/videos">
              Search
            </a>
          </li>

          <li className="nav-item">
            <button
              className="btn btn-outline-secondary"
              onClick={signInButtonClick}
            >
              SignIn
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
