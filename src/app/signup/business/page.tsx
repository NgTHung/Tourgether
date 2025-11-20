"use client";

import { useActionState } from "react";
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
import { ArrowLeft, Building2 } from "lucide-react";
import { signup } from "~/actions/auth";
import { useRouter } from "next/navigation";

const BusinessSignup = () => {
	const router = useRouter();
	const [state, action, pending] = useActionState(signup, undefined);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-2xl">
				{/* Back Button */}
				<Button
					variant="ghost"
					onClick={() => router.push("/signup")}
					className="mb-4"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Role Selection
				</Button>

				{/* Signup Form */}
				<Card className="shadow-elevated">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<div className="p-3 bg-accent/10 rounded-2xl">
								<Building2 className="w-10 h-10 text-accent" />
							</div>
						</div>
						<CardTitle className="text-2xl">Business Registration</CardTitle>
						<CardDescription>
							Register your business and start creating amazing tours
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={action} className="space-y-6">
							{/* Organization Name */}
							<div className="space-y-2">
								<Label htmlFor="organizationName">
									Organization Name <span className="text-destructive">*</span>
								</Label>
								<Input
									id="organizationName"
									name="organizationName"
									type="text"
									placeholder="Rome Adventures Co."
									required
								/>
							</div>

							{/* Username */}
							<div className="space-y-2">
								<Label htmlFor="username">
									Username <span className="text-destructive">*</span>
								</Label>
								<Input
									id="username"
									name="username"
									type="text"
									placeholder="romeadventures"
									required
								/>
							</div>

							{/* Email */}
							<div className="space-y-2">
								<Label htmlFor="email">
									Email <span className="text-destructive">*</span>
								</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="contact@romeadventures.com"
									required
								/>
							</div>

							{/* Hotline */}
							<div className="space-y-2">
								<Label htmlFor="hotline">
									Hotline <span className="text-destructive">*</span>
								</Label>
								<div className="flex gap-2">
									<Input
										id="hotlinePrefix"
										name="hotlinePrefix"
										type="text"
										placeholder="+1"
										className="w-20"
										defaultValue="+1"
										required
									/>
									<Input
										id="hotline"
										name="hotline"
										type="tel"
										placeholder="800-555-0123"
										className="flex-1"
										required
									/>
								</div>
							</div>

							{/* Website (Optional) */}
							<div className="space-y-2">
								<Label htmlFor="website">
									Website <span className="text-muted-foreground">(Optional)</span>
								</Label>
								<Input
									id="website"
									name="website"
									type="url"
									placeholder="https://www.romeadventures.com"
								/>
							</div>

							{/* Tax ID */}
							<div className="space-y-2">
								<Label htmlFor="taxId">
									Tax ID <span className="text-destructive">*</span>
								</Label>
								<Input
									id="taxId"
									name="taxId"
									type="text"
									placeholder="12-3456789"
									required
								/>
								<p className="text-xs text-muted-foreground">
									Your business tax identification number
								</p>
							</div>

							{/* Password */}
							<div className="space-y-2">
								<Label htmlFor="password">
									Password <span className="text-destructive">*</span>
								</Label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="••••••••"
									required
								/>
								<p className="text-xs text-muted-foreground">
									Must be at least 8 characters
								</p>
							</div>

							{/* Confirm Password */}
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">
									Re-enter Password <span className="text-destructive">*</span>
								</Label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									placeholder="••••••••"
									required
								/>
							</div>

							{/* Error Message */}
							{state?.errors && (
								<div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
									{Object.values(state.errors).flat().join(", ")}
								</div>
							)}

							{/* Submit Button */}
							<Button
								type="submit"
								className="w-full"
								variant="gradient"
								disabled={pending}
							>
								{pending ? "Creating Account..." : "Create Business Account"}
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

export default BusinessSignup;
