/**
 * S3 presigned URL for direct upload. Admin only.
 * Production: use CloudFront URL in response for public read.
 */
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION ?? "ap-south-1";
const bucket = process.env.S3_BUCKET_PROPERTY_IMAGES ?? "";
const cloudFrontUrl = process.env.S3_CLOUDFRONT_URL ?? "";

export function getS3Client(): S3Client | null {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !bucket) return null;
  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export function getPublicUrl(s3Key: string): string {
  if (cloudFrontUrl) {
    return cloudFrontUrl.endsWith("/") ? `${cloudFrontUrl}${s3Key}` : `${cloudFrontUrl}/${s3Key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}

export async function createPresignedPut(
  key: string,
  contentType: string,
  expiresInSeconds: number = 60
): Promise<{ url: string; key: string } | null> {
  const client = getS3Client();
  if (!client) return null;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return { url, key };
}
