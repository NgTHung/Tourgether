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
import { ArrowLeft, Building2, AlertCircle } from "lucide-react";
import { businessSignup } from "~/actions/auth";
import { useRouter, redirect, useSearchParams } from "next/navigation";
import { cn } from "~/lib/utils";
import { authClient } from "~/server/better-auth/client";

const BusinessSignup = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") ?? "";
	const { data: session, isPending } = authClient.useSession();

	if (!isPending && session) {
		redirect("/");
	}

	const [state, action, pending] = useActionState(businessSignup, undefined);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-2xl">
				{/* Back Button */}
				<Button
					variant="ghost"
					onClick={() =>
						router.push(
							"/signup" +
								(callbackUrl
									? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
									: ""),
						)
					}
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
							<input
								type="hidden"
								name="callbackUrl"
								value={callbackUrl}
							/>
							{/* Organization Name */}
							<div className="space-y-2">
								<Label
									htmlFor="organizationName"
									className={cn(
										state?.errors?.organizationName && "text-destructive",
									)}
								>
									Organization Name <span className="text-destructive">*</span>
								</Label>
								<Input
									id="organizationName"
									name="organizationName"
									type="text"
									placeholder="Rome Adventures Co."
									required
									defaultValue={state?.data?.organizationName}
									className={cn(
										state?.errors?.organizationName &&
											"border-destructive focus-visible:ring-destructive",
									)}
								/>
								{state?.errors?.organizationName && (
									<div className="text-xs text-destructive mt-1 space-y-1">
										{state.errors.organizationName.map((err: string) => (
											<p key={err} className="flex items-center gap-1">
												<AlertCircle className="w-3 h-3" />
												{err}
											</p>
										))}
									</div>
								)}
							</div>

							{/* Username */}
							<div className="space-y-2">
								<Label
									htmlFor="username"
									className={cn(state?.errors?.username && "text-destructive")}
								>
									Username <span className="text-destructive">*</span>
								</Label>
								<Input
									id="username"
									name="username"
									type="text"
									placeholder="romeadventures"
									required
									defaultValue={state?.data?.username}
									className={cn(
										state?.errors?.username &&
											"border-destructive focus-visible:ring-destructive",
									)}
								/>
								{state?.errors?.username && (
									<div className="text-xs text-destructive mt-1 space-y-1">
										{state.errors.username.map((err: string) => (
											<p key={err} className="flex items-center gap-1">
												<AlertCircle className="w-3 h-3" />
												{err}
											</p>
										))}
									</div>
								)}
							</div>

							{/* Email */}
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className={cn(state?.errors?.email && "text-destructive")}
								>
									Email <span className="text-destructive">*</span>
								</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="contact@romeadventures.com"
									required
									defaultValue={state?.data?.email}
									className={cn(
										state?.errors?.email &&
											"border-destructive focus-visible:ring-destructive",
									)}
								/>
								{state?.errors?.email && (
									<div className="text-xs text-destructive mt-1 space-y-1">
										{state.errors.email.map((err: string) => (
											<p key={err} className="flex items-center gap-1">
												<AlertCircle className="w-3 h-3" />
												{err}
											</p>
										))}
									</div>
								)}
							</div>

							{/* Hotline */}
							<div className="space-y-2">
								<Label
									htmlFor="hotline"
									className={cn(state?.errors?.phonenumber && "text-destructive")}
								>
									Hotline <span className="text-destructive">*</span>
								</Label>
								<div className="flex gap-2">
									<Input
										id="hotlinePrefix"
										name="hotlinePrefix"
										type="text"
										placeholder="+1"
										className={cn(
											"w-20",
											state?.errors?.phonenumber &&
												"border-destructive focus-visible:ring-destructive",
										)}
										defaultValue={state?.data?.hotlinePrefix || "+1"}
										required
									/>
									<Input
										id="hotline"
										name="hotline"
										type="tel"
										placeholder="800-555-0123"
										className={cn(
											"flex-1",
											state?.errors?.phonenumber &&
												"border-destructive focus-visible:ring-destructive",
										)}
										required
										defaultValue={state?.data?.hotline}
									/>
								</div>
								{state?.errors?.phonenumber && (
									<div className="text-xs text-destructive mt-1 space-y-1">
										{state.errors.phonenumber.map((err: string) => (
											<p key={err} className="flex items-center gap-1">
												<AlertCircle className="w-3 h-3" />
												{err}
											</p>
										))}
									</div>
								)}
							</div>

							{/* Website (Optional) */}
							{/* <div className="space-y-2">
								<Label
									htmlFor="website"
									className={cn(state?.errors?.website && "text-destructive")}
								>
									Website <span className="text-muted-foreground">(Optional)</span>
								</Label>
								<Input
									id="website"
									name="website"
									type="url"
									placeholder="https://www.romeadventures.com"
									defaultValue={state?.data?.website}
									className={cn(
										state?.errors?.website &&
											"border-destructive focus-visible:ring-destructive",
									)}
								/>
								{state?.errors?.website && (
									<div className="text-xs text-destructive mt-1 space-y-1">
										{state.errors.website.map((err: string) => (
											<p key={err} className="flex items-center gap-1">
												<AlertCircle className="w-3 h-3" />
												{err}
											</p>
										))}
									</div>
								)}
							</div> */}

							{/* Tax ID */}
							{/* <div className="space-y-2">
								<Label
									htmlFor="taxId"
									className={cn(state?.errors?.taxId && "text-destructive")}
								>
									Tax ID <span className="text-destructive">*</span>
								</Label>
								<Input
									id="taxId"
									name="taxId"
									type="text"
									placeholder="12-3456789"
									required
									defaultValue={state?.data?.taxId}
									className={cn(
										state?.errors?.taxId &&
											"border-destructive focus-visible:ring-destructive",
									)}
								/>
								{state?.errors?.taxId ? (
									<div className="text-xs text-destructive mt-1 space-y-1">
										{state.errors.taxId.map((err: string) => (
											<p key={err} className="flex items-center gap-1">
												<AlertCircle className="w-3 h-3" />
												{err}
											</p>
										))}
									</div>
								) : (
									<p className="text-xs text-muted-foreground">
										Your business tax identification number
									</p>
								)}
							</div> */}

							{/* Password */}
							<div className="space-y-2">
								<Label
									htmlFor="password"
									className={cn(state?.errors?.password && "text-destructive")}
								>
									Password <span className="text-destructive">*</span>
								</Label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="••••••••"
									required
									className={cn(
										state?.errors?.password &&
											"border-destructive focus-visible:ring-destructive",
									)}
								/>
								{state?.errors?.password ? (
									<div className="text-xs text-destructive mt-1 space-y-1">
										{state.errors.password.map((err: string) => (
											<p key={err} className="flex items-center gap-1">
												<AlertCircle className="w-3 h-3" />
												{err}
											</p>
										))}
									</div>
								) : (
									<p className="text-xs text-muted-foreground">
										Must be at least 8 characters
									</p>
								)}
							</div>

							{/* Confirm Password */}
							<div className="space-y-2">
								<Label
									htmlFor="confirmPassword"
									className={cn(
										state?.errors?.confirmPassword && "text-destructive",
									)}
								>
									Re-enter Password <span className="text-destructive">*</span>
								</Label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									placeholder="••••••••"
									required
									className={cn(
										state?.errors?.confirmPassword &&
											"border-destructive focus-visible:ring-destructive",
									)}
								/>
								{state?.errors?.confirmPassword && (
									<div className="text-xs text-destructive mt-1 space-y-1">
										{state.errors.confirmPassword.map((err: string) => (
											<p key={err} className="flex items-center gap-1">
												<AlertCircle className="w-3 h-3" />
												{err}
											</p>
										))}
									</div>
								)}
							</div>

							{/* General Error Message */}
							{state?.message && (
								<div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
									<AlertCircle className="w-4 h-4" />
									{state.message}
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

export default BusinessSignup;
