import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { ThemeProvider } from "~/hooks/useTheme";

export const metadata: Metadata = {
	title: "Tourgether",
	description: "Made with love",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body>
				<ThemeProvider>
					<div className="min-h-screen bg-background">
						<TRPCReactProvider>{children}</TRPCReactProvider>
					</div>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
