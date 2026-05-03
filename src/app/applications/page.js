"use client";

import React, { useEffect, useRef } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Download, MoreHorizontal } from "lucide-react";
import gsap from "gsap";

export default function ApplicationsPage() {
  const tableRef = useRef(null);

  useEffect(() => {
    const rows = tableRef.current.querySelectorAll('tbody tr');
    gsap.fromTo(rows, 
      { opacity: 0, x: -10 }, 
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
    );
  }, []);

  const applications = [
    { id: "APP-001", name: "David Olatunji", email: "david.o@example.com", role: "Senior Architect", date: "Oct 24, 2025", status: "new" },
    { id: "APP-002", name: "Sarah Meyer", email: "smeyer@example.com", role: "Interior Designer", date: "Oct 22, 2025", status: "completed" },
    { id: "APP-003", name: "Ibrahim Musa", email: "ibrahim99@example.com", role: "Project Manager", date: "Oct 20, 2025", status: "ongoing" },
    { id: "APP-004", name: "Grace Okafor", email: "g.okafor@example.com", role: "Junior Architect", date: "Oct 18, 2025", status: "draft" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-accent-deep-blue">Job Applications</h2>
        <p className="text-text-secondary mt-1">Review and manage candidates for open vacancies.</p>
      </div>

      <div className="bg-surface-main rounded-lg border border-border-subtle shadow-sm overflow-hidden" ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-alt hover:bg-surface-alt">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Role Applied For</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium text-text-secondary">{app.id}</TableCell>
                <TableCell>
                  <div className="font-medium text-on-surface">{app.name}</div>
                  <div className="text-xs text-text-secondary">{app.email}</div>
                </TableCell>
                <TableCell>{app.role}</TableCell>
                <TableCell>{app.date}</TableCell>
                <TableCell>
                  <StatusBadge variant={app.status}>
                    {app.status === 'new' ? 'New' : app.status === 'completed' ? 'Reviewed' : app.status === 'ongoing' ? 'Interviewing' : 'Rejected'}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" title="Download Resume">
                      <Download size={16} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
