export const runtime = 'edge'


import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, profession } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha sÃ£o obrigatÃ³rios" },
        { status: 400 }
      );
    }

    // Verificar se usuÃ¡rio jÃ¡ existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "UsuÃ¡rio jÃ¡ existe com este email" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuÃ¡rio
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        phone,
        profession,
        name: `${firstName} ${lastName}`.trim(),
      }
    });

    return NextResponse.json({
      message: "UsuÃ¡rio criado com sucesso",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
