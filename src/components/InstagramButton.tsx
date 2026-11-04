const HREF = "https://www.instagram.com/terraforming.projects/";

export function InstagramButton() {
  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram de TERRA, @terraforming.projects"
      className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-xl transition-transform hover:scale-110"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden className="relative">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    </a>
  );
}
