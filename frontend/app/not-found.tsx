// Root not-found — redirects to locale version
export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ textAlign: "center", padding: "4rem", fontFamily: "system-ui" }}>
          <div style={{ fontSize: "4rem" }}>😿</div>
          <h1>404 — Page not found</h1>
          <a href="/" style={{ color: "#ea580c" }}>← Go home</a>
        </div>
      </body>
    </html>
  );
}
