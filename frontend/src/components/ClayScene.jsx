// Decorative clay-style scene for the welcome header: Robic building, signal tower,
// clouds and trees. Purely decorative (aria-hidden), secondary to the data.
import React from "react";

export default function ClayScene({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 460 170" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="cs-cloud" cx="40%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#F8E3E0" />
        </radialGradient>
        <linearGradient id="cs-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF4F2" />
          <stop offset="1" stopColor="#F6D6D3" />
        </linearGradient>
        <linearGradient id="cs-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F78C8F" />
          <stop offset="1" stopColor="#D43C42" />
        </linearGradient>
        <linearGradient id="cs-tower" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F2777C" />
          <stop offset="1" stopColor="#E5484D" />
        </linearGradient>
        <radialGradient id="cs-tree" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#a7e3a0" />
          <stop offset="1" stopColor="#5fae63" />
        </radialGradient>
        <linearGradient id="cs-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBEAE7" />
          <stop offset="1" stopColor="#F5DCD8" />
        </linearGradient>
        <filter id="cs-soft" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#B4474B" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* ground */}
      <ellipse cx="270" cy="156" rx="200" ry="14" fill="url(#cs-ground)" />

      {/* clouds */}
      <g filter="url(#cs-soft)">
        <g fill="url(#cs-cloud)">
          <ellipse cx="78" cy="62" rx="40" ry="20" />
          <circle cx="62" cy="52" r="18" />
          <circle cx="90" cy="46" r="22" />
        </g>
        <g fill="url(#cs-cloud)" opacity="0.95">
          <ellipse cx="402" cy="48" rx="34" ry="16" />
          <circle cx="392" cy="38" r="16" />
          <circle cx="414" cy="36" r="13" />
        </g>
      </g>

      {/* signal tower */}
      <g filter="url(#cs-soft)" stroke="url(#cs-tower)" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M168 150 186 58 204 150" />
        <path d="M175 118h22M179 96h14M172 134l28-16M200 134l-28-16" strokeWidth="3.5" />
      </g>
      <circle cx="186" cy="52" r="7" fill="#E5484D" />
      <g stroke="#F78C8F" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M171 38a21 21 0 0 0 0 28M201 38a21 21 0 0 1 0 28" />
        <path d="M161 28a35 35 0 0 0 0 48M211 28a35 35 0 0 1 0 48" opacity="0.6" />
      </g>

      {/* building */}
      <g filter="url(#cs-soft)">
        <rect x="262" y="78" width="134" height="74" rx="10" fill="url(#cs-wall)" />
        <path d="M252 84 296 54h82l28 30Z" fill="url(#cs-roof)" />
        <rect x="290" y="42" width="78" height="30" rx="8" fill="#ffffff" />
        <text x="329" y="63" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif"
          fontWeight="800" fontSize="17" fill="#E5484D">Robic</text>
        <rect x="314" y="110" width="30" height="42" rx="5" fill="#F78C8F" />
        <rect x="276" y="98" width="26" height="18" rx="4" fill="#FCA5A5" />
        <rect x="356" y="98" width="26" height="18" rx="4" fill="#FCA5A5" />
      </g>

      {/* trees */}
      <g filter="url(#cs-soft)">
        <rect x="236" y="134" width="5" height="16" rx="2" fill="#8a6a4f" />
        <circle cx="238.5" cy="128" r="14" fill="url(#cs-tree)" />
        <rect x="414" y="132" width="5" height="18" rx="2" fill="#8a6a4f" />
        <circle cx="416.5" cy="124" r="16" fill="url(#cs-tree)" />
        <circle cx="140" cy="142" r="11" fill="url(#cs-tree)" />
        <circle cx="122" cy="146" r="8" fill="url(#cs-tree)" />
      </g>
    </svg>
  );
}
