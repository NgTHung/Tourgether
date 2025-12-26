"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	ArrowLeft,
	Check,
	X,
	AlertTriangle,
	Loader2,
	Calendar,
	MessageSquare,
	Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";

const LeaveRequestsPage = () => {
	const router = useRouter();
	const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
	const [actionType, setActionType] = useState<"approve" | "reject" | "criticize" | null>(null);
	const [response, setResponse] = useState("");
	const [criticismRating, setCriticismRating] = useState<string>("3");

	const leaveRequestsQuery = api.organization.getLeaveRequests.useQuery();

	const approveMutation = api.organization.approveLeaveRequest.useMutation({
		onSuccess: () => {
			toast.success("Leave request approved");
			void leaveRequestsQuery.refetch();
			closeDialog();
		},
		onError: (error) => {
			toast.error(`Failed to approve: ${error.message}`);
		},
	});

	const rejectMutation = api.organization.rejectLeaveRequest.useMutation({
		onSuccess: () => {
			toast.success("Leave request rejected");
			void leaveRequestsQuery.refetch();
			closeDialog();
		},
		onError: (error) => {
			toast.error(`Failed to reject: ${error.message}`);
		},
	});

	const criticizeMutation = api.organization.criticizeLeaveRequest.useMutation({
		onSuccess: () => {
			toast.success("Leave request processed with criticism");
			void leaveRequestsQuery.refetch();
			closeDialog();
		},
		onError: (error) => {
			toast.error(`Failed to criticize: ${error.message}`);
		},
	});

	const closeDialog = () => {
		setSelectedRequest(null);
		setActionType(null);
		setResponse("");
		setCriticismRating("3");
	};

	const handleAction = () => {
		if (!selectedRequest) return;

		switch (actionType) {
			case "approve":
				approveMutation.mutate({
					requestID: selectedRequest,
					response: response || undefined,
				});
				break;
			case "reject":
				rejectMutation.mutate({
					requestID: selectedRequest,
					response: response,
				});
				break;
			case "criticize":
				criticizeMutation.mutate({
					requestID: selectedRequest,
					criticismRating: parseInt(criticismRating),
					criticismReason: response,
				});
				break;
		}
	};

	const pendingRequests = leaveRequestsQuery.data?.filter((r) => r.status === "PENDING") ?? [];
	const reviewedRequests = leaveRequestsQuery.data?.filter((r) => r.status !== "PENDING") ?? [];

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "APPROVED":
				return <Badge variant="default"><Check className="w-3 h-3 mr-1" /> Approved</Badge>;
			case "REJECTED":
				return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Rejected</Badge>;
			case "CRITICIZED":
				return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Criticized</Badge>;
			default:
				return <Badge variant="secondary">Pending</Badge>;
		}
	};

	const isLoading = approveMutation.isPending || rejectMutation.isPending || criticizeMutation.isPending;

	return (
		<main className="container mx-auto py-8 px-4">
			<Button
				variant="ghost"
				onClick={() => router.push("/business/dashboard")}
				className="mb-4"
			>
				<ArrowLeft className="w-4 h-4 mr-2" />
				Back to Dashboard
			</Button>

			<h1 className="text-3xl font-bold mb-6">Leave Requests</h1>

			{leaveRequestsQuery.isLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="w-8 h-8 animate-spin" />
				</div>
			) : (
				<div className="space-y-8">
					{/* Pending Requests */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<AlertTriangle className="w-5 h-5 text-yellow-500" />
								Pending Requests ({pendingRequests.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							{pendingRequests.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">
									No pending leave requests
								</p>
							) : (
								<div className="space-y-4">
									{pendingRequests.map((request) => (
										<div
											key={request.id}
											className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
										>
											<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
												<div className="flex items-start gap-4 flex-1">
													<Avatar className="w-12 h-12">
														<AvatarImage src={request.user.image ?? undefined} />
														<AvatarFallback>
															{request.user.name?.[0] ?? "U"}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1">
															<p className="font-semibold">{request.user.name}</p>
															<Badge variant="outline" className="text-xs">
																<Calendar className="w-3 h-3 mr-1" />
																{new Date(request.createdAt).toLocaleDateString()}
															</Badge>
														</div>
														<p className="text-sm text-muted-foreground mb-2">
															Tour: <span className="font-medium">{request.tour.name}</span>
														</p>
														<div className="bg-muted p-3 rounded-md">
															<p className="text-sm flex items-start gap-2">
																<MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
																<span>{request.reason}</span>
															</p>
														</div>
													</div>
												</div>
												<div className="flex gap-2 lg:flex-col">
													<Button
														variant="default"
														size="sm"
														onClick={() => {
															setSelectedRequest(request.id);
															setActionType("approve");
														}}
													>
														<Check className="w-4 h-4 mr-1" />
														Approve
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															setSelectedRequest(request.id);
															setActionType("reject");
														}}
													>
														<X className="w-4 h-4 mr-1" />
														Reject
													</Button>
													<Button
														variant="destructive"
														size="sm"
														onClick={() => {
															setSelectedRequest(request.id);
															setActionType("criticize");
														}}
													>
														<AlertTriangle className="w-4 h-4 mr-1" />
														Criticize
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Reviewed Requests */}
					{reviewedRequests.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Previously Reviewed ({reviewedRequests.length})</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{reviewedRequests.map((request) => (
										<div
											key={request.id}
											className="border rounded-lg p-4 bg-muted/30"
										>
											<div className="flex items-start justify-between gap-4">
												<div className="flex items-start gap-3 flex-1">
													<Avatar className="w-10 h-10">
														<AvatarImage src={request.user.image ?? undefined} />
														<AvatarFallback>
															{request.user.name?.[0] ?? "U"}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 min-w-0">
														<p className="font-medium">{request.user.name}</p>
														<p className="text-sm text-muted-foreground">
															{request.tour.name}
														</p>
														{request.status === "CRITICIZED" && request.criticismRating && (
															<div className="flex items-center gap-1 mt-1">
																<span className="text-sm text-destructive">Criticism:</span>
																{Array.from({ length: request.criticismRating }).map((_, i) => (
																	<Star key={i} className="w-3 h-3 fill-destructive text-destructive" />
																))}
																<span className="text-xs text-muted-foreground ml-2">
																	{request.criticismReason}
																</span>
															</div>
														)}
														{request.organizationResponse && (
															<p className="text-sm text-muted-foreground mt-1">
																Response: {request.organizationResponse}
															</p>
														)}
													</div>
												</div>
												<div className="flex flex-col items-end gap-1">
													{getStatusBadge(request.status)}
													<span className="text-xs text-muted-foreground">
														{request.reviewedAt && new Date(request.reviewedAt).toLocaleDateString()}
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{/* Action Dialog */}
			<Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => closeDialog()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{actionType === "approve" && "Approve Leave Request"}
							{actionType === "reject" && "Reject Leave Request"}
							{actionType === "criticize" && (
								<span className="flex items-center gap-2 text-destructive">
									<AlertTriangle className="w-5 h-5" />
									Criticize Leave Request
								</span>
							)}
						</DialogTitle>
						<DialogDescription>
							{actionType === "approve" &&
								"The guide will be removed from the tour without any penalty."}
							{actionType === "reject" &&
								"The guide will remain assigned to the tour. Please provide a reason."}
							{actionType === "criticize" &&
								"The guide will be removed from the tour with a penalty to their rating. Use this for invalid or unreasonable leave requests."}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{actionType === "criticize" && (
							<div className="space-y-2">
								<Label>Criticism Severity (affects guide rating)</Label>
								<Select value={criticismRating} onValueChange={setCriticismRating}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1">1 - Minor (slight impact)</SelectItem>
										<SelectItem value="2">2 - Low (small impact)</SelectItem>
										<SelectItem value="3">3 - Moderate (medium impact)</SelectItem>
										<SelectItem value="4">4 - Serious (significant impact)</SelectItem>
										<SelectItem value="5">5 - Severe (major impact)</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="response">
								{actionType === "approve" ? "Response (optional)" : "Reason (required)"}
							</Label>
							<Textarea
								id="response"
								placeholder={
									actionType === "approve"
										? "Optional message to the guide..."
										: "Explain your decision..."
								}
								value={response}
								onChange={(e) => setResponse(e.target.value)}
								rows={3}
							/>
							{actionType !== "approve" && (
								<p className="text-xs text-muted-foreground">
									{response.length}/10 characters minimum
								</p>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={closeDialog}>
							Cancel
						</Button>
						<Button
							variant={actionType === "criticize" ? "destructive" : "default"}
							disabled={
								isLoading ||
								(actionType !== "approve" && response.length < 10)
							}
							onClick={handleAction}
						>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Processing...
								</>
							) : (
								<>
									{actionType === "approve" && <><Check className="w-4 h-4 mr-1" /> Approve</>}
									{actionType === "reject" && <><X className="w-4 h-4 mr-1" /> Reject</>}
									{actionType === "criticize" && <><AlertTriangle className="w-4 h-4 mr-1" /> Criticize</>}
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	);
};

export default LeaveRequestsPage;
