import React from 'react';

/**
 * Bespoke Vector SVG Iconography for Florería La Carreta.
 * Zero-dependency, lightweight, scalable, and crisp.
 */

export const IconWhatsApp = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.974.532 1.895.814 2.802.814h.001c3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.77-5.774-5.77zm3.385 8.163c-.145.409-.844.755-1.182.799-.337.045-.776.064-2.502-.65-2.079-.86-3.415-2.984-3.518-3.123-.103-.138-.838-1.115-.838-2.127 0-1.011.533-1.509.722-1.714.19-.205.413-.257.551-.257.138 0 .275.002.396.008.127.006.297-.048.465.355.172.414.586 1.431.637 1.536.052.103.086.224.017.362-.069.138-.103.224-.207.345-.103.121-.217.271-.31.364-.103.103-.211.215-.091.422.121.207.537.886 1.152 1.434.793.707 1.462.925 1.669 1.028.207.103.328.086.448-.052.121-.138.517-.603.655-.81.138-.207.276-.172.465-.103.19.069 1.206.569 1.413.672.207.103.345.155.396.241.052.086.052.5-.093.909z" />
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.76.46 3.48 1.333 4.996L2 22l5.164-1.354a9.938 9.938 0 004.846 1.258h.004c5.505 0 9.988-4.478 9.988-9.984 0-5.507-4.482-9.988-9.99-9.988zm0 18.257h-.003a8.27 8.27 0 01-4.218-1.156l-.302-.18-3.136.823.837-3.058-.197-.314a8.27 8.27 0 01-1.267-4.388c0-4.568 3.718-8.286 8.288-8.286 4.568 0 8.286 3.718 8.286 8.286 0 4.569-3.717 8.287-8.288 8.287z" />
  </svg>
);

export const IconDelivery = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <rect x="1" y="4" width="14" height="12" rx="1" />
    <path d="M15 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
    <path d="M4 16h6" />
  </svg>
);

export const IconBotanical = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <path d="M2 22s4.5-8 12-8c4 0 8 2 8 2s-1-4-4.5-7.5C14 5 10 5.5 8 7c-2.5 1.8-3.5 5.5-6 15z" />
    <path d="M8 15c2.5-1 5.5-2.5 8-5" />
    <path d="M12 11c1-1.5 2-2.5 3.5-3.5" />
  </svg>
);

export const IconArtisan = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

export const IconConcierge = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <line x1="8" y1="11.5" x2="8.01" y2="11.5" strokeWidth="2.5" />
    <line x1="12" y1="11.5" x2="12.01" y2="11.5" strokeWidth="2.5" />
    <line x1="16" y1="11.5" x2="16.01" y2="11.5" strokeWidth="2.5" />
  </svg>
);

export const IconMapPin = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const IconChevronLeft = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const IconChevronRight = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const IconArrowRight = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const IconBag = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const IconEye = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconCheck = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconPhone = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const IconFloralPetal = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-icon ${className}`}
    aria-hidden="true"
  >
    <path d="M12 2a4 4 0 0 0-4 4c0 2.5 4 6 4 6s4-3.5 4-6a4 4 0 0 0-4-4z" />
    <path d="M12 22a4 4 0 0 0 4-4c0-2.5-4-6-4-6s-4 3.5-4 6a4 4 0 0 0 4 4z" />
    <path d="M2 12a4 4 0 0 0 4 4c2.5 0 6-4 6-4s-3.5-4-6-4a4 4 0 0 0-4 4z" />
    <path d="M22 12a4 4 0 0 0-4-4c-2.5 0-6 4-6 4s3.5 4 6 4a4 4 0 0 0 4-4z" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
