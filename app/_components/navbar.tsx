import { authOptions } from "@/auth/auth-options";
import { getServerSession } from "next-auth";
import { SignInButton } from "./sign-in-button";

export async function Navbar() {
  const session = await getServerSession(authOptions);

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
            <SignInButton session={session} />
          </li>
        </ul>
      </div>
    </nav>
  );
}
