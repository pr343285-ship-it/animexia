import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration payload." }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name ?? undefined,
      email: normalizedEmail,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
