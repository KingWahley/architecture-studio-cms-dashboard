"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Calendar as CalendarIcon, Clock, MapPin, Plus } from "lucide-react";
import gsap from "gsap";

export default function AppointmentsPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const cards = containerRef.current.querySelectorAll('.appointment-card');
    gsap.fromTo(cards, 
      { opacity: 0, x: -20 }, 
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  const appointments = [
    { id: 1, client: "Mr. Ade", topic: "Initial Consultation - Residential", date: "Today", time: "14:00 - 15:00", location: "Virtual (Zoom)", status: "new" },
    { id: 2, client: "EJ Investments", topic: "Marina Towers Phase 2 Review", date: "Tomorrow", time: "10:00 - 11:30", location: "Studio Office", status: "ongoing" },
    { id: 3, client: "Mrs. Okon", topic: "Material Selection", date: "Oct 28, 2025", time: "13:00 - 14:00", location: "Studio Office", status: "draft" },
  ];

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-accent-deep-blue">Appointments</h2>
          <p className="text-text-secondary mt-1">Manage client consultations and meetings.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus size={16} />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-semibold text-lg text-on-surface mb-2">Upcoming</h3>
          {appointments.map((apt) => (
            <Card key={apt.id} className="appointment-card flex flex-col sm:flex-row sm:items-center p-0 overflow-hidden">
              <div className="w-full sm:w-1/4 bg-surface-alt p-6 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-border-subtle">
                <div className="font-display font-bold text-accent-deep-blue text-xl">{apt.date}</div>
                <div className="flex items-center text-sm text-text-secondary mt-1 gap-1.5">
                  <Clock size={14} /> {apt.time}
                </div>
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-on-surface">{apt.client}</h4>
                  <StatusBadge variant={apt.status}>
                    {apt.status === 'new' ? 'Confirmed' : apt.status === 'ongoing' ? 'In Progress' : 'Pending'}
                  </StatusBadge>
                </div>
                <p className="text-sm text-text-secondary mb-3">{apt.topic}</p>
                <div className="flex items-center text-xs text-text-secondary gap-1.5">
                  <MapPin size={14} /> {apt.location}
                </div>
              </div>
              <div className="p-6 pt-0 sm:pt-6 sm:pl-0 flex flex-row sm:flex-col justify-end gap-2 border-t sm:border-t-0 border-border-subtle">
                <Button variant="secondary" size="sm">Reschedule</Button>
                <Button variant="ghost" size="sm" className="text-error hover:text-error hover:bg-error/10">Cancel</Button>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Calendar Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-surface-alt rounded-lg border border-border-subtle flex items-center justify-center text-text-secondary">
                <div className="text-center">
                  <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Calendar Widget</p>
                  <p className="text-xs">Integration Placeholder</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
