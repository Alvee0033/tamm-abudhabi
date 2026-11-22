export default function Footer() {
  return (
    <>
      <div className="footer-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/tahaqaq-logo.png"
          alt="TAHAQAQ Logo"
          style={{ maxWidth: "200px" }}
        />
      </div>
      
      <a href="#" className="support-link">
        <span
          style={{
            border: "1px solid #159b9a",
            borderRadius: "50%",
            display: "inline-block",
            width: "14px",
            height: "14px",
            textAlign: "center",
            lineHeight: "14px",
            fontSize: "10px",
          }}
        >
          !
        </span>
        Need Support?
      </a>
    </>
  );
}
