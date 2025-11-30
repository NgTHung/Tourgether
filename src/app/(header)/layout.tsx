"use client"

import "~/styles/globals.css";
import Header from "~/components/Header";
import { authClient } from "~/server/better-auth/client";
import { SessionProvider } from "~/components/AuthProvider";
import { Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function HeaderLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const sessionQuery = authClient.useSession();
	const {
		data: session,
		isPending, //loading state
		error, //error object
		refetch, //refetch the session
	} = sessionQuery;

	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!isPending && !session) {
			router.push("/signin?callbackUrl=" + encodeURIComponent(pathname));
		}
		if(!isPending && error) {
			console.error("Error fetching session:", error);
		}
		if(!isPending && session) {
			if(session.user?.finishedOnboardings === false) {
				if(session.user?.role === "GUIDE" && !pathname.startsWith("/onboarding")){
					router.push("/onboarding/student");
				}
				if(session.user?.role === "ORGANIZATION" && !pathname.startsWith("/onboarding")){
					router.push("/onboarding/business");
				}
			}
		}
	}, [isPending, session, router, pathname]);

	if (isPending) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<SessionProvider value={sessionQuery}>
			<Header userRole={session?.user?.role ?? "GUIDE"} />
			{children}
		</SessionProvider>
	);
}
