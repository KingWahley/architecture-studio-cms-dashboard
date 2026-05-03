"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Plus, MapPin, Clock, Users } from "lucide-react";
import gsap from "gsap";

export default function VacanciesPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const cards = containerRef.current.querySelectorAll('.vacancy-card');
    gsap.fromTo(cards, 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  const vacancies = [
    { id: 1, title: "Senior Architectural Designer", location: "Lagos, NG", type: "Full-time", applicants: 12, status: "active", posted: "Oct 10, 2025" },
    { id: 2, title: "Project Manager", location: "Abuja, NG", type: "Full-time", applicants: 5, status: "active", posted: "Oct 15, 2025" },
    { id: 3, title: "BIM Modeler", location: "Remote", type: "Contract", applicants: 24, status: "draft", posted: "Unpublished" },
  ];

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-accent-deep-blue">Vacancies</h2>
          <p className="text-text-secondary mt-1">Manage open job postings and roles.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus size={16} />
          Create Vacancy
        </Button>
      </div>

      <div className="space-y-4">
        {vacancies.map((job) => (
          <Card key={job.id} className="vacancy-card flex flex-col md:flex-row md:items-center justify-between p-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-display font-semibold text-on-surface">{job.title}</h3>
                <StatusBadge variant={job.status}>{job.status === 'active' ? 'Open' : 'Draft'}</StatusBadge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</div>
                <div className="flex items-center gap-1.5"><Clock size={14} />{job.type}</div>
                <div className="flex items-center gap-1.5"><Users size={14} />{job.applicants} Applicants</div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-3 md:border-l md:border-border-subtle md:pl-6">
              <div className="text-sm text-text-secondary mr-4 hidden md:block">
                Posted: <br /> <span className="font-medium text-on-surface">{job.posted}</span>
              </div>
              <Button variant="secondary">Edit</Button>
              <Button variant={job.status === 'active' ? 'ghost' : 'default'} className={job.status === 'active' ? 'text-error hover:bg-error/10 hover:text-error' : ''}>
                {job.status === 'active' ? 'Close Role' : 'Publish'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
