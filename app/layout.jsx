import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '../lib/theme-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata = {
    title: 'Bot Dashboard',
    description: 'Manage your Discord bot from the web.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="monochrome">
            <body className={`${inter.variable} ${jetbrains.variable}`}>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
