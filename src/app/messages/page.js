"use client";

import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Mail, MailOpen, Trash2, Reply } from "lucide-react";
import gsap from "gsap";

export default function MessagesPage() {
  const listRef = useRef(null);

  useEffect(() => {
    const items = listRef.current.querySelectorAll('.message-item');
    gsap.fromTo(items, 
      { opacity: 0, y: 10 }, 
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
    );
  }, []);

  const messages = [
    { id: 1, name: "Emmanuel John", email: "emmanuel@firm.com", subject: "Consultation Inquiry", preview: "Hello, I would like to schedule a consultation regarding a new commercial project in VI...", date: "10:45 AM", unread: true },
    { id: 2, name: "Sandra O.", email: "sandra@o-designs.com", subject: "Partnership Opportunity", preview: "We are an interior design firm looking to collaborate on your upcoming residential development...", date: "Yesterday", unread: true },
    { id: 3, name: "Marcus Tech", email: "marcus@techhub.ng", subject: "Project Update - Phase 2", preview: "Could we get the latest revisions for the Phase 2 floor plans? We need them for the...", date: "Oct 24", unread: false },
    { id: 4, name: "Victoria Ike", email: "victoria.i@mail.com", subject: "Residential Design Query", preview: "What is your typical timeline for a 4-bedroom contemporary residential design?", date: "Oct 21", unread: false },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-display font-semibold text-accent-deep-blue">Messages Inbox</h2>
          <p className="text-text-secondary mt-1">Manage contact form submissions and client inquiries.</p>
        </div>
      </div>

      <div className="flex-1 bg-surface-main rounded-lg border border-border-subtle flex overflow-hidden shadow-sm">
        {/* Inbox List */}
        <div className="w-1/3 border-r border-border-subtle flex flex-col">
          <div className="p-4 border-b border-border-subtle bg-surface-alt">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-9 pr-4 py-2 bg-white rounded-md border border-border-subtle text-sm focus:outline-none focus:ring-1 focus:ring-accent-deep-blue"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto" ref={listRef}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message-item p-4 border-b border-border-subtle cursor-pointer hover:bg-surface-alt transition-colors ${msg.unread ? 'bg-accent-deep-blue/5' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm ${msg.unread ? 'font-semibold text-on-surface' : 'font-medium text-text-secondary'}`}>
                    {msg.name}
                  </h4>
                  <span className="text-xs text-text-secondary">{msg.date}</span>
                </div>
                <h5 className={`text-sm mb-1 truncate ${msg.unread ? 'font-medium text-accent-deep-blue' : 'text-on-surface'}`}>
                  {msg.subject}
                </h5>
                <p className="text-xs text-text-secondary line-clamp-2">
                  {msg.preview}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Message Detail View */}
        <div className="flex-1 flex flex-col bg-surface-main">
          <div className="p-6 border-b border-border-subtle flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-dim flex items-center justify-center text-accent-deep-blue font-bold text-lg">
                EJ
              </div>
              <div>
                <h3 className="text-lg font-semibold text-on-surface">Emmanuel John</h3>
                <p className="text-sm text-text-secondary">emmanuel@firm.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" title="Mark as unread">
                <Mail size={18} />
              </Button>
              <Button variant="ghost" size="icon" title="Delete" className="text-error hover:text-error hover:bg-error/10">
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-xl font-display font-semibold text-accent-deep-blue mb-6">Consultation Inquiry</h2>
            <div className="text-sm text-on-surface leading-relaxed space-y-4">
              <p>Hello,</p>
              <p>I would like to schedule a consultation regarding a new commercial project in Victoria Island. We have acquired a plot of land and are looking to develop a 6-story modern office complex.</p>
              <p>We've seen your recent work on the Marina Towers and were highly impressed with the minimalist architectural approach.</p>
              <p>Could you let me know your availability next week for an initial discussion? Also, please share any preliminary requirements you might need from our end before the meeting.</p>
              <p>Best regards,<br/>Emmanuel John<br/>Managing Director, EJ Investments</p>
            </div>
          </div>

          <div className="p-6 border-t border-border-subtle bg-surface-alt">
            <div className="flex gap-4">
              <Button className="gap-2">
                <Reply size={16} />
                Reply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
