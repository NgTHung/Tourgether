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
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	User,
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
} from "lucide-react";
import { useSession } from "~/components/AuthProvider";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { organizations, tourGuide } from "~/server/db/schema/tour";

interface BaseUserData {
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
	major: string;
	toursCompleted: number;
	certifications: string[];
	workExperience: string[];
	languages: string[];
	cvUrl: string;
}

interface BusinessData extends BaseUserData {
	website: string;
	taxId: string;
	slogan: string;
	companyType: string;
	hotline: string;
	toursOffered: number;
	services: string[];
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

	// Helper to safely get profile data based on role
	const getInitialData = () => {
		const baseData = {
			name: profile.currentUser.name ?? "",
			username: profile.currentUser.username ?? "",
			email: profile.currentUser.email ?? "",
			phone: profile.currentUser.phonenumber ?? "",
			location: profile.currentUser.address ?? "",
			createdAt: profile.currentUser.createdAt,
			updatedAt: profile.currentUser.updatedAt,
			rating: profile.currentUser.rating ?? 0,
			avatar: profile.currentUser.image ?? "",
			gender: profile.currentUser.gender ?? "",
			biography: "", // Will be overwritten by role specific data
		};

		if (userRole === "student") {
			const guideProfile = profile.profile as Exclude<typeof profile.profile, typeof organizations.$inferSelect>; // Type assertion for easier access
			return {
				student: {
					...baseData,
					university: guideProfile?.school ?? "",
					major: "", // Not in schema
					toursCompleted: 0, // Need to fetch or calculate
					certifications: guideProfile?.certificates ?? [],
					workExperience: guideProfile?.workExperience ?? [],
					languages: [], // Not in schema
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
					companyType: "", // Not in schema
					hotline: "", // Not in schema
					toursOffered: 0, // Need to fetch or calculate
					services: [], // Not in schema
					biography: orgProfile?.slogan ?? "", // Use slogan as biography for business
				} as BusinessData,
			};
		}
	};

	const [editableData, setEditableData] = useState(getInitialData());

	// Update local state when profile data changes (e.g. after refetch)
	useEffect(() => {
		setEditableData(getInitialData());
	}, [profile, userRole]);

	const userData = editableData[userRole];

	const getRoleIcon = () => {
		switch (userRole) {
			case "student":
				return <GraduationCap className="w-5 h-5" />;
			case "business":
				return <Building2 className="w-5 h-5" />;
		}
	};

	const getRoleLabel = () => {
		switch (userRole) {
			case "student":
				return "Tourism Student";
			case "business":
				return "Business Partner";
		}
	};

	const handleNavigateAway = (path: string) => {
		if (hasUnsavedChanges) {
			setPendingNavigation(path);
			setShowUnsavedModal(true);
		} else {
			router.push(path);
		}
	};

	const handleSaveChanges = () => {
		const commonData = {
			fullName: userData.name,
			email: userData.email,
			phone: userData.phone,
			address: userData.location,
			gender: userData.gender,
		};

		if (userRole === "student") {
			const studentData = userData as StudentData;
			updateProfileMutation.mutate({
				...commonData,
				school: studentData.university,
				certificates: studentData.certifications,
				workExperience: studentData.workExperience,
				description: studentData.biography,
				cvUrl: studentData.cvUrl,
			});
		} else {
			const businessData = userData as BusinessData;
			updateProfileMutation.mutate({
				...commonData,
				taxID: businessData.taxId,
				websiteURL: businessData.website,
				slogan: businessData.biography, // Using biography field for slogan
			});
		}
	};

	const addArrayItem = (field: string, newItem: string) => {
		if (!newItem.trim()) return;

		const currentValue = (userData as any)[field];
		if (Array.isArray(currentValue)) {
			setEditableData((prev) => ({
				...prev,
				[userRole]: {
					...prev[userRole],
					[field]: [...currentValue, newItem],
				},
			}));
			setHasUnsavedChanges(true);
		}
	};

