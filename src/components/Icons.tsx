import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

export const UploadCloud: React.FC<IconProps> = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} {...rest}>
    <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.8-1.5A4.5 4.5 0 1 1 19 18" />
    <path d="M12 12v8" />
    <path d="M8.5 14.5 12 11l3.5 3.5" />
  </svg>
);

export const Sparkle: React.FC<IconProps> = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} {...rest}>
    <path d="M12 3l1.7 3.9L18 8.5l-3.9 1.7L12 14l-2.1-3.8L6 8.5l4.1-1.6L12 3z" />
    <circle cx="18.5" cy="5.5" r="1" />
    <circle cx="5.5" cy="17.5" r="1" />
  </svg>
);

export const ChevronRight: React.FC<IconProps> = ({ className, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} {...rest}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);


