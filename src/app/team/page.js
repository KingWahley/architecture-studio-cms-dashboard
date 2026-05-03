"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Mail, Phone, MoreHorizontal } from "lucide-react";
import gsap from "gsap";

export default function TeamPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const cards = containerRef.current.querySelectorAll('.team-card');
    gsap.fromTo(cards, 
      { scale: 0.95, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.2)" }
    );
  }, []);

  const team = [
    { id: 1, name: "Alexander Okeke", role: "Principal Architect", email: "alex@pieach.com", phone: "+234 800 123 4567" },
    { id: 2, name: "Sophia Adebayo", role: "Senior Interior Designer", email: "sophia@pieach.com", phone: "+234 800 234 5678" },
    { id: 3, name: "Michael Obi", role: "Project Manager", email: "michael@pieach.com", phone: "+234 800 345 6789" },
    { id: 4, name: "Elena Rossi", role: "Landscape Architect", email: "elena@pieach.com", phone: "+234 800 456 7890" },
    { id: 5, name: "David Johnson", role: "Junior Architect", email: "david@pieach.com", phone: "+234 800 567 8901" },
  ];

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-accent-deep-blue">Team Management</h2>
          <p className="text-text-secondary mt-1">Manage staff profiles and studio directory.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus size={16} />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {team.map((member) => (
          <Card key={member.id} className="team-card text-center relative group">
            <button className="absolute top-3 right-3 p-1.5 text-text-secondary hover:bg-surface-alt rounded-md opacity-0 group-hover:opacity-100 transition-all">
              <MoreHorizontal size={16} />
            </button>
            <CardHeader className="pt-8 pb-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-surface-dim mb-4 flex items-center justify-center text-accent-deep-blue text-2xl font-bold">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <CardTitle className="text-lg">{member.name}</CardTitle>
              <p className="text-sm text-accent-muted-gold font-medium mt-1">{member.role}</p>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex flex-col gap-2 text-sm text-text-secondary">
                <div className="flex items-center justify-center gap-2">
                  <Mail size={14} />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone size={14} />
                  <span>{member.phone}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 justify-center">
              <Button variant="secondary" className="w-full">View Profile</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
