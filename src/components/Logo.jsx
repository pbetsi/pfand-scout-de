export default function Logo({ size = 28, municipalLogo = null }) {
  // WHITE-LABEL : si une commune fournit son propre logo, on l'affiche à la place
  if (municipalLogo) {
    return (
      <img
        src={municipalLogo}
        alt="Logo der Kommune"
        width={size}
        height={size}
        className="rounded-full object-contain"
      />
    );
  }

  // Logo par défaut : anneau de recyclage + pièce Pfand
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Pfand-Scout DE Logo"
    >
      <defs>
        <linearGradient id="pfandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C853" />
          <stop offset="100%" stopColor="#00893B" />
        </linearGradient>
      </defs>
      {/* Disque de fond */}
      <circle cx="32" cy="32" r="30" fill="url(#pfandGrad)" />
      {/* 3 flèches de recyclage tournantes */}
      <g fill="#ffffff">
        <polygon points="30,10 40,16 30,22 33,16" transform="rotate(0 32 32)" />
        <polygon points="30,10 40,16 30,22 33,16" transform="rotate(120 32 32)" />
        <polygon points="30,10 40,16 30,22 33,16" transform="rotate(240 32 32)" />
      </g>
      {/* Symbole € au centre (Pfand) */}
      <circle cx="32" cy="32" r="11" fill="#ffffff" />
      <text
        x="32" y="37"
        textAnchor="middle"
        fontSize="15"
        fontWeight="bold"
        fill="#00893B"
        fontFamily="Arial, sans-serif"
      >
        €
      </text>
    </svg>
  );
}