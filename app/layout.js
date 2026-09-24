import './globals.css';

export const metadata = {
  title: 'Get Into Snackin. | Britannia Snackin',
  description: 'Every face makes the Snackin community.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
