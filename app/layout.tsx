import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./_components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <div className="container">{children}</div>

        <div
          style={{
            height: "25vh",
          }}
        />

        <Navbar />

        <Toaster />
      </body>
    </html>
  );
}
