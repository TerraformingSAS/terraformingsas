import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function PhoneIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path
        d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.8 19.8 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.52 3.48A11.94 11.94 0 0012.06 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.9 11.9 0 005.76 1.47h.01c6.56 0 11.9-5.33 11.9-11.9 0-3.18-1.24-6.16-3.45-8.44zM12.07 21.7a9.8 9.8 0 01-5-1.37l-.36-.21-3.74.98 1-3.64-.24-.37a9.8 9.8 0 01-1.5-5.19c0-5.42 4.42-9.83 9.85-9.83 2.63 0 5.1 1.02 6.96 2.88a9.77 9.77 0 012.88 6.96c0 5.42-4.42 9.79-9.85 9.79zm5.4-7.34c-.29-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.94 1.15-.17.2-.35.22-.64.07-.29-.15-1.23-.45-2.34-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.19-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.52.07-.79.36-.27.29-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.56-.35z" />
    </svg>
  );
}

export function WetlandIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M12 3c-2.5 4.5-6 7-6 10.5a6 6 0 0012 0C18 10 14.5 7.5 12 3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20c2-.8 4-.8 6 0s4 .8 6 0 4-.8 6 0" strokeLinecap="round" />
    </svg>
  );
}

export function GreenZonesIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M12 22v-7" strokeLinecap="round" />
      <path d="M7 10c0-4 2.5-7 5-7s5 3 5 7c0 2.5-1.5 4-3 5H10c-1.5-1-3-2.5-3-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 14c-2 1-3 3-3 5h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 14c2 1 3 3 3 5h-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SafeIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ValueIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7h7v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ParkIcon(props: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M12 22V12" strokeLinecap="round" />
      <path d="M12 12c-3-1-5-3.5-5-6a5 5 0 0110 0c0 2.5-2 5-5 6z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 22h14" strokeLinecap="round" />
    </svg>
  );
}

export function TrailIcon(props: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M4 19c3-2 5-2 8 0s5 2 8 0" strokeLinecap="round" />
      <path d="M4 13c3-2 5-2 8 0s5 2 8 0" strokeLinecap="round" />
      <path d="M4 7c3-2 5-2 8 0s5 2 8 0" strokeLinecap="round" />
    </svg>
  );
}

export function BikeIcon(props: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M12 17.5l-2.5-6h5l3 6M9.5 11.5L8 8h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RecIcon(props: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MeetIcon(props: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" strokeLinecap="round" />
      <circle cx="10" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
    </svg>
  );
}

export function PetIcon(props: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <ellipse cx="12" cy="16" rx="5" ry="4" />
      <circle cx="6" cy="9" r="2" />
      <circle cx="10" cy="6.5" r="2" />
      <circle cx="14" cy="6.5" r="2" />
      <circle cx="18" cy="9" r="2" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M3 11l9-8 9 8v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StoreIcon(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M3 9l1.5-5h15L21 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h16v11H4z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HectareIcon(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3v18M3 7l9 4 9-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
