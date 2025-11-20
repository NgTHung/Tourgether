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
import { ArrowLeft, GraduationCap } from "lucide-react";
import { signup } from "~/actions/auth";
import { useRouter } from "next/navigation";

const StudentSignup = () => {
	const router = useRouter();
	const [state, action, pending] = useActionState(signup, undefined);
	const [gender, setGender] = useState<string>("male");

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
							{/* Full Name */}
							<div className="space-y-2">
								<Label htmlFor="fullName">
									Full Name <span className="text-destructive">*</span>
								</Label>
								<Input
									id="fullName"
									name="fullName"
									type="text"
									placeholder="John Doe"
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
									placeholder="johndoe"
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
									placeholder="john.doe@university.edu"
									required
								/>
							</div>

							{/* Gender */}
							<div className="space-y-3">
								<Label>
									Gender <span className="text-destructive">*</span>
								</Label>
								<RadioGroup
									value={gender}
									onValueChange={setGender}
									className="flex gap-4"
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
								<input type="hidden" name="gender" value={gender} />
							</div>

							{/* Phone Number */}
							<div className="space-y-2">
								<Label htmlFor="phone">
									Phone Number <span className="text-destructive">*</span>
								</Label>
								<div className="flex gap-2">
									<Input
										id="phonePrefix"
										name="phonePrefix"
										type="text"
										placeholder="+1"
										className="w-20"
										defaultValue="+1"
										required
									/>
									<Input
										id="phone"
										name="phone"
										type="tel"
										placeholder="555-123-4567"
										className="flex-1"
										required
									/>
								</div>
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
								{pending ? "Creating Account..." : "Create Student Account"}
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

export default StudentSignup;
