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
import { GraduationCap, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import FileUpload from "~/components/FileUpload";
import TagsInput from "~/components/TagsInput";
import { authClient } from "~/server/better-auth/client";
import { updateStudentProfile } from "~/actions/onboarding";

const StudentOnboarding = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl");
	
	const [school, setSchool] = useState("");
	const [description, setDescription] = useState("");
	const [certificates, setCertificates] = useState<string[]>([]);
	const [workExperience, setWorkExperience] = useState<string[]>([]);
	const [cvFile, setCvFile] = useState<File | null>(null);
	
	const [state, formAction, isPending] = useActionState(updateStudentProfile, null);

	const { data: session, isPending: isSessionPending } =
	authClient.useSession();

	useEffect(() => {
		if (!isSessionPending && !session) {
			router.push("/signin?callbackUrl=" + encodeURIComponent("/onboarding/student"));
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
							<GraduationCap className="w-10 h-10 text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl">Complete Your Student Profile</CardTitle>
					<CardDescription>
						Help businesses find you by completing your profile information
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={formAction} className="space-y-6">
                        <input type="hidden" name="callbackUrl" value={callbackUrl || ""} />
                        <input type="hidden" name="certificates" value={JSON.stringify(certificates)} />
                        <input type="hidden" name="workExperience" value={JSON.stringify(workExperience)} />
                        
						{/* School/University */}
						<div className="space-y-2">
							<Label htmlFor="school" className={state?.errors?.school ? "text-destructive" : ""}>
								School/University <span className="text-destructive">*</span>
							</Label>
							<Input
								id="school"
                                name="school"
								value={school}
								onChange={(e) => setSchool(e.target.value)}
								placeholder="e.g., University of Tourism Studies"
								className={state?.errors?.school ? "border-destructive" : ""}
							/>
							{state?.errors?.school && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="w-3 h-3" />
									{state.errors.school[0]}
								</p>
							)}
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description" className={state?.errors?.description ? "text-destructive" : ""}>
								About You <span className="text-destructive">*</span>
							</Label>
							<Textarea
								id="description"
                                name="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Tell us about your interests, experience, and what makes you a great tour guide..."
								className={`min-h-[120px] ${state?.errors?.description ? "border-destructive" : ""}`}
							/>
							<p className="text-xs text-muted-foreground">
								{description.length}/2000 characters (minimum 50)
							</p>
							{state?.errors?.description && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="w-3 h-3" />
									{state.errors.description[0]}
								</p>
							)}
						</div>

						{/* Certificates */}
						<div className="space-y-2">
							<Label htmlFor="certificates">Certificates (Optional)</Label>
							<TagsInput
								tags={certificates}
								onTagsChange={setCertificates}
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
								onTagsChange={setWorkExperience}
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
                                name="cv"
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
								{isPending ? "Completing..." : "Complete Profile"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default StudentOnboarding;
