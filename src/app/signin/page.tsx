"use client";

import { useActionState, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Compass, GraduationCap, Briefcase } from "lucide-react";
import { login } from "~/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "~/server/better-auth/client";
type UserRole = "student" | "business";

const Auth = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") ?? "/";
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();

	if (!isSessionPending && session) {
		if (session.user.finishedOnboardings === false) {
			if (session.user.role === "GUIDE") {
				router.push("/onboarding/student");
			} else if (session.user.role === "ORGANIZATION") {
				router.push("/onboarding/business");
			}
		}
		if (session.user.role === "GUIDE") {
				router.push("/student/dashboard");
		} else if (session.user.role === "ORGANIZATION") {
			router.push("/business/dashboard");
		}
		router.push("/feed");
	}

	const [state, action, pending] = useActionState(login, undefined);
	const [selectedRole, setSelectedRole] = useState<UserRole>("student");

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
				{/* Hero Section */}
				<div className="hidden md:flex flex-col justify-center space-y-6">
					<div className="flex items-center gap-3">
						<div className="p-3 bg-gradient-primary rounded-2xl">
							<Compass className="w-10 h-10 text-primary-foreground" />
						</div>
						<h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
							Tourgether
						</h1>
					</div>
					<div className="space-y-4">
						<h2 className="text-3xl font-bold text-foreground">
							Connect. Explore. Experience.
						</h2>
						<p className="text-lg text-muted-foreground">
							The platform connecting tourism students with
							businesses and travelers worldwide.
						</p>
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 rounded-full bg-primary mt-2" />
								<div>
									<p className="font-semibold">
										For Students
									</p>
									<p className="text-sm text-muted-foreground">
										Find meaningful work and gigs in the
										tourism industry
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 rounded-full bg-primary mt-2" />
								<div>
									<p className="font-semibold">
										For Businesses
									</p>
									<p className="text-sm text-muted-foreground">
										Hire talented students and create
										amazing tours
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Auth Form */}
				<Card className="w-full shadow-elevated">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">Welcome Back</CardTitle>
						<CardDescription>
							Sign in to your account to continue
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={action} className="space-y-6">
							<input
								type="hidden"
								name="callbackUrl"
								value={callbackUrl}
							/>

							{/* Login Form */}
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="name@example.com"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										name="password"
										type="password"
										placeholder="••••••••"
										required
									/>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full"
								variant="gradient"
							>
								Sign In
							</Button>
						</form>

						<div className="mt-6 text-center text-sm">
							<button
								onClick={() =>
									router.push(
										callbackUrl !== "/"
											? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
											: "/signup",
									)
								}
								className="text-primary hover:underline"
							>
								Don&apos;t have an account? Sign up
							</button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Auth;
