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
import { Compass, GraduationCap, Briefcase, AlertCircle } from "lucide-react";
import { studentSignup, businessSignup } from "~/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "~/lib/utils";
import { authClient } from "~/server/better-auth/client";

type UserRole = "student" | "business";

const Signup = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") ?? "";
	const { data: session, isPending } = authClient.useSession();

	if (!isPending && session) {
		router.push("/");
	}

	const [selectedRole, setSelectedRole] = useState<UserRole>("student");

	const [studentState, studentAction, studentPending] = useActionState(studentSignup, {
		data: {
			gender: "male", 
		},
	});

	const [businessState, businessAction, businessPending] = useActionState(businessSignup, undefined);

	const state = selectedRole === "student" ? studentState : businessState;
	const action = selectedRole === "student" ? studentAction : businessAction;
	const pending = selectedRole === "student" ? studentPending : businessPending;

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-start">
				{/* Hero Section */}
				<div className="hidden md:flex flex-col justify-center space-y-6 sticky top-8">
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

				{/* Signup Form */}
				<Card className="w-full shadow-elevated">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<div className={cn(
								"p-3 rounded-2xl",
								selectedRole === "student" ? "bg-primary/10" : "bg-accent/10"
							)}>
								{selectedRole === "student" ? (
									<GraduationCap className="w-10 h-10 text-primary" />
								) : (
									<Briefcase className="w-10 h-10 text-accent" />
								)}
							</div>
						</div>
						<CardTitle className="text-2xl">
							{selectedRole === "student" ? "Student Registration" : "Business Registration"}
						</CardTitle>
						<CardDescription>
							{selectedRole === "student" 
								? "Join as a student tour guide and start your adventure"
								: "Register your business and start creating amazing tours"
							}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Role Selection - Horizontal Segmented Control */}
						<div className="space-y-3 mb-6">
							<div className="text-sm font-semibold">
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
										onClick={() => setSelectedRole("student")}
										className={`relative flex flex-col items-center gap-2 p-3 text-center transition-colors ${
											selectedRole === "student"
												? "text-primary-foreground font-medium"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										<GraduationCap className="w-5 h-5" />
										<div>
											<div className="font-medium text-xs">
												Student
											</div>
										</div>
									</button>

									<button
										type="button"
										onClick={() => setSelectedRole("business")}
										className={`relative flex flex-col items-center gap-2 p-3 text-center transition-colors ${
											selectedRole === "business"
												? "text-primary-foreground font-medium"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										<Briefcase className="w-5 h-5" />
										<div>
											<div className="font-medium text-xs">
												Business
											</div>
										</div>
									</button>
								</div>
							</div>
						</div>

						<form action={action} className="space-y-4">
							<input
								type="hidden"
								name="callbackUrl"
								value={callbackUrl}
							/>

							{/* Student Form Fields */}
							{selectedRole === "student" && (
								<>
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
								</>
							)}

							{/* Business Form Fields */}
							{selectedRole === "business" && (
								<>
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
								</>
							)}

							{/* Common Fields - Password */}
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
								{pending ? "Creating Account..." : `Create ${selectedRole === "student" ? "Student" : "Business"} Account`}
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

export default Signup;
