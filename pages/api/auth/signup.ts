import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { signUserToken, cookieOptions, TOKEN_NAME_EXPORT } from "../../../lib/auth";

type Body = {
  email?: string;
  password?: string;
  name?: string;
  imageBase64?: string; // optional small data URL
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = req.body as Body;

  if (!body?.email || !body?.password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const email = String(body.email).trim().toLowerCase();
  const password = String(body.password);
  const name = body.name ? String(body.name).trim() : null;
  const imageBase64 = body.imageBase64 ? String(body.imageBase64) : null;

  // Basic validation
  if (password.length < 6) return res.status(400).json({ error: "Password must be >= 6 chars" });

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        imageBase64,
      },
    });

    const token = signUserToken(user);
    // set httpOnly cookie
    res.setHeader(
      "Set-Cookie",
      `${TOKEN_NAME_EXPORT}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
    );

    return res.status(201).json({ id: user.id, email: user.email, name: user.name, imageBase64: user.imageBase64 });
  } catch (err: any) {
    console.error("signup error", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
