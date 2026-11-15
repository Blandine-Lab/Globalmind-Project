import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  href?: string;
  variant?: "dark" | "light";
}

export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <div
      className="rounded-lg overflow-hidden shrink-0 ring-1 ring-black/5"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="Globalmind SmartWatch"
        width={size}
        height={size}
        priority
        className="object-cover w-full h-full"
      />
    </div>
  );
}

export function Logo({
  size = 36,
  showWordmark = true,
  href = "/",
  variant = "light",
}: LogoProps) {
  const wordColor = variant === "dark" ? "text-white" : "text-ink";
  const subColor = variant === "dark" ? "text-slate-400" : "text-slate-500";

  const content = (
    <div className="flex items-center gap-3">
      <LogoIcon size={size} />
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <span className={`font-display font-bold ${wordColor} text-lg`}>
            Globalmind <span className="text-brand-gradient">SmartWatch</span>
          </span>
          <span className={`text-[10px] tracking-wider uppercase ${subColor}`}>
            Globalmind.MK.INNOTECH
          </span>
        </div>
      )}
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}