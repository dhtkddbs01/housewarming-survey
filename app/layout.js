import './globals.css';

export const metadata = {
  title: '집들이 메뉴 설문',
  description: '집들이에 낼 음식을 골라 주세요',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbf6ee',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
