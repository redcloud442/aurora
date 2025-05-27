import Image from "next/image";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="relative min-h-screen h-full flex items-center justify-center p-4 sm:p-0 overflow-hidden">
      {/* Background image */}
      <Image
        src="/assets/bg/BACKGROUND.webp"
        alt="Aurora Background"
        width={1980}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover z-0"
        priority
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-40 z-10" />

      {/* Top logo */}

      {/* Main content */}
      <div className="relative z-30 w-full max-w-md">{children}</div>

      {/* Bottom logo */}
    </section>
  );
}