	const removeArrayItem = (field: string, index: number) => {
		const currentValue = (userData as any)[field];
		if (Array.isArray(currentValue)) {
			setEditableData((prev) => ({
				...prev,
				[userRole]: {
					...prev[userRole],
					[field]: currentValue.filter((_, i) => i !== index),
				},
			}));
			setHasUnsavedChanges(true);
		}
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
						<Button
							onClick={() => setIsEditMode(true)}
							variant="gradient"
						>
							<Edit className="w-4 h-4 mr-2" />
							Edit Profile
						</Button>
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
							<div className="flex flex-col items-center">
								<Avatar className="w-32 h-32 mb-4">
									<AvatarImage
										src={userData.avatar}
										alt={userData.name}
									/>
									<AvatarFallback className="text-3xl bg-gradient-primary text-primary-foreground">
										{userData.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<Badge
									variant="secondary"
									className="flex items-center gap-2"
								>
									{getRoleIcon()}
									{getRoleLabel()}
								</Badge>
							</div>

							<div className="flex-1 space-y-6">
								<div>
									{isEditMode ? (
										<Input
											value={userData.name}
											onChange={(e) =>
												updateField(
													"name",
													e.target.value,
												)
											}
											className="text-3xl font-bold border-0 p-0 bg-transparent focus-visible:ring-1"
											placeholder="Full Name"
										/>
									) : (
										<h1 className="text-3xl font-bold mb-2">
											{userData.name}
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
													className="border-0 p-0 bg-transparent focus-visible:ring-1 w-auto"
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
													className="border-0 p-0 bg-transparent focus-visible:ring-1 w-auto"
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
													className="border-0 p-0 bg-transparent focus-visible:ring-1 w-auto"
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

				{/* Professional Details Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					{/* Contact Information */}
					<ProfessionalSection
						title="Contact Information"
						icon={<User className="w-5 h-5" />}
						isEditMode={isEditMode}
						userData={userData}
						updateField={updateField}
					/>

					{/* Role-specific Information */}
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
const ProfessionalSection = ({
	title,
	icon,
	isEditMode,
	userData,
	updateField,
}: {
	title: string;
	icon: React.ReactNode;
	isEditMode: boolean;
	userData: any;
	updateField: (field: string, value: string) => void;
}) => (
	<Card>
		<CardHeader>
			<CardTitle className="flex items-center gap-2">
				{icon}
				{title}
			</CardTitle>
		</CardHeader>
		<CardContent className="space-y-4">
			<div>
				<Label className="text-sm font-medium text-muted-foreground">
					Phone
				</Label>
				{isEditMode ? (
					<Input
						value={userData.phone}
						onChange={(e) => updateField("phone", e.target.value)}
						className="mt-1"
					/>
				) : (
					<p className="text-sm mt-1">{userData.phone}</p>
				)}
			</div>
			<div>
				<Label className="text-sm font-medium text-muted-foreground">
					Email
				</Label>
				{isEditMode ? (
					<Input
						value={userData.email}
						onChange={(e) => updateField("email", e.target.value)}
						className="mt-1"
					/>
				) : (
					<p className="text-sm mt-1">{userData.email}</p>
				)}
			</div>
			<div>
				<Label className="text-sm font-medium text-muted-foreground">
					Location
				</Label>
				{isEditMode ? (
					<Input
						value={userData.location}
						onChange={(e) =>
							updateField("location", e.target.value)
						}
						className="mt-1"
					/>
				) : (
					<p className="text-sm mt-1">{userData.location}</p>
				)}
			</div>
		</CardContent>
	</Card>
);

const RoleSpecificSection = ({
	userRole,
	userData,
	isEditMode,
	updateField,
	addArrayItem,
	removeArrayItem,
}: any) => {
	const [newItem, setNewItem] = useState("");

	const handleAddItem = (field: string) => {
		if (newItem.trim()) {
			addArrayItem(field, newItem.trim());
			setNewItem("");
		}
	};

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
					{userRole === "student" && "Academic Information"}
					{userRole === "business" && "Business Information"}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{userRole === "student" && (
					<>
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								University
							</Label>
							{isEditMode ? (
								<Input
									value={(userData as StudentData).university}
									onChange={(e) =>
										updateField(
											"university",
											e.target.value,
										)
									}
									className="mt-1"
								/>
							) : (
								<p className="text-sm mt-1">
									{(userData as StudentData).university}
								</p>
							)}
						</div>
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								Major
							</Label>
							{isEditMode ? (
								<Input
									value={(userData as StudentData).major}
									onChange={(e) =>
										updateField("major", e.target.value)
									}
									className="mt-1"
								/>
							) : (
								<p className="text-sm mt-1">
									{(userData as StudentData).major}
								</p>
							)}
						</div>
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								Gender
							</Label>
							{isEditMode ? (
								<Input
									value={(userData as StudentData).gender}
									onChange={(e) =>
										updateField("gender", e.target.value)
									}
									className="mt-1"
								/>
							) : (
								<p className="text-sm mt-1">
									{(userData as StudentData).gender}
								</p>
							)}
						</div>
						<ArrayField
							label="Languages"
							items={(userData as StudentData).languages}
							isEditMode={isEditMode}
							onAdd={(item: string) => addArrayItem("languages", item)}
							onRemove={(index: number) =>
								removeArrayItem("languages", index)
							}
						/>
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
						<ArrayField
							label="Work Experience"
							items={(userData as StudentData).workExperience}
							isEditMode={isEditMode}
							onAdd={(item: string) =>
								addArrayItem("workExperience", item)
							}
							onRemove={(index: number) =>
								removeArrayItem("workExperience", index)
							}
						/>
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								CV / Resume
							</Label>
							{(userData as StudentData).cvUrl ? (
								<div className="mt-1">
									<a
										href={(userData as StudentData).cvUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-primary hover:underline"
									>
										View CV
									</a>
								</div>
							) : (
								<p className="text-sm mt-1 text-muted-foreground">
									No CV uploaded
								</p>
							)}
						</div>
					</>
				)}

				{userRole === "business" && (
					<>
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								Company Type
							</Label>
							{isEditMode ? (
								<Input
									value={
										(userData as BusinessData).companyType
									}
									onChange={(e) =>
										updateField(
											"companyType",
											e.target.value,
										)
									}
									className="mt-1"
								/>
							) : (
								<p className="text-sm mt-1">
									{(userData as BusinessData).companyType}
								</p>
							)}
						</div>
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
								/>
							) : (
								<p className="text-sm mt-1">
									{(userData as BusinessData).website}
								</p>
							)}
						</div>
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								Hotline
							</Label>
							{isEditMode ? (
								<Input
									value={(userData as BusinessData).hotline}
									onChange={(e) =>
										updateField("hotline", e.target.value)
									}
									className="mt-1"
								/>
							) : (
								<p className="text-sm mt-1">
									{(userData as BusinessData).hotline}
								</p>
							)}
						</div>
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
									{(userData as BusinessData).taxId}
								</p>
							)}
						</div>
						<ArrayField
							label="Services"
							items={(userData as BusinessData).services}
							isEditMode={isEditMode}
							onAdd={(item: string) => addArrayItem("services", item)}
							onRemove={(index: number) =>
								removeArrayItem("services", index)
							}
						/>
					</>
				)}
			</CardContent>
		</Card>
	);
};

const ArrayField = ({ label, items, isEditMode, onAdd, onRemove }: any) => {
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
				<div className="flex flex-wrap gap-2 mb-2">
					{items.map((item: string, index: number) => (
						<div key={index} className="flex items-center">
							<Badge variant="outline" className="text-xs">
								{item}
								{isEditMode && (
									<button
										onClick={() => onRemove(index)}
										className="m l-2 hover:text-destructive"
									>
										<X className="w-3 h-3" />
									</button>
								)}
							</Badge>
						</div>
					))}
				</div>
				{isEditMode && (
					<div className="flex gap-2">
						<Input
							value={newItem}
							onChange={(e) => setNewItem(e.target.value)}
							placeholder={`Add ${label.toLowerCase()}...`}
							className="text-sm"
							onKeyDown={(e) => e.key === "Enter" && handleAdd()}
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
