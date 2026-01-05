import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { signUserToken, TOKEN_NAME_EXPORT } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  try {
    const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signUserToken(user);
    res.setHeader(
      "Set-Cookie",
      `${TOKEN_NAME_EXPORT}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
    );

    return res.status(200).json({ id: user.id, email: user.email, name: user.name, imageBase64: user.imageBase64 });
  } catch (err: any) {
    console.error("login error", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
