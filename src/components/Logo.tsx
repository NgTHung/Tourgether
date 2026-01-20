"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

interface LogoProps {
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
	showText?: boolean;
	inverted?: boolean;
}

const sizeMap = {
	sm: { logo: 24, text: "text-lg" },
	md: { logo: 32, text: "text-xl" },
	lg: { logo: 40, text: "text-2xl" },
	xl: { logo: 56, text: "text-4xl" },
};

const Logo = ({
	size = "md",
	className,
	showText = true,
	inverted = false,
}: LogoProps) => {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		// Check the actual applied theme from the document
		const checkTheme = () => {
			setIsDark(document.documentElement.classList.contains("dark"));
		};

		checkTheme();

		// Listen for theme changes
		const observer = new MutationObserver(checkTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	// If inverted, flip the theme logic (for backgrounds that are opposite of theme)
	const showDarkLogo = inverted ? !isDark : isDark;

	const { logo: logoSize, text: textSize } = sizeMap[size];

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<div
				className="relative"
				style={{ width: logoSize, height: logoSize }}
			>
				{/* Light mode logo (dark logo on light background) */}
				<Image
					src="/assets/logo-light.png"
					alt="Tourgether Logo"
					width={logoSize}
					height={logoSize}
					className={cn(
						"absolute inset-0 transition-opacity duration-200",
						showDarkLogo ? "opacity-0" : "opacity-100",
					)}
					priority
				/>
				{/* Dark mode logo (light logo on dark background) */}
				<Image
					src="/assets/logo-dark.png"
					alt="Tourgether Logo"
					width={logoSize}
					height={logoSize}
					className={cn(
						"absolute inset-0 transition-opacity duration-200",
						showDarkLogo ? "opacity-100" : "opacity-0",
					)}
					priority
				/>
			</div>
			{showText && (
				<span className={cn("font-bold", textSize)}>Tourgether</span>
			)}
		</div>
	);
};

export default Logo;
