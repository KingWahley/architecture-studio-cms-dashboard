"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Building2, Briefcase, FileText, MessageSquare, Calendar } from "lucide-react";
import gsap from "gsap";

export default function DashboardPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP Stagger animation for cards
    const cards = containerRef.current.querySelectorAll('.stat-card');
    gsap.fromTo(cards, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  const stats = [
    { title: "Total Projects", value: "24", icon: Building2, trend: "+2 this month" },
    { title: "Active Vacancies", value: "3", icon: Briefcase, trend: "1 closing soon" },
    { title: "New Applications", value: "12", icon: FileText, trend: "+4 this week" },
    { title: "Unread Messages", value: "5", icon: MessageSquare, trend: "Requires attention" },
    { title: "Appointments", value: "8", icon: Calendar, trend: "Next in 2 hours" },
  ];

  return (
    <div className="space-y-8" ref={containerRef}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-accent-deep-blue">Dashboard Overview</h2>
          <p className="text-text-secondary mt-1">Welcome back. Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-accent-muted-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-on-surface">{stat.value}</div>
              <p className="text-xs text-text-secondary mt-2 flex items-center">
                <span className="text-status-active mr-1">↑</span> {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New application received", target: "Senior Architect role", time: "2 hours ago" },
                { action: "Project updated", target: "Lagos Marina Towers", time: "5 hours ago" },
                { action: "Appointment booked", target: "Consultation with Mr. Ade", time: "Yesterday" },
                { action: "Blog post published", target: "Future of Sustainable Design", time: "2 days ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-border-subtle last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-accent-deep-blue shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-on-surface">{item.action}</p>
                    <p className="text-xs text-text-secondary">{item.target} &bull; {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used tools</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 bg-surface-alt rounded-lg border border-border-subtle hover:border-accent-deep-blue hover:bg-white transition-colors group">
              <Building2 className="h-8 w-8 text-text-secondary group-hover:text-accent-deep-blue mb-3" />
              <span className="text-sm font-medium text-on-surface">Add Project</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-surface-alt rounded-lg border border-border-subtle hover:border-accent-deep-blue hover:bg-white transition-colors group">
              <Briefcase className="h-8 w-8 text-text-secondary group-hover:text-accent-deep-blue mb-3" />
              <span className="text-sm font-medium text-on-surface">Post Vacancy</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-surface-alt rounded-lg border border-border-subtle hover:border-accent-deep-blue hover:bg-white transition-colors group">
              <FileText className="h-8 w-8 text-text-secondary group-hover:text-accent-deep-blue mb-3" />
              <span className="text-sm font-medium text-on-surface">Write Post</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-surface-alt rounded-lg border border-border-subtle hover:border-accent-deep-blue hover:bg-white transition-colors group">
              <Calendar className="h-8 w-8 text-text-secondary group-hover:text-accent-deep-blue mb-3" />
              <span className="text-sm font-medium text-on-surface">Schedule</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
