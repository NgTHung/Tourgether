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
import { GraduationCap, Upload, X, AlertCircle } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import FileUpload from "~/components/FileUpload";
import TagsInput from "~/components/TagsInput";

const StudentOnboarding = () => {
	const router = useRouter();
	const [school, setSchool] = useState("");
	const [description, setDescription] = useState("");
	const [certificates, setCertificates] = useState<string[]>([]);
	const [workExperience, setWorkExperience] = useState<string[]>([]);
	const [cvFile, setCvFile] = useState<File | null>(null);
	const [cvUrl, setCvUrl] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const updateGuideMutation = api.guide.updateGuideProfile.useMutation({
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

		if (!school.trim()) {
			newErrors.school = "School/University is required";
		}

		if (!description.trim()) {
			newErrors.description = "Description is required";
		} else if (description.length < 50) {
			newErrors.description = "Description must be at least 50 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// TODO: Upload CV file to storage service (e.g., S3, Cloudinary)
			// For now, we'll use a placeholder URL
			const uploadedCvUrl = cvUrl || (cvFile ? "placeholder-cv-url" : "");

			await updateGuideMutation.mutateAsync({
				school,
				description,
				certificates,
				workExperience,
				cvUrl: uploadedCvUrl,
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
						<div className="p-3 bg-primary/10 rounded-2xl">
							<GraduationCap className="w-10 h-10 text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl">Complete Your Student Profile</CardTitle>
					<CardDescription>
						Help businesses find you by completing your profile information
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* School/University */}
						<div className="space-y-2">
							<Label htmlFor="school" className={errors.school ? "text-destructive" : ""}>
								School/University <span className="text-destructive">*</span>
							</Label>
							<Input
								id="school"
								value={school}
								onChange={(e) => setSchool(e.target.value)}
								placeholder="e.g., University of Tourism Studies"
								className={errors.school ? "border-destructive" : ""}
							/>
							{errors.school && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="w-3 h-3" />
									{errors.school}
								</p>
							)}
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description" className={errors.description ? "text-destructive" : ""}>
								About You <span className="text-destructive">*</span>
							</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Tell us about your interests, experience, and what makes you a great tour guide..."
								className={`min-h-[120px] ${errors.description ? "border-destructive" : ""}`}
							/>
							<p className="text-xs text-muted-foreground">
								{description.length}/2000 characters (minimum 50)
							</p>
							{errors.description && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="w-3 h-3" />
									{errors.description}
								</p>
							)}
						</div>

						{/* Certificates */}
						<div className="space-y-2">
							<Label htmlFor="certificates">Certificates (Optional)</Label>
							<TagsInput
								tags={certificates}
								onChange={setCertificates}
								placeholder="Add certificates (e.g., First Aid, Tour Guide License)"
							/>
							<p className="text-xs text-muted-foreground">
								Press Enter to add each certificate
							</p>
						</div>

						{/* Work Experience */}
						<div className="space-y-2">
							<Label htmlFor="workExperience">Work Experience (Optional)</Label>
							<TagsInput
								tags={workExperience}
								onChange={setWorkExperience}
								placeholder="Add work experience (e.g., Tour Guide at ABC Tours - 2023)"
							/>
							<p className="text-xs text-muted-foreground">
								Press Enter to add each experience
							</p>
						</div>

						{/* CV Upload */}
						<div className="space-y-2">
							<Label htmlFor="cv">Upload CV (Optional)</Label>
							<FileUpload
								accept=".pdf,.doc,.docx"
								onFileSelect={(file) => setCvFile(file)}
								maxSize={5 * 1024 * 1024} // 5MB
								label="Click to upload or drag and drop"
								description="PDF, DOC, DOCX (max. 5MB)"
							/>
							{cvFile && (
								<div className="flex items-center gap-2 p-2 border rounded-md">
									<span className="text-sm flex-1 truncate">{cvFile.name}</span>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => setCvFile(null)}
									>
										<X className="w-4 h-4" />
									</Button>
								</div>
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

export default StudentOnboarding;
