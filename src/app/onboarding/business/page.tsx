"use client";

import { useEffect, useState, useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Briefcase, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "~/server/better-auth/client";
import { updateBusinessProfile } from "~/actions/onboarding";

const BusinessOnboarding = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl");
	
	const [taxId, setTaxId] = useState("");
	const [website, setWebsite] = useState("");
	const [slogan, setSlogan] = useState("");
	
	const [state, formAction, isPending] = useActionState(updateBusinessProfile, null);

	const { data: session, isPending: isSessionPending } =
		authClient.useSession();

	useEffect(() => {
		if (!isSessionPending && !session) {
			router.push(
				"/signin?callbackUrl=" +
					encodeURIComponent("/onboarding/business"),
			);
		}
		if (!isSessionPending && session) {
			if (session.user.finishedOnboardings === true) {
				if (session.user.role === "GUIDE") {
					router.push("/student/dashboard");
				} else {
					router.push("/business/dashboard");
				}
			}
		}
	}, [isSessionPending, session, router]);

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl shadow-elevated">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<div className="p-3 bg-primary/10 rounded-2xl">
							<Briefcase className="w-10 h-10 text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl">
						Complete Your Business Profile
					</CardTitle>
					<CardDescription>
						Provide your business details to start creating tours
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={formAction} className="space-y-6">
                        <input type="hidden" name="callbackUrl" value={callbackUrl || ""} />
						{/* Tax ID */}
						<div className="space-y-2">
							<Label
								htmlFor="taxId"
								className={
									state?.errors?.taxId ? "text-destructive" : ""
								}
							>
								Tax ID{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="taxId"
                                name="taxId"
								value={taxId}
								onChange={(e) => setTaxId(e.target.value)}
								placeholder="e.g., 123456789"
								className={
									state?.errors?.taxId ? "border-destructive" : ""
								}
							/>
							{state?.errors?.taxId && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="w-3 h-3" />
									{state.errors.taxId[0]}
								</p>
							)}
						</div>

						{/* Website */}
						<div className="space-y-2">
							<Label
								htmlFor="website"
								className={
									state?.errors?.website ? "text-destructive" : ""
								}
							>
								Website (Optional)
							</Label>
							<Input
								id="website"
                                name="website"
								type="url"
								value={website}
								onChange={(e) => setWebsite(e.target.value)}
								placeholder="https://www.yourcompany.com"
								className={
									state?.errors?.website ? "border-destructive" : ""
								}
							/>
							{state?.errors?.website && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="w-3 h-3" />
									{state.errors.website[0]}
								</p>
							)}
						</div>

						{/* Slogan */}
						<div className="space-y-2">
							<Label
								htmlFor="slogan"
								className={
									state?.errors?.slogan ? "text-destructive" : ""
								}
							>
								Company Slogan{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Textarea
								id="slogan"
                                name="slogan"
								value={slogan}
								onChange={(e) => setSlogan(e.target.value)}
								placeholder="Describe what makes your company unique..."
								className={`min-h-[100px] ${state?.errors?.slogan ? "border-destructive" : ""}`}
								maxLength={500}
							/>
							<p className="text-xs text-muted-foreground">
								{slogan.length}/500 characters
							</p>
							{state?.errors?.slogan && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="w-3 h-3" />
									{state.errors.slogan[0]}
								</p>
							)}
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-4">
							<Button
								type="submit"
                                name="intent"
                                value="skip"
								variant="outline"
								className="flex-1"
								disabled={isPending}
							>
								Skip for Now
							</Button>
							<Button
								type="submit"
                                name="intent"
                                value="submit"
								variant="gradient"
								className="flex-1"
								disabled={isPending}
							>
								{isPending
									? "Completing..."
									: "Complete Profile"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default BusinessOnboarding;
