"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Label } from "~/components/ui/label";
import UnsavedChangesModal from "~/components/UnsavedChangesModal";
import FileUpload from "~/components/FileUpload";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	Mail,
	Phone,
	MapPin,
	Calendar,
	GraduationCap,
	Building2,
	Edit,
	Save,
	X,
	Plus,
	FileText,
	ExternalLink,
	Trash2,
	Camera,
	Loader2,
	User,
} from "lucide-react";
import { useSession } from "~/components/AuthProvider";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { organizations, tourGuide } from "~/server/db/schema/tour";
import { getPresignedUrl } from "~/actions/upload";

interface BaseUserData {
	firstName: string;
	surname: string;
	name: string;
	username: string;
	email: string;
	phone: string;
	location: string;
	createdAt: Date;
	updatedAt: Date;
	rating: number;
	avatar: string;
	gender: string;
	biography: string;
}

interface StudentData extends BaseUserData {
	university: string;
	toursCompleted: number;
	certifications: string[];
	cvUrl: string;
}

interface BusinessData extends BaseUserData {
	website: string;
	taxId: string;
	slogan: string;
	toursOffered: number;
}

const Account = () => {
	const {
		data: session,
	} = useSession();
	const [isEditMode, setIsEditMode] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [showUnsavedModal, setShowUnsavedModal] = useState(false);
	const [pendingNavigation, setPendingNavigation] = useState<string | null>(
		null,
	);
	const router = useRouter();

	const [profile] = api.user.getMyProfile.useSuspenseQuery();
	const updateProfileMutation = api.user.updateUserProfile.useMutation({
		onSuccess: () => {
			toast.success("Profile updated successfully");
			setIsEditMode(false);
			setHasUnsavedChanges(false);
			router.refresh();
		},
		onError: (error) => {
			toast.error(`Failed to update profile: ${error.message}`);
		},
	});

	const userRole = session?.user?.role === "ORGANIZATION" ? "business" : "student";

	// Helper to split name into first name and surname
	const splitName = (fullName: string) => {
		const parts = fullName.trim().split(" ");
		if (parts.length === 1) {
			return { firstName: parts[0] ?? "", surname: "" };
		}
		const surname = parts.pop() ?? "";
		const firstName = parts.join(" ");
		return { firstName, surname };
	};

	// Helper to safely get profile data based on role
	const getInitialData = () => {
		const fullName = session?.user?.name ?? "";
		const { firstName, surname } = splitName(fullName);
		
		const baseData = {
			firstName,
			surname,
			name: fullName,
			username: session?.user?.username ?? "",
			email: session?.user?.email ?? "",
			phone: session?.user?.phonenumber ?? "",
			location: session?.user?.address ?? "",
			createdAt: session?.user?.createdAt,
			updatedAt: session?.user?.updatedAt,
			rating: session?.user?.rating ?? 0,
			avatar: session?.user?.image ?? "",
			gender: session?.user?.gender ?? "",
			biography: "",
		};

		if (userRole === "student") {
			const guideProfile = profile.profile as Exclude<typeof profile.profile, typeof organizations.$inferSelect>;
			return {
				student: {
					...baseData,
					university: guideProfile?.school ?? "",
					toursCompleted: 0,
					certifications: guideProfile?.certificates ?? [],
					biography: guideProfile?.description ?? "",
					cvUrl: guideProfile?.cvUrl ?? "",
				} as StudentData,
				business: {} as BusinessData,
			};
		} else {
			const orgProfile = profile.profile as Exclude<typeof profile.profile, typeof tourGuide.$inferSelect>;
			return {
				student: {} as StudentData,
				business: {
					...baseData,
					website: orgProfile?.websiteURL ?? "",
					taxId: orgProfile?.taxID?.toString() ?? "",
					slogan: orgProfile?.slogan ?? "",
					toursOffered: 0,
					biography: orgProfile?.slogan ?? "",
				} as BusinessData,
			};
		}
	};

	const [editableData, setEditableData] = useState(getInitialData());

	// Update local state when profile data changes (e.g. after refetch)
	useEffect(() => {
		setEditableData(getInitialData());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profile, userRole]);

	const userData = editableData[userRole];

	const handleNavigateAway = (path: string) => {
		if (hasUnsavedChanges) {
			setPendingNavigation(path);
			setShowUnsavedModal(true);
		} else {
			router.push(path);
		}
	};

	const handleSaveChanges = () => {
		// Combine firstName and surname for the full name
		const fullName = `${userData.firstName} ${userData.surname}`.trim();
		
		const commonData = {
			fullName,
			email: userData.email,
			phone: userData.phone,
			address: userData.location,
			gender: userData.gender,
			image: userData.avatar,
		};

		if (userRole === "student") {
			const studentData = userData as StudentData;
			updateProfileMutation.mutate({
				...commonData,
				school: studentData.university,
				certificates: studentData.certifications,
				description: studentData.biography,
				cvUrl: studentData.cvUrl,
			});
		} else {
			const businessData = userData as BusinessData;
			updateProfileMutation.mutate({
				...commonData,
				taxID: businessData.taxId,
				websiteURL: businessData.website,
				slogan: businessData.biography,
			});
		}
	};

	const addArrayItem = (field: keyof StudentData | keyof BusinessData, newItem: string) => {
		if (!newItem.trim()) return;

		setEditableData((prev) => {
			const currentData = prev[userRole];
			const currentValue = currentData[field as keyof typeof currentData];
			if (Array.isArray(currentValue)) {
				return {
					...prev,
					[userRole]: {
						...currentData,
						[field]: [...currentValue, newItem],
					},
				};
			}
			return prev;
		});
		setHasUnsavedChanges(true);
	};

	const removeArrayItem = (field: keyof StudentData | keyof BusinessData, index: number) => {
		setEditableData((prev) => {
			const currentData = prev[userRole];
			const currentValue = currentData[field as keyof typeof currentData];
			if (Array.isArray(currentValue)) {
				return {
					...prev,
					[userRole]: {
						...currentData,
						[field]: currentValue.filter((_, i) => i !== index),
					},
				};
			}
			return prev;
		});
		setHasUnsavedChanges(true);
	};

	const updateField = (field: string, value: string) => {
		setEditableData((prev) => ({
			...prev,
			[userRole]: {
				...prev[userRole],
				[field]: value,
			},
		}));
		setHasUnsavedChanges(true);
	};

	return (
		<>
			<div className="container max-w-4xl mx-auto px-4 py-8">
				{/* Header Actions */}
				<div className="flex justify-between items-center mb-8">
					<Button
						variant="ghost"
						onClick={() =>
							handleNavigateAway(
								userRole === "student"
									? "/student/dashboard"
									: "/business/dashboard",
							)
						}
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Dashboard
					</Button>

					{!isEditMode ? (
						<div className="flex gap-2">
							{userRole === "student" && session?.user?.id && (
								<Button
									variant="outline"
									onClick={() => router.push(`/guide/${session.user.id}`)}
								>
									<User className="w-4 h-4 mr-2" />
									View My Public Profile
								</Button>
							)}
							<Button
								onClick={() => setIsEditMode(true)}
								variant="gradient"
							>
								<Edit className="w-4 h-4 mr-2" />
								Edit Profile
							</Button>
						</div>
					) : (
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => {
									if (hasUnsavedChanges) {
										setShowUnsavedModal(true);
									} else {
										setIsEditMode(false);
									}
								}}
							>
								<X className="w-4 h-4 mr-2" />
								Cancel
							</Button>
							<Button
								onClick={handleSaveChanges}
								variant="gradient"
								disabled={!hasUnsavedChanges || updateProfileMutation.isPending}
							>
								<Save className="w-4 h-4 mr-2" />
								{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					)}
				</div>

				{/* Professional Profile Header */}
				<Card className="mb-8 shadow-elevated">
					<CardContent className="pt-8">
						<div className="flex flex-col md:flex-row items-start gap-8">
							<AvatarUploadSection
								avatar={userData.avatar}
								name={`${userData.firstName} ${userData.surname}`.trim()}
								isEditMode={isEditMode}
								onAvatarChange={(url: string) => updateField("avatar", url)}
								userRole={userRole}
							/>

							<div className="flex-1 space-y-6">
								<div>
									{isEditMode ? (
										<div className="flex gap-4 mb-2">
											<div className="flex-1">
												<Label className="text-xs text-muted-foreground mb-1">First Name</Label>
												<Input
													value={userData.firstName}
													onChange={(e) =>
														updateField("firstName", e.target.value)
													}
													className="text-2xl font-bold"
													placeholder="First Name"
												/>
											</div>
											<div className="flex-1">
												<Label className="text-xs text-muted-foreground mb-1">Surname</Label>
												<Input
													value={userData.surname}
													onChange={(e) =>
														updateField("surname", e.target.value)
													}
													className="text-2xl font-bold"
													placeholder="Surname"
												/>
											</div>
										</div>
									) : (
										<h1 className="text-3xl font-bold mb-2">
											{`${userData.firstName} ${userData.surname}`.trim() || "No Name"}
										</h1>
									)}

									{/* Username */}
									<div className="mb-4">
										{isEditMode ? (
											<div className="flex items-center gap-2">
												<span className="text-muted-foreground">
													@
												</span>
												<Input
													value={userData.username}
													onChange={(e) =>
														updateField(
															"username",
															e.target.value,
														)
													}
													disabled={true} // Username usually not editable
													className="border-0 p-0 bg-transparent focus-visible:ring-1 w-auto text-lg"
													placeholder="username"
												/>
											</div>
										) : (
											<p className="text-lg text-muted-foreground">
												@
												{userData.username}
											</p>
										)}
									</div>

									<div className="flex flex-wrap gap-4 text-muted-foreground">
										<div className="flex items-center gap-2">
											<Mail className="w-4 h-4" />
											{isEditMode ? (
												<Input
													value={userData.email}
													onChange={(e) =>
														updateField(
															"email",
															e.target.value,
														)
													}
													className="h-8 w-auto min-w-[200px]"
													placeholder="email@example.com"
												/>
											) : (
												<span>{userData.email}</span>
											)}
										</div>
										<div className="flex items-center gap-2">
											<Phone className="w-4 h-4" />
											{isEditMode ? (
												<Input
													value={userData.phone}
													onChange={(e) =>
														updateField(
															"phone",
															e.target.value,
														)
													}
													className="h-8 w-auto min-w-[150px]"
													placeholder="+1 (555) 000-0000"
												/>
											) : (
												<span>{userData.phone}</span>
											)}
										</div>
										<div className="flex items-center gap-2">
											<MapPin className="w-4 h-4" />
											{isEditMode ? (
												<Input
													value={userData.location}
													onChange={(e) =>
														updateField(
															"location",
															e.target.value,
														)
													}
													className="h-8 w-auto min-w-[150px]"
													placeholder="City, Country"
												/>
											) : (
												<span>{userData.location}</span>
											)}
										</div>
										<div className="flex items-center gap-2">
											<Calendar className="w-4 h-4" />
											<span>
												Member since {userData.createdAt.toDateString()}
											</span>
										</div>
									</div>
								</div>

								{/* Biography Section */}
								<div>
									<h3 className="font-semibold mb-2">
										{userRole === "business" ? "Slogan / Description" : "Biography"}
									</h3>
									{isEditMode ? (
										<Textarea
											value={userData.biography}
											onChange={(e) =>
												updateField(
													"biography",
													e.target.value,
												)
											}
											placeholder={userRole === "business" ? "Company slogan..." : "Write a professional biography..."}
											className="min-h-[100px]"
										/>
									) : (
										<p className="text-muted-foreground">
											{userData.biography}
										</p>
									)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Role-specific Information */}
				<div className="mb-8">
					<RoleSpecificSection
						userRole={userRole}
						userData={userData}
						isEditMode={isEditMode}
						updateField={updateField}
						addArrayItem={addArrayItem}
						removeArrayItem={removeArrayItem}
					/>
				</div>

				{/* Activity Overview */}
				<Card>
					<CardHeader>
						<CardTitle>Professional Overview</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
							<div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
								<div className="text-3xl font-bold text-primary mb-2">
									{userRole === "student" &&
										(userData as StudentData)
											.toursCompleted}
									{userRole === "business" &&
										(userData as BusinessData).toursOffered}
								</div>
								<p className="text-sm text-muted-foreground font-medium">
									{userRole === "student" &&
										"Tours Completed"}
									{userRole === "business" && "Tours Offered"}
								</p>
							</div>

							<div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
								<div className="text-3xl font-bold text-primary mb-2">
									{userData.rating}
								</div>
								<p className="text-sm text-muted-foreground font-medium">
									Average Rating
								</p>
							</div>

							<div className="text-center p-6 bg-muted/50 rounded-lg border">
								<div className="text-3xl font-bold text-foreground mb-2">
									{userData.createdAt.getFullYear()}
								</div>
								<p className="text-sm text-muted-foreground font-medium">
									Member Since
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Modals */}
				<UnsavedChangesModal
					open={showUnsavedModal}
					onOpenChange={setShowUnsavedModal}
					onLeave={() => {
						setIsEditMode(false);
						setHasUnsavedChanges(false);
						setShowUnsavedModal(false);
						if (pendingNavigation) {
							router.push(pendingNavigation);
						}
					}}
				/>
			</div>
		</>
	);
};

