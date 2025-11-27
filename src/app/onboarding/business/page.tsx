"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { api } from "~/trpc/react";
import { toast } from "sonner";

const BusinessOnboarding = () => {
	const router = useRouter();
	const [taxId, setTaxId] = useState("");
	const [website, setWebsite] = useState("");
	const [slogan, setSlogan] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const updateOrgMutation = api.organization.updateOrganization.useMutation({
		onSuccess: () => {
			toast.success("Profile completed successfully!");
			router.push("/feed");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to complete profile");
		},
	});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!taxId.trim()) {
			newErrors.taxId = "Tax ID is required";
		} else if (isNaN(Number(taxId))) {
			newErrors.taxId = "Tax ID must be a valid number";
		}

		if (website && !isValidUrl(website)) {
			newErrors.website = "Please enter a valid URL";
		}

		if (!slogan.trim()) {
			newErrors.slogan = "Slogan is required";
		} else if (slogan.length > 500) {
			newErrors.slogan = "Slogan must be less than 500 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const isValidUrl = (url: string) => {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			await updateOrgMutation.mutateAsync({
				taxID: parseInt(taxId, 10),
				websiteURL: website || undefined,
				slogan,
			});
		} catch (error) {
			console.error("Onboarding error:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSkip = () => {
		router.push("/feed");
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl shadow-elevated">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<div className="p-3 bg-accent/10 rounded-2xl">
							<Briefcase className="w-10 h-10 text-accent" />
						</div>
					</div>
					<CardTitle className="text-2xl">Complete Your Business Profile</CardTitle>
					<CardDescription>
						Provide your business details to start creating tours
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Tax ID */}
						<div className="space-y-2">
							<Label htmlFor="taxId" className={errors.taxId ? "text-destructive" : ""}>
								Tax ID <span className="text-destructive">*</span>
							</Label>
							<Input
								id="taxId"
								value={taxId}
								onChange={(e) => setTaxId(e.target.value)}
								placeholder="e.g., 123456789"
								className={errors.taxId ? "border-destructive" : ""}
							/>
							{errors.taxId && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="w-3 h-3" />
									{errors.taxId}
								</p>
							)}
						</div>

						{/* Website */}
						<div className="space-y-2">
							<Label htmlFor="website" className={errors.website ? "text-destructive" : ""}>
								Website (Optional)
							</Label>
							<Input
								id="website"
								type="url"
								value={website}
								onChange={(e) => setWebsite(e.target.value)}
								placeholder="https://www.yourcompany.com"
								className={errors.website ? "border-destructive" : ""}
							/>
							{errors.website && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="w-3 h-3" />
									{errors.website}
								</p>
							)}
						</div>

						{/* Slogan */}
						<div className="space-y-2">
							<Label htmlFor="slogan" className={errors.slogan ? "text-destructive" : ""}>
								Company Slogan <span className="text-destructive">*</span>
							</Label>
							<Textarea
								id="slogan"
								value={slogan}
								onChange={(e) => setSlogan(e.target.value)}
								placeholder="Describe what makes your company unique..."
								className={`min-h-[100px] ${errors.slogan ? "border-destructive" : ""}`}
								maxLength={500}
							/>
							<p className="text-xs text-muted-foreground">
								{slogan.length}/500 characters
							</p>
							{errors.slogan && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="w-3 h-3" />
									{errors.slogan}
								</p>
							)}
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={handleSkip}
								className="flex-1"
								disabled={isSubmitting}
							>
								Skip for Now
							</Button>
							<Button
								type="submit"
								variant="gradient"
								className="flex-1"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Completing..." : "Complete Profile"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default BusinessOnboarding;
