export const runtime = 'edge'


import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Ãšltimo 7 dias para o grÃ¡fico
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    // Agendamentos de hoje
    const todayAppointments = await prisma.appointment.count({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lte: endOfDay
        }
      }
    });

    // Ganhos do mÃªs
    const monthlyEarnings = await prisma.earning.aggregate({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfMonth,
          lte: endOfDay
        }
      },
      _sum: {
        amount: true
      }
    });

    // Despesas do mÃªs
    const monthlyExpenses = await prisma.expense.aggregate({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfMonth,
          lte: endOfDay
        }
      },
      _sum: {
        amount: true
      }
    });

    // Total de clientes
    const totalClients = await prisma.client.count({
      where: {
        userId: session.user.id
      }
    });

    // Dados dos Ãºltimos 7 dias para o grÃ¡fico
    const earningsLast7Days = await prisma.earning.groupBy({
      by: ['date'],
      where: {
        userId: session.user.id,
        date: {
          gte: last7Days,
          lte: endOfDay
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Formatar dados do grÃ¡fico preenchendo dias sem dados
    const earningsData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      
      const dayData = earningsLast7Days.find(earning => {
        const earningDate = new Date(earning.date);
        earningDate.setHours(0, 0, 0, 0);
        return earningDate.getTime() === date.getTime();
      });

      earningsData.push({
        date: date.toISOString().split('T')[0],
        amount: dayData?._sum?.amount || 0
      });
    }

    return NextResponse.json({
      todayAppointments,
      monthlyEarnings: monthlyEarnings._sum.amount || 0,
      monthlyExpenses: monthlyExpenses._sum.amount || 0,
      totalClients,
      earningsData
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
