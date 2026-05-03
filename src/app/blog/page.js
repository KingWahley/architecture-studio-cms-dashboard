"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Plus, Edit3, Trash2 } from "lucide-react";
import gsap from "gsap";

export default function BlogPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const cards = containerRef.current.querySelectorAll('.blog-card');
    gsap.fromTo(cards, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
  }, []);

  const posts = [
    { id: 1, title: "The Future of Sustainable Architecture in West Africa", author: "Alexander Okeke", date: "Oct 24, 2025", status: "active", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=2065&auto=format&fit=crop" },
    { id: 2, title: "Minimalism: How Less Creates More in Commercial Spaces", author: "Sophia Adebayo", date: "Oct 12, 2025", status: "active", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" },
    { id: 3, title: "Integrating Smart Technology in Modern Residential Design", author: "Alexander Okeke", date: "Draft", status: "draft", image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop" },
  ];

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-accent-deep-blue">Blog Posts</h2>
          <p className="text-text-secondary mt-1">Manage articles, news, and insights.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus size={16} />
          New Article
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="blog-card flex flex-col overflow-hidden">
            <div className="h-48 overflow-hidden bg-surface-dim relative">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <StatusBadge variant={post.status}>{post.status === 'active' ? 'Published' : 'Draft'}</StatusBadge>
              </div>
            </div>
            <CardHeader className="flex-1 pb-2">
              <div className="text-xs text-text-secondary mb-2">{post.date} &bull; {post.author}</div>
              <CardTitle className="text-lg line-clamp-2 leading-snug">{post.title}</CardTitle>
            </CardHeader>
            <CardFooter className="pt-4 border-t border-border-subtle mt-4 flex justify-between">
              <Button variant="ghost" size="sm" className="gap-2">
                <Edit3 size={14} /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-error hover:text-error hover:bg-error/10">
                <Trash2 size={14} />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
