"use client";

import { useActionState, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { ArrowLeft, GraduationCap, AlertCircle } from "lucide-react";
import { studentSignup } from "~/actions/auth";
import { useRouter, redirect, useSearchParams } from "next/navigation";
import { cn } from "~/lib/utils";
import { authClient } from "~/server/better-auth/client";

const StudentSignup = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "";
	const { data: session, isPending } = authClient.useSession();

	if (!isPending && session) {
		redirect("/");
	}

	const [state, action, pending] = useActionState(studentSignup, {
		data: {
			gender: "male",
		},
	});

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
							<div className="p-3 bg-primary/10 rounded-2xl">
								<GraduationCap className="w-10 h-10 text-primary" />
							</div>
						</div>
						<CardTitle className="text-2xl">Student Registration</CardTitle>
						<CardDescription>
							Join as a student tour guide and start your adventure
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={action} className="space-y-6">
							<input
								type="hidden"
								name="callbackUrl"
								value={callbackUrl}
							/>
							{/* Full Name */}
							<div className="space-y-2">
								<Label
									htmlFor="fullName"
									className={cn(state?.errors?.fullname && "text-destructive")}
								>
									Full Name <span className="text-destructive">*</span>
								</Label>
								<Input
									id="fullName"
									name="fullName"
									type="text"
									placeholder="John Doe"
									required
									defaultValue={state?.data?.fullname}
									className={cn(
										state?.errors?.fullname &&
											"border-destructive focus-visible:ring-destructive",
									)}
								/>
								{state?.errors?.fullname && (
									<div className="text-xs text-destructive mt-1 space-y-1">
										{state.errors.fullname.map((err: string) => (
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
									placeholder="johndoe"
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
									placeholder="john.doe@university.edu"
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

							{/* Gender */}
							<div className="space-y-3">
								<Label
									className={cn(state?.errors?.gender && "text-destructive")}
								>
									Gender <span className="text-destructive">*</span>
								</Label>
								<RadioGroup
									defaultValue={state?.data?.gender || "male"}
									className="flex gap-4"
									name="gender"
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="male" id="male" />
										<Label htmlFor="male" className="font-normal cursor-pointer">
											Male
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="female" id="female" />
										<Label htmlFor="female" className="font-normal cursor-pointer">
											Female
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="other" id="other" />
										<Label htmlFor="other" className="font-normal cursor-pointer">
											Other
										</Label>
									</div>
								</RadioGroup>
								{state?.errors?.gender && (
									<div className="text-xs text-destructive mt-1 space-y-1">
										{state.errors.gender.map((err: string) => (
											<p key={err} className="flex items-center gap-1">
												<AlertCircle className="w-3 h-3" />
												{err}
											</p>
										))}
									</div>
								)}
							</div>

							{/* Phone Number */}
							<div className="space-y-2">
								<Label
									htmlFor="phone"
									className={cn(state?.errors?.phonenumber && "text-destructive")}
								>
									Phone Number <span className="text-destructive">*</span>
								</Label>
								<div className="flex gap-2">
									<Input
										id="phonePrefix"
										name="phonePrefix"
										type="text"
										placeholder="+1"
										className={cn(
											"w-20",
											state?.errors?.phonenumber &&
												"border-destructive focus-visible:ring-destructive",
										)}
										defaultValue={state?.data?.phonePrefix || "+1"}
										required
									/>
									<Input
										id="phone"
										name="phone"
										type="tel"
										placeholder="555-123-4567"
										className={cn(
											"flex-1",
											state?.errors?.phonenumber &&
												"border-destructive focus-visible:ring-destructive",
										)}
										required
										defaultValue={state?.data?.phone}
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
								{pending ? "Creating Account..." : "Create Student Account"}
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

export default StudentSignup;
