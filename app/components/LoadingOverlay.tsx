export default function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="loading-overlay" id="loadingScreen">
      <div className="spinner"></div>
      <div
        className="footer-logo"
        style={{ border: "none", position: "absolute", bottom: "50px" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/tahaqaq-logo.png"
          alt="TAHAQAQ Logo"
          style={{ maxWidth: "200px" }}
        />
      </div>
    </div>
  );
}
