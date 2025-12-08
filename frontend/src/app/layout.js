
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
    title: "BridgeGuard AI - Validator Dashboard",
    description: "Advanced QIE Blockchain Validator & Security Monitor",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={outfit.className}>{children}</body>
        </html>
    );
}
