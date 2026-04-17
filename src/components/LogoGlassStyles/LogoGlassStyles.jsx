// ─── LogoGlassStyles — shared between Login & Signup ─────────────────────────
// ضيف الكومبوننت ده في ملف مشترك زي components/LogoGlassStyles.jsx
// أو كوبيه في نفس الملف مؤقتاً

export default function LogoGlassStyles() {
  return (
    <style jsx global>{`
      /* ── Glassmorphism logo container ── */
      .logo-glass-wrapper {
        display: flex;
        justify-content: center;
        padding: 24px 24px 0;
      }

      .logo-glass-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        border-radius: 18px;
        /* glass effect */
        background: rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.35);
        box-shadow:
          0 4px 24px rgba(41, 85, 87, 0.12),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
        text-decoration: none;
        transition:
          transform 0.22s ease,
          box-shadow 0.22s ease,
          background 0.22s ease;
      }

      .logo-glass-link:hover {
        transform: translateY(-3px) scale(1.06);
        background: rgba(255, 255, 255, 0.28);
        box-shadow:
          0 8px 32px rgba(41, 85, 87, 0.18),
          inset 0 1px 0 rgba(255, 255, 255, 0.6);
      }

      .logo-glass-link:active {
        transform: scale(0.96);
      }

      /* make sure logo img doesn't overflow */
      .logo-glass-link img {
        object-fit: contain;
        border-radius: 4px;
      }
    `}</style>
  );
}
