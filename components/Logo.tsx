import Image from "next/image";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
  priority?: boolean;
};

export function Logo({ variant = "light", className = "", priority = false }: LogoProps) {
  return (
    <Image
      src={`/assets/logo-${variant}.png`}
      width={816}
      height={560}
      alt="Дом на Южной"
      className={`site-logo ${className}`}
      priority={priority}
      sizes="(max-width: 680px) 110px, 160px"
    />
  );
}
