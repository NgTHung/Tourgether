"use client";

import { createContext, useContext } from "react";
import { type authClient } from "~/server/better-auth/client";

type SessionResult = ReturnType<typeof authClient.useSession>;

const SessionContext = createContext<SessionResult | null>(null);

export const useSession = () => {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error("useSession must be used within a SessionProvider");
	}
	return context;
};

export const SessionProvider = ({
	children,
	value,
}: {
	children: React.ReactNode;
	value: SessionResult;
}) => {
	return (
		<SessionContext.Provider value={value}>
			{children}
		</SessionContext.Provider>
	);
};
