import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendUrbanStoriesEmail } from "@/lib/email/community";
import { getWriteClient } from "@/lib/sanity/write-client";

const subscriptionSchema = z.object({
  email: z.string().trim().email().max(254),
  website: z.string().max(0).optional(),
});
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 2048) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    const parsed = subscriptionSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (parsed.data.website) return NextResponse.json({ message: "Please check your inbox to confirm your subscription." });

    const email = parsed.data.email.toLowerCase();
    const client = getWriteClient();
    const subscriberId = `newsletterSubscriber-${hash(email).slice(0, 40)}`;
    const existing = await client.fetch<{ _id: string; status: string; lastConfirmationSentAt?: string } | null>(
      '*[_type == "newsletterSubscriber" && _id == $id][0]{_id,status,lastConfirmationSentAt}',
      { id: subscriberId },
    );
    if (existing?.status === "subscribed") {
      return NextResponse.json({ message: "This email is already subscribed." }, { status: 409 });
    }
    if (existing?.lastConfirmationSentAt && Date.now() - Date.parse(existing.lastConfirmationSentAt) < 60_000) {
      return NextResponse.json({ message: "A confirmation email was just sent. Please check your inbox." });
    }

    const baseUrl = siteUrl();
    if (!baseUrl || !process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      return NextResponse.json({ error: "Newsletter confirmation is temporarily unavailable. Please try again later." }, { status: 503 });
    }

    const now = new Date().toISOString();
    const confirmationToken = randomBytes(32).toString("hex");
    const unsubscribeToken = randomBytes(32).toString("hex");
    const confirmationTokenHash = hash(confirmationToken);
    const unsubscribeTokenHash = hash(unsubscribeToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const subscriber = await client.createIfNotExists({
      _id: subscriberId,
      _type: "newsletterSubscriber",
      email,
      status: "pending",
      createdAt: now,
    });
    await client.patch(subscriber._id).set({
      status: "pending",
      confirmationTokenHash,
      confirmationExpiresAt: expiresAt,
      unsubscribeTokenHash,
      updatedAt: now,
    }).commit();

    try {
      const sent = await sendUrbanStoriesEmail({
        to: email,
        template: "newsletterConfirmation",
        data: {
          actionUrl: `${baseUrl}/api/newsletter?token=${confirmationToken}`,
          actionLabel: "Confirm subscription",
          unsubscribeUrl: `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`,
          message: "Welcome to Urban Stories. Confirm your email address to receive fresh perspectives on technology, culture and travel.",
        },
        idempotencyKey: `newsletter-confirm-${subscriber._id}-${confirmationTokenHash}`,
      });
      if (!sent.sent) throw new Error("Resend is not configured.");
      await client.patch(subscriber._id).set({ lastConfirmationSentAt: new Date().toISOString() }).commit();
    } catch (error) {
      await client.patch(subscriber._id).unset(["confirmationTokenHash", "confirmationExpiresAt", "unsubscribeTokenHash"]).set({ status: "pending", updatedAt: new Date().toISOString() }).commit();
      throw error;
    }

    return NextResponse.json({ message: "Check your inbox for a confirmation email to complete your subscription." });
  } catch (error) {
    console.error("Newsletter subscription failed", error);
    const message = error instanceof Error && error.message === "SANITY_API_WRITE_TOKEN is not configured"
      ? "Newsletter subscriptions are temporarily unavailable. Please try again later."
      : "We couldn't process your subscription right now. Please try again later.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "This confirmation link is invalid." }, { status: 400 });
  }
  try {
    const client = getWriteClient();
    const subscriber = await client.fetch<{ _id: string; confirmationExpiresAt?: string } | null>(
      '*[_type == "newsletterSubscriber" && confirmationTokenHash == $token][0]{_id,confirmationExpiresAt}',
      { token: hash(token) } as never,
    );
    if (!subscriber || !subscriber.confirmationExpiresAt || Date.parse(subscriber.confirmationExpiresAt) < Date.now()) {
      return NextResponse.json({ error: "This confirmation link is invalid or has expired. Please subscribe again." }, { status: 410 });
    }
    await client.patch(subscriber._id).set({ status: "subscribed", confirmedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).unset(["confirmationTokenHash", "confirmationExpiresAt"]).commit();
    return NextResponse.redirect(new URL("/?newsletter=confirmed", request.url));
  } catch (error) {
    console.error("Newsletter confirmation failed", error);
    return NextResponse.json({ error: "Unable to confirm your subscription right now." }, { status: 503 });
  }
}
