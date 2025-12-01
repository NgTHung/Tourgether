"use server";

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "~/lib/s3";
import { env } from "~/env";
import { auth } from "~/auth";
import { headers } from "next/headers";

const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
];
const ALLOWED_DOCUMENT_TYPES = [
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type FileType = "image" | "document";

function validateFileType(contentType: string, fileType: FileType): boolean {
	if (fileType === "image") {
		return ALLOWED_IMAGE_TYPES.includes(contentType);
	}
	return ALLOWED_DOCUMENT_TYPES.includes(contentType);
}

function getFileKey(
	userId: string,
	fileType: FileType,
	filename: string,
): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const fileExtension = filename.split(".").pop();
	const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

	return `uploads/${userId}/${fileType}/${year}/${month}/${uniqueFilename}`;
}

export async function getPresignedUrl(
	filename: string,
	contentType: string,
	fileSize: number,
	fileType: FileType = "image",
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Unauthorized");
	}
	console.log("Generating presigned URL for:", {
		filename,
		contentType,
		fileSize,
		fileType,
	});
	// Server-side validation
	if (!validateFileType(contentType, fileType)) {
		throw new Error(
			`Invalid file type. Allowed types: ${fileType === "image" ? ALLOWED_IMAGE_TYPES.join(", ") : ALLOWED_DOCUMENT_TYPES.join(", ")}`,
		);
	}
	console.log("File type validated");

	if (fileSize > MAX_FILE_SIZE) {
		throw new Error(
			`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
		);
	}

	console.log("File size validated");

	const key = getFileKey(session.user.id, fileType, filename);

	console.log("Generated file key:", key);

	const command = new PutObjectCommand({
		Bucket: env.S3_BUCKET_NAME,
		Key: key,
		ContentType: contentType,
		Metadata: {
			"uploaded-by": session.user.id,
			"original-filename": filename,
			"upload-date": new Date().toISOString(),
		},
	});

	console.log("Created PutObjectCommand:", command);

	const uploadUrl = await getSignedUrl(s3Client, command, {
		expiresIn: 3600,
	});

	console.log("Generated presigned URL:", uploadUrl);

	// Generate permanent public URL for Backblaze B2
	const fileUrl = `https://${env.S3_ENDPOINT}/${env.S3_BUCKET_NAME}/${key}`;

	console.log("Generated file URL:", fileUrl);

	return {
		uploadUrl,
		fileUrl,
		key, // Return key for potential deletion
	};
}

export async function deleteFile(fileUrl: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Unauthorized");
	}

	try {
		// Extract key from URL
		const url = new URL(fileUrl);
		const key = decodeURIComponent(url.pathname.substring(1));

		// Verify the file belongs to the user
		if (!key.startsWith(`uploads/${session.user.id}/`)) {
			throw new Error("Unauthorized to delete this file");
		}

		const command = new DeleteObjectCommand({
			Bucket: env.S3_BUCKET_NAME,
			Key: key,
		});

		await s3Client.send(command);
		return { success: true };
	} catch (error) {
		console.error("Failed to delete file:", error);
		throw new Error("Failed to delete file from storage");
	}
}
