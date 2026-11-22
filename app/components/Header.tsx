import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  backHref?: string;
}

export default function Header({
  title = "Verify Economic Licence",
  backHref = "/",
}: HeaderProps) {
  return (
    <div className="header">
      <Link href={backHref} className="header-icons">
        {"<"}
      </Link>
      <div className="header-title">{title}</div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Using standard img to avoid Next.js Image wrapper artifacts interfering with flexbox */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/header-logo.png"
          alt="Logo"
          style={{ height: "30px", marginRight: "15px" }}
        />
        <div className="header-icons">✕</div>
      </div>
    </div>
  );
}
