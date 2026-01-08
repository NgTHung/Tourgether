"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft } from "lucide-react";
import UnsavedChangesModal from "~/components/UnsavedChangesModal";
import { api } from "~/trpc/react";
import { useSession } from "~/components/AuthProvider";

const Settings = () => {
	const router = useRouter();

	const {
		data: session, //refetch the session
	} = useSession();

	const [fullName, setFullName] = useState(session?.user.name ?? "Jane Doe");
	const [email, setEmail] = useState(session?.user.email ?? "jane@example.com");
	const [phone, setPhone] = useState(session?.user.phonenumber ?? "+1 123 456 789");
	const [originalData, setOriginalData] = useState({
		fullName: "",
		email: "",
		phone: "",
	});
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [showUnsavedModal, setShowUnsavedModal] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [showVerificationModal, setShowVerificationModal] = useState(false);
	const [pendingNavigation, setPendingNavigation] = useState<string | null>(
		null,
	);

	useEffect(() => {
		// Store original data on mount
		const original = { fullName, email, phone };
		setOriginalData(original);
	}, [email, fullName, phone]);

	useEffect(() => {
		// Check if there are unsaved changes
		const changed =
			fullName !== originalData.fullName ||
			email !== originalData.email ||
			phone !== originalData.phone;
		setHasUnsavedChanges(changed);
	}, [fullName, email, phone, originalData]);

	const handleNavigateAway = (path: string) => {
		if (hasUnsavedChanges) {
			setPendingNavigation(path);
			setShowUnsavedModal(true);
		} else {
			router.push(path);
		}
	};

	const handleLeave = () => {
		if (pendingNavigation) {
			router.push(pendingNavigation);
		}
	};

	const handleSave = () => {
		api.user.updateUserProfile
			.useMutation()
			.mutate({ fullName, email, phone });
		setShowVerificationModal(true);
	};


	return (
		<>
			<main className="container max-w-2xl py-8 px-4">
				<Button
					variant="ghost"
					onClick={() => handleNavigateAway("/student/dashboard")}
					className="mb-4"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Dashboard
				</Button>

				<h1 className="text-3xl font-bold mb-8">Account Settings</h1>

				<div className="space-y-6 bg-card border rounded-lg p-6 shadow-card">
					<div className="space-y-2">
						<Label htmlFor="fullName">Full Name</Label>
						<Input
							id="fullName"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="phone">Phone</Label>
						<Input
							id="phone"
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
						/>
					</div>

					<Button
						onClick={handleSave}
						disabled={!hasUnsavedChanges}
						variant="gradient"
						className="w-full"
					>
						Save Changes
					</Button>

					{hasUnsavedChanges && (
						<p className="text-sm text-amber-600 dark:text-amber-400">
							You have unsaved changes
						</p>
					)}
				</div>
			</main>

			<UnsavedChangesModal
				open={showUnsavedModal}
				onOpenChange={setShowUnsavedModal}
				onLeave={handleLeave}
			/>

			{/* <EmailVerificationModal
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        email={email}
        onVerify={handleVerify}
      /> */}
		</>
	);
};

export default Settings;
