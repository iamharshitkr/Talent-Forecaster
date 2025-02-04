import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex flex-col items-center">
      <Image
        src="/mlb-logo.png"
        className="h-6 sm:h-9"
        alt="MLB Logo"
        width={65}
        height={36}
      />
      <span className="text-white text-xs font-medium mt-2">Talent Forecaster</span>
    </Link>
  );
}
