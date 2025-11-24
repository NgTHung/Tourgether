"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Compass, GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import { useRouter, redirect, useSearchParams } from "next/navigation";
import { authClient } from "~/server/better-auth/client";

type UserRole = "student" | "business";

const Signup = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl");
	const { data: session, isPending } = authClient.useSession();

	if (!isPending && session) {
		redirect("/");
	}

	const [selectedRole, setSelectedRole] = useState<UserRole>("student");

	const handleContinue = () => {
		const base =
			selectedRole === "student" ? "/signup/student" : "/signup/business";
		const url = callbackUrl
			? `${base}?callbackUrl=${encodeURIComponent(callbackUrl)}`
			: base;
		router.push(url);
	};

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
								<div className="w-2 h-2 rounded-full bg-accent mt-2" />
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
						<CardTitle className="text-2xl">Get Started</CardTitle>
						<CardDescription>
							Choose your account type to continue
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{/* Role Selection - Horizontal Segmented Control */}
							<div className="space-y-3">
								<div className="text-base font-semibold mb-2">
									Select Your Role
								</div>
								<div className="relative bg-muted rounded-lg p-1">
									{/* Sliding Background */}
									<div
										className={`absolute top-1 bottom-1 w-1/2 bg-primary rounded-md shadow-sm transition-transform duration-300 ease-out ${
											selectedRole === "student"
												? "translate-x-0"
												: "translate-x-full"
										}`}
									/>

									{/* Role Options */}
									<div className="relative grid grid-cols-2">
										<button
											type="button"
											onClick={() =>
												setSelectedRole("student")
											}
											className={`relative flex flex-col items-center gap-2 p-4 text-center transition-colors ${
												selectedRole === "student"
													? "text-primary-foreground font-medium"
													: "text-muted-foreground hover:text-foreground"
											}`}
										>
											<GraduationCap className="w-6 h-6" />
											<div>
												<div className="font-medium text-sm">
													Student
												</div>
												<div className="text-xs opacity-75">
													Tour Guide
												</div>
											</div>
										</button>

										<button
											type="button"
											onClick={() =>
												setSelectedRole("business")
											}
											className={`relative flex flex-col items-center gap-2 p-4 text-center transition-colors ${
												selectedRole === "business"
													? "text-primary-foreground font-medium"
													: "text-muted-foreground hover:text-foreground"
											}`}
										>
											<Briefcase className="w-6 h-6" />
											<div>
												<div className="font-medium text-sm">
													Business
												</div>
												<div className="text-xs opacity-75">
													Tour Operator
												</div>
											</div>
										</button>
									</div>
								</div>
							</div>

							{/* Continue Button */}
							<Button
								onClick={handleContinue}
								type="button"
								className="w-full"
								variant="gradient"
								size="lg"
							>
								Continue as {selectedRole === "student" ? "Student" : "Business"}
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>
						</div>

						<div className="mt-6 text-center text-sm">
							<button
								onClick={() =>
									router.push(
										callbackUrl
											? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
											: "/signin",
									)
								}
								className="text-primary hover:underline"
							>
								Already have an account? Sign in
							</button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Signup;
