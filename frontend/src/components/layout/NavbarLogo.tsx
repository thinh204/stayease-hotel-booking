import Image from "next/image";
import Link from "next/link";

type NavbarLogoProps = {
  onClick?: () => void;
};

export default function NavbarLogo({ onClick }: NavbarLogoProps) {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center"
      onClick={onClick}
    >
      <Image
        src="/icons/logo.svg"
        alt="StayEase"
        width={167}
        height={36}
        priority
        className="h-9 w-auto transition-transform duration-200 group-hover:scale-105"
      />
    </Link>
  );
}
