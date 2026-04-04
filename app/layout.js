import "./globals.css";

export const metadata = {
  title: "Canymo — Coaching bien-être pour chiens",
  description: "Programmes personnalisés pour la santé et le bien-être de votre chien",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Canymo",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#1C3D2A"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="Canymo"/>
        <link rel="manifest" href="/manifest.json"/>
        <link rel="apple-touch-icon" href="/icons/icon-192.png"/>
      </head>
      <body>{children}</body>
    </html>
  );
}
