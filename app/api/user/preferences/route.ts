import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const preferencesSchema = z.object({
  theme: z.enum(["dark", "light"]).optional(),
  preferredGenres: z.array(z.string()).max(12).optional(),
  region: z.string().max(80).optional(),
});

function decodePreferredGenres(raw: string | null | undefined) {
  if (!raw) return [];

  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string").slice(0, 12);
  } catch {
    return [];
  }
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    preferences: preferences
      ? {
          ...preferences,
          preferredGenres: decodePreferredGenres(preferences.preferredGenres),
        }
      : null,
  });
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid preferences payload." }, { status: 400 });
  }

  const existing = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  });

  const resolvedPreferredGenres = parsed.data.preferredGenres ?? decodePreferredGenres(existing?.preferredGenres ?? "[]");
  const update = await prisma.userPreference.upsert({
    where: { userId: session.user.id },
    update: {
      theme: parsed.data.theme ?? existing?.theme ?? "dark",
      preferredGenres: JSON.stringify(resolvedPreferredGenres),
      region: parsed.data.region ?? existing?.region ?? null,
    },
    create: {
      userId: session.user.id,
      theme: parsed.data.theme ?? "dark",
      preferredGenres: JSON.stringify(resolvedPreferredGenres),
      region: parsed.data.region ?? null,
    },
  });

  return NextResponse.json({
    preferences: {
      ...update,
      preferredGenres: decodePreferredGenres(update.preferredGenres),
    },
  });
}
