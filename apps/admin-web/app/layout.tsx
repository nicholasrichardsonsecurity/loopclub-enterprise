import './styles.css';

export const metadata = {
  title: 'LoopClub Admin',
  description: 'Painel administrativo LoopClub Enterprise',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
