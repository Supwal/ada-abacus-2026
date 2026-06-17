
'use client';

import { useEffect, useState } from "react";
import { Clock, User, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  client: {
    name: string;
  };
  service: {
    name: string;
  };
}

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      const response = await fetch('/api/appointments/today');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-6">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 mb-4">
          Nenhum agendamento para hoje
        </p>
        <Link href="/agenda/novo">
          <Button size="sm">
            Criar Agendamento
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.slice(0, 5).map((appointment) => (
        <div
          key={appointment.id}
          className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {appointment.client.name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {appointment.service.name}
            </p>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {appointment.startTime} - {appointment.endTime}
            </div>
          </div>
        </div>
      ))}
      
      {appointments.length > 5 && (
        <div className="text-center pt-2">
          <Link href="/agenda">
            <Button variant="ghost" size="sm">
              Ver todos ({appointments.length})
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
