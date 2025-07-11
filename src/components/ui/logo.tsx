import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex shrink-0" aria-label="Cruip">
      <Image src="/assets/logo.svg" alt="Cruip Logo" width={32} height={32} />
    </Link>
  );
}