// Helper Components
interface RoleSpecificSectionProps {
	userRole: "student" | "business";
	userData: StudentData | BusinessData;
	isEditMode: boolean;
	updateField: (field: string, value: string) => void;
	addArrayItem: (field: keyof StudentData | keyof BusinessData, item: string) => void;
	removeArrayItem: (field: keyof StudentData | keyof BusinessData, index: number) => void;
}

const RoleSpecificSection = ({
	userRole,
	userData,
	isEditMode,
	updateField,
	addArrayItem,
	removeArrayItem,
}: RoleSpecificSectionProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{userRole === "student" && (
						<GraduationCap className="w-5 h-5" />
					)}
					{userRole === "business" && (
						<Building2 className="w-5 h-5" />
					)}
					{userRole === "student" && "Academic & Professional Information"}
					{userRole === "business" && "Business Information"}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{userRole === "student" && (
					<>
						{/* University */}
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								University / School
							</Label>
							{isEditMode ? (
								<Input
									value={(userData as StudentData).university}
									onChange={(e) =>
										updateField("university", e.target.value)
									}
									className="mt-1"
								/>
							) : (
								<p className="text-sm mt-1">
									{(userData as StudentData).university || "Not specified"}
								</p>
							)}
						</div>

						{/* Gender */}
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								Gender
							</Label>
							{isEditMode ? (
								<div className="mt-1 space-y-2">
									<div className="flex gap-2">
										{["Male", "Female", "Other"].map((option) => (
											<button
												key={option}
												type="button"
												onClick={() => {
													if (option === "Other") {
														// If "Other" is selected, clear the field so user can type
														if (userData.gender === "Male" || userData.gender === "Female") {
															updateField("gender", "");
														}
													} else {
														updateField("gender", option);
													}
												}}
												className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
													option === "Other"
														? userData.gender !== "Male" && userData.gender !== "Female"
															? "bg-primary text-primary-foreground border-primary"
															: "bg-background hover:bg-muted border-input"
														: userData.gender === option
															? "bg-primary text-primary-foreground border-primary"
															: "bg-background hover:bg-muted border-input"
												}`}
											>
												{option}
											</button>
										))}
									</div>
									{userData.gender !== "Male" && userData.gender !== "Female" && (
										<Input
											value={userData.gender}
											onChange={(e) =>
												updateField("gender", e.target.value)
											}
											placeholder="Enter your gender"
										/>
									)}
								</div>
							) : (
								<p className="text-sm mt-1">
									{userData.gender || "Not specified"}
								</p>
							)}
						</div>

						{/* Certifications */}
						<ArrayField
							label="Certifications"
							items={(userData as StudentData).certifications}
							isEditMode={isEditMode}
							onAdd={(item: string) =>
								addArrayItem("certifications", item)
							}
							onRemove={(index: number) =>
								removeArrayItem("certifications", index)
							}
						/>

						{/* CV Upload Section */}
						<CVUploadSection
							cvUrl={(userData as StudentData).cvUrl}
							isEditMode={isEditMode}
							onCvChange={(url: string) => updateField("cvUrl", url)}
						/>
					</>
				)}

				{userRole === "business" && (
					<>
						{/* Website */}
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								Website
							</Label>
							{isEditMode ? (
								<Input
									value={(userData as BusinessData).website}
									onChange={(e) =>
										updateField("website", e.target.value)
									}
									className="mt-1"
									placeholder="https://example.com"
								/>
							) : (
								<p className="text-sm mt-1">
									{(userData as BusinessData).website ? (
										<a
											href={(userData as BusinessData).website}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline flex items-center gap-1"
										>
											{(userData as BusinessData).website}
											<ExternalLink className="w-3 h-3" />
										</a>
									) : (
										"Not specified"
									)}
								</p>
							)}
						</div>

						{/* Tax ID */}
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								Tax ID
							</Label>
							{isEditMode ? (
								<Input
									value={(userData as BusinessData).taxId}
									onChange={(e) =>
										updateField("taxId", e.target.value)
									}
									className="mt-1"
								/>
							) : (
								<p className="text-sm mt-1">
									{(userData as BusinessData).taxId || "Not specified"}
								</p>
							)}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
};

// Avatar Upload Section Component
interface AvatarUploadSectionProps {
	avatar: string;
	name: string;
	isEditMode: boolean;
	onAvatarChange: (url: string) => void;
	userRole: "student" | "business";
}

const AvatarUploadSection = ({ avatar, name, isEditMode, onAvatarChange, userRole }: AvatarUploadSectionProps) => {
	const [isUploading, setIsUploading] = useState(false);

	const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast.error('Please upload an image file');
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image must be less than 5MB');
			return;
		}

		setIsUploading(true);
		try {
			const { uploadUrl, fileUrl } = await getPresignedUrl(
				file.name,
				file.type,
				file.size,
				'image'
			);

			const response = await fetch(uploadUrl, {
				method: 'PUT',
				body: file,
				headers: {
					'Content-Type': file.type,
				},
			});

			if (!response.ok) {
				throw new Error('Upload failed');
			}

			onAvatarChange(fileUrl);
			toast.success('Avatar uploaded successfully');
		} catch (error) {
			console.error('Avatar upload failed:', error);
			toast.error('Failed to upload avatar');
		} finally {
			setIsUploading(false);
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const getRoleIcon = () => {
		return userRole === "business" ? <Building2 className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />;
	};

	const getRoleLabel = () => {
		return userRole === "business" ? "Business Partner" : "Tourism Student";
	};

	return (
		<div className="flex flex-col items-center">
			<div className="relative mb-4">
				<Avatar className="w-32 h-32">
					<AvatarImage src={avatar} alt={name} />
					<AvatarFallback className="text-3xl bg-gradient-primary text-primary-foreground">
						{name ? getInitials(name) : <User className="w-12 h-12" />}
					</AvatarFallback>
				</Avatar>
				{isEditMode && (
					<label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md">
						{isUploading ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Camera className="w-4 h-4" />
						)}
						<input
							type="file"
							accept="image/*"
							onChange={handleAvatarUpload}
							disabled={isUploading}
							className="hidden"
						/>
					</label>
				)}
			</div>
			<Badge variant="secondary" className="flex items-center gap-2">
				{getRoleIcon()}
				{getRoleLabel()}
			</Badge>
		</div>
	);
};

// CV Upload Section Component
interface CVUploadSectionProps {
	cvUrl: string;
	isEditMode: boolean;
	onCvChange: (url: string) => void;
}

const CVUploadSection = ({ cvUrl, isEditMode, onCvChange }: CVUploadSectionProps) => {
	const isPdf = cvUrl?.toLowerCase().endsWith('.pdf');
	const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(cvUrl ?? '');

	return (
		<div className="space-y-3">
			<Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
				<FileText className="w-4 h-4" />
				CV / Resume
			</Label>

			{cvUrl ? (
				<div className="space-y-3">
					{/* CV Preview */}
					<div className="border rounded-lg overflow-hidden bg-muted/20">
						{isPdf ? (
							<div className="w-full h-[400px]">
								<iframe
									src={cvUrl}
									className="w-full h-full"
									title="CV Preview"
								/>
							</div>
						) : isImage ? (
							<div className="w-full max-h-[500px] overflow-auto">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={cvUrl}
									alt="CV / Resume"
									className="w-full h-auto object-contain"
								/>
							</div>
						) : (
							<div className="p-4 flex items-center gap-3">
								<FileText className="w-8 h-8 text-primary" />
								<div className="flex-1">
									<p className="font-medium">CV Document</p>
									<p className="text-sm text-muted-foreground">
										Click to view or download
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Actions */}
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							asChild
						>
							<a
								href={cvUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								<ExternalLink className="w-4 h-4 mr-2" />
								Open in New Tab
							</a>
						</Button>
						{isEditMode && (
							<Button
								variant="destructive"
								size="sm"
								onClick={() => onCvChange("")}
							>
								<Trash2 className="w-4 h-4 mr-2" />
								Remove CV
							</Button>
						)}
					</div>
				</div>
			) : (
				<>
					{isEditMode ? (
						<FileUpload
							accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,image/*"
							onFileSelect={(url) => onCvChange(url)}
							maxSize={10 * 1024 * 1024} // 10MB
							label="Upload your CV / Resume"
							description="PDF, DOC, DOCX, or Image (max 10MB)"
						/>
					) : (
						<div className="p-4 border rounded-lg bg-muted/20 text-center">
							<FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">
								No CV uploaded yet
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								Edit your profile to upload a CV
							</p>
						</div>
					)}
				</>
			)}
		</div>
	);
};

// Array Field Component
interface ArrayFieldProps {
	label: string;
	items: string[];
	isEditMode: boolean;
	onAdd: (item: string) => void;
	onRemove: (index: number) => void;
}

const ArrayField = ({ label, items, isEditMode, onAdd, onRemove }: ArrayFieldProps) => {
	const [newItem, setNewItem] = useState("");

	const handleAdd = () => {
		if (newItem.trim()) {
			onAdd(newItem.trim());
			setNewItem("");
		}
	};

	return (
		<div>
			<Label className="text-sm font-medium text-muted-foreground">
				{label}
			</Label>
			<div className="mt-1">
				{items.length > 0 && (
					<div className="flex flex-wrap gap-2 mb-2">
						{items.map((item: string, index: number) => (
							<Badge key={index} variant="outline" className="text-xs">
								{item}
								{isEditMode && (
									<button
										onClick={() => onRemove(index)}
										className="ml-2 hover:text-destructive"
									>
										<X className="w-3 h-3" />
									</button>
								)}
							</Badge>
						))}
					</div>
				)}
				{!isEditMode && items.length === 0 && (
					<p className="text-sm text-muted-foreground">None specified</p>
				)}
				{isEditMode && (
					<div className="flex gap-2">
						<Input
							value={newItem}
							onChange={(e) => setNewItem(e.target.value)}
							placeholder={`Add ${label.toLowerCase()}...`}
							className="text-sm"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleAdd();
								}
							}}
						/>
						<Button
							size="sm"
							onClick={handleAdd}
							disabled={!newItem.trim()}
						>
							<Plus className="w-4 h-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Account;
