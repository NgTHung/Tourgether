"use client";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Compass, Users, Briefcase, ArrowRight } from "lucide-react";
import heroImage from "public/assets/hero-beach-jgTo3uaI.jpg";
// import { router.push } from "next/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";
import { useEffect } from "react";

// /
const Index = () => {
	const router = useRouter();
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();

	useEffect(() => {
		if (!isSessionPending && session?.user) {
			if (session.user.role === "GUIDE") {
				router.push("/student/dashboard");
			} else {
				router.push("/business/dashboard");
			}
		}
	}, [isSessionPending, session, router]);
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative h-screen flex items-center justify-center overflow-hidden bg-primary">
				<div className="absolute inset-0">
					<Image
						src={heroImage}
						alt="Beautiful beach destination"
						className="w-full h-full object-cover opacity-20"
					/>
				</div>

				<div className="relative z-10 container px-4 text-center">
					<div className="flex items-center justify-center gap-3 mb-6">
						<div className="p-3 bg-gradient-primary rounded-2xl">
							<Compass className="w-12 h-12 text-primary-foreground" />
						</div>
					</div>
					<h1 className="text-5xl md:text-7xl font-bold mb-6 text-primary-foreground drop-shadow-lg">
						Tourgether
					</h1>
					<p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
						{" "}
						Connecting tourism students with businesses worldwide
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							onClick={() => router.push("/signup")}
							variant="gradient"
							size="lg"
							className="text-lg"
						>
							Get Started
							<ArrowRight className="w-5 h-5 ml-2" />
						</Button>
						<Button
							onClick={() => router.push("/feed")}
							variant="outline"
							size="lg"
							className="text-lg"
						>
							Explore Tours
						</Button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-24 px-4">
				<div className="container mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							One Platform, Two Perspectives
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Whether you&apos;re a student seeking opportunities
							or a business creating tours, we&apos;ve got you
							covered.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
						<Card className="border-2 hover:border-primary transition-colors">
							<CardContent className="p-8">
								<div className="mb-6">
									<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
										<Briefcase className="w-8 h-8 text-primary" />
									</div>
									<h3 className="text-2xl font-bold mb-3">
										For Students
									</h3>
									<p className="text-muted-foreground">
										Find meaningful work and gigs in the
										tourism industry. Build your experience
										and earn while exploring the world.
									</p>
								</div>
								<ul className="space-y-3 mb-6">
									<li className="flex items-start gap-2">
										<div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
										<span className="text-sm">
											Browse available tours and gigs
										</span>
									</li>
									<li className="flex items-start gap-2">
										<div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
										<span className="text-sm">
											Apply to positions instantly
										</span>
									</li>
									<li className="flex items-start gap-2">
										<div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
										<span className="text-sm">
											Build your reputation with ratings
										</span>
									</li>
								</ul>
								<Button
									onClick={() => router.push("/signup")}
									variant="default"
									className="w-full"
								>
									Join as Student
								</Button>
							</CardContent>
						</Card>

						<Card className="border-2 hover:border-accent transition-colors">
							<CardContent className="p-8">
								<div className="mb-6">
									<div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
										<Users className="w-8 h-8 text-accent" />
									</div>
									<h3 className="text-2xl font-bold mb-3">
										For Businesses
									</h3>
									<p className="text-muted-foreground">
										Hire talented tourism students and
										create unforgettable experiences around
										the globe.
									</p>
								</div>
								<ul className="space-y-3 mb-6">
									<li className="flex items-start gap-2">
										<div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
										<span className="text-sm">
											Create and manage tours easily
										</span>
									</li>
									<li className="flex items-start gap-2">
										<div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
										<span className="text-sm">
											Access qualified student guides
										</span>
									</li>
									<li className="flex items-start gap-2">
										<div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
										<span className="text-sm">
											Grow your business globally
										</span>
									</li>
								</ul>
								<Button
									onClick={() => router.push("/signup")}
									variant="accent"
									className="w-full"
								>
									Join as Business
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 px-4 bg-linear-to-br from-primary/10 via-background to-accent/10">
				<div className="container mx-auto text-center">
					<h2 className="text-3xl md:text-5xl font-bold mb-6">
						Ready to Start Your Journey?
					</h2>
					<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
						Join thousands of students and businesses already
						connected on Tourgether
					</p>
					<Button
						onClick={() => router.push("/signup")}
						variant="gradient"
						size="lg"
						className="text-lg"
					>
						Get Started Today
						<ArrowRight className="w-5 h-5 ml-2" />
					</Button>
				</div>
			</section>
		</div>
	);
};

export default Index;
