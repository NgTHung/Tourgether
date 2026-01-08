"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { organizations, tourGuide } from "~/server/db/schema/tour";
import { user } from "~/server/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { getSession } from "~/server/better-auth/server";
import { redirect } from "next/navigation";

const businessSchema = z.object({
  taxId: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive("Tax ID must be a positive number")),
  website: z.url("Invalid URL").optional().or(z.literal("")),
  slogan: z.string().min(1, "Slogan is required").max(500, "Slogan is too long"),
});

const studentSchema = z.object({
  school: z.string().min(1, "School is required").max(200),
  description: z.string().min(50, "Description must be at least 50 characters").max(2000),
  certificates: z.string().optional(), // JSON string
  workExperience: z.string().optional(), // JSON string
  cvUrl: z.string().optional(),
});

export async function updateBusinessProfile(prevState: { error: string; errors?: undefined; } | { errors: { taxId?: string[] | undefined; slogan?: string[] | undefined; website?: string[] | undefined; }; error?: undefined; } | null, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const intent = formData.get("intent");
  const callbackUrl = formData.get("callbackUrl") as string;

  if (intent === "skip") {
    // Update finishedOnboardings to true so they don't get redirected back
    await db.update(user)
        .set({ finishedOnboardings: true })
        .where(eq(user.id, session.user.id));
        
    if (callbackUrl) redirect(callbackUrl);
    redirect("/business/dashboard");
  }

  const rawData = {
    taxId: formData.get("taxId"),
    website: formData.get("website"),
    slogan: formData.get("slogan"),
  };

  const validated = businessSchema.safeParse(rawData);

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    const existing = await db.query.organizations.findFirst({
        where: eq(organizations.userID, session.user.id)
    });

    if (existing) {
        await db.update(organizations)
            .set({
                taxID: validated.data.taxId,
                websiteURL: validated.data.website ?? null,
                slogan: validated.data.slogan,
            })
            .where(eq(organizations.userID, session.user.id));
    } else {
        await db.insert(organizations).values({
            userID: session.user.id,
            taxID: validated.data.taxId,
            websiteURL: validated.data.website ?? null,
            slogan: validated.data.slogan,
        });
    }

    await db.update(user)
        .set({ finishedOnboardings: true })
        .where(eq(user.id, session.user.id));

  } catch (error) {
    console.error("Error updating business profile:", error);
    return { error: "Failed to update profile. Please try again." };
  }

  if (callbackUrl) redirect(callbackUrl);
  redirect("/business/dashboard");
}

export async function updateStudentProfile(prevState: { error: string; errors?: undefined; } | { errors: { school?: string[] | undefined; description?: string[] | undefined; certificates?: string[] | undefined; workExperience?: string[] | undefined; cvUrl?: string[] | undefined; }; error?: undefined; } | null, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const intent = formData.get("intent");
  const callbackUrl = formData.get("callbackUrl") as string;

  if (intent === "skip") {
     // Create empty profile as per original logic
     const existing = await db.query.tourGuide.findFirst({
        where: eq(tourGuide.userID, session.user.id)
    });

    if (!existing) {
        await db.insert(tourGuide).values({
            userID: session.user.id,
            school: "",
            description: "",
            certificates: [],
            workExperience: [],
            cvUrl: "",
        });
    }

    await db.update(user)
        .set({ finishedOnboardings: true })
        .where(eq(user.id, session.user.id));

    if (callbackUrl) redirect(callbackUrl);
    redirect("/student/dashboard");
  }

  const rawData = {
    school: formData.get("school"),
    description: formData.get("description"),
    certificates: formData.get("certificates"),
    workExperience: formData.get("workExperience"),
    cvUrl: formData.get("cvUrl"),
  };

  const validated = studentSchema.safeParse(rawData);

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  try {
    const certificates = validated.data.certificates ? (JSON.parse(validated.data.certificates) as Array<string>) : [];
    const workExperience = validated.data.workExperience ? (JSON.parse(validated.data.workExperience) as Array<string>): [];

    const existing = await db.query.tourGuide.findFirst({
        where: eq(tourGuide.userID, session.user.id)
    });

    if (existing) {
        await db.update(tourGuide)
            .set({
                school: validated.data.school,
                description: validated.data.description,
                certificates: certificates,
                workExperience: workExperience,
                cvUrl: validated.data.cvUrl,
            })
            .where(eq(tourGuide.userID, session.user.id));
    } else {
        await db.insert(tourGuide).values({
            userID: session.user.id,
            school: validated.data.school,
            description: validated.data.description,
            certificates: certificates,
            workExperience: workExperience,
            cvUrl: validated.data.cvUrl,
        });
    }

    await db.update(user)
        .set({ finishedOnboardings: true })
        .where(eq(user.id, session.user.id));

  } catch (error) {
    console.error("Error updating student profile:", error);
    return { error: "Failed to update profile. Please try again." };
  }

  if (callbackUrl) redirect(callbackUrl);
  redirect("/student/dashboard");
}
