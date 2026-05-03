"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/Input";
import { Plus, Search, MapPin, Calendar, MoreVertical } from "lucide-react";
import gsap from "gsap";

export default function ProjectsPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const cards = containerRef.current.querySelectorAll('.project-card');
    gsap.fromTo(cards, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  const projects = [
    { 
      id: 1, title: "Lagos Marina Towers", category: "Commercial", 
      location: "Lagos, NG", year: "2025", status: "ongoing", 
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
    },
    { 
      id: 2, title: "Ikoyi Residence", category: "Residential", 
      location: "Lagos, NG", year: "2024", status: "completed", 
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop" 
    },
    { 
      id: 3, title: "Abuja Tech Hub", category: "Commercial", 
      location: "Abuja, NG", year: "2024", status: "completed", 
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
    },
    { 
      id: 4, title: "Victoria Island Mall", category: "Retail", 
      location: "Lagos, NG", year: "2026", status: "draft", 
      image: "https://images.unsplash.com/photo-1519567281799-9637b92f44eb?q=80&w=2070&auto=format&fit=crop" 
    },
  ];

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-accent-deep-blue">Projects Portfolio</h2>
          <p className="text-text-secondary mt-1">Manage all architectural projects and case studies.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus size={16} />
          Add Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-main p-4 rounded-lg border border-border-subtle">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <Input placeholder="Search projects by name, location..." className="pl-10 max-w-md" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select className="h-9 rounded-md border border-border-subtle bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent-deep-blue w-full sm:w-auto">
            <option value="">All Categories</option>
            <option value="commercial">Commercial</option>
            <option value="residential">Residential</option>
          </select>
          <select className="h-9 rounded-md border border-border-subtle bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent-deep-blue w-full sm:w-auto">
            <option value="">Status</option>
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="project-card overflow-hidden group flex flex-col">
            <div className="relative h-48 overflow-hidden bg-surface-dim">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <StatusBadge variant={project.status}>{project.status.toUpperCase()}</StatusBadge>
              </div>
              <button className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur text-on-surface rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={16} />
              </button>
            </div>
            <CardHeader className="pb-3 flex-1">
              <div className="text-xs font-semibold text-accent-muted-gold uppercase tracking-wider mb-1">
                {project.category}
              </div>
              <CardTitle className="text-lg">{project.title}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  {project.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {project.year}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t border-border-subtle mt-auto bg-surface-alt/30 group-hover:bg-surface-alt transition-colors">
              <Button variant="ghost" className="w-full justify-between h-12">
                Edit Details
                <span>&rarr;</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
