import "./globals.css";

// Root layout — owns the <html> and <body> tags for the entire app.
// suppressHydrationWarning prevents false positives from browser extensions.
// Classes are kept minimal here; the locale layout adds flex/min-h via its wrapper.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
