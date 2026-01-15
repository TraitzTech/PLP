import Image from "next/image";
import Link from "next/link";
import LogoFull from "@/assets/LogoNoBackground.png";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center justify-center ${className}`}>
      <Image src={LogoFull} alt="PLP Logo" width={200} height={150} />
    </Link>
  );
}
