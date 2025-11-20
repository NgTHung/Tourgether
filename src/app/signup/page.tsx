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
import { signup } from "~/actions/auth";
import { useRouter } from "next/navigation";
type UserRole = "student" | "business" | "traveler";

const Auth = () => {
	const router = useRouter();
	const [state, action, pending] = useActionState(signup, undefined);
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
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 rounded-full bg-primary mt-2" />
								<div>
									<p className="font-semibold">
										For Travelers
									</p>
									<p className="text-sm text-muted-foreground">
										Book unique experiences and discover the
										world
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
							Create an account to start your journey
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={action} className="space-y-6">
							{/* Role Selection - Horizontal Segmented Control */}
							<div className="space-y-3">
								<Label className="text-base font-semibold">
									Select Your Role
								</Label>
								<div className="relative bg-muted rounded-lg p-1">
									{/* Sliding Background */}
									<div
										className={`absolute top-1 bottom-1 w-1/3 bg-primary rounded-md shadow-sm transition-transform duration-300 ease-out ${
											selectedRole === "student"
												? "translate-x-0"
												: selectedRole === "business"
													? "translate-x-full"
													: "translate-x-[calc(200%-0.5rem)]"
										}`}
									/>

									{/* Role Options */}
									<div className="relative grid grid-cols-3">
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

										<button
											type="button"
											onClick={() =>
												setSelectedRole("traveler")
											}
											className={`relative flex flex-col items-center gap-2 p-4 text-center transition-colors ${
												selectedRole === "traveler"
													? "text-primary-foreground font-medium"
													: "text-muted-foreground hover:text-foreground"
											}`}
										>
											<Compass className="w-6 h-6" />
											<div>
												<div className="font-medium text-sm">
													Traveler
												</div>
												<div className="text-xs opacity-75">
													Explorer
												</div>
											</div>
										</button>
									</div>
								</div>
							</div>

							{/* Login Form */}
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
                                        name="email"
										placeholder="name@example.com"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										type="password"
                                        name="password"
										placeholder="••••••••"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="confirm">
										Confirm Password
									</Label>
									<Input
										id="confirm"
                                        name="confirmPassword"
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
								Sign Up
							</Button>
						</form>

						<div className="mt-6 text-center text-sm">
							<button
								onClick={() => router.push("/signin")}
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

export default Auth;
