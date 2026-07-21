type SocialLinksProps = {
  className?: string;
  showLabels?: boolean;
};

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.35" cy="6.75" r="1" className="social-icon-fill" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.6 3c.35 2.35 1.68 3.75 4 4.18v3.23a8.86 8.86 0 0 1-4-1.13v6.08a5.84 5.84 0 1 1-5.03-5.79v3.27a2.62 2.62 0 1 0 1.82 2.5V3h3.21Z" />
    </svg>
  );
}

export function SocialLinks({ className = "", showLabels = true }: SocialLinksProps) {
  return (
    <div className={`social-links ${className}`.trim()}>
      <a
        href="https://www.instagram.com/dom_na_yuzhnoy/"
        target="_blank"
        rel="noreferrer"
        aria-label="Открыть официальный Инстаграм Дома на Южной"
      >
        <InstagramIcon />
        {showLabels && <span className="social-label">Инстаграм</span>}
      </a>
      <a
        href="https://www.tiktok.com/@dom_na_yuzhnoy"
        target="_blank"
        rel="noreferrer"
        aria-label="Открыть официальный ТикТок Дома на Южной"
      >
        <TikTokIcon />
        {showLabels && <span className="social-label">ТикТок</span>}
      </a>
    </div>
  );
}
