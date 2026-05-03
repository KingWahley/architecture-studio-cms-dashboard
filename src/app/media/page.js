"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { UploadCloud, Search, Trash2, Folder, Image as ImageIcon } from "lucide-react";
import gsap from "gsap";

export default function MediaPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const items = containerRef.current.querySelectorAll('.media-item');
    gsap.fromTo(items, 
      { scale: 0.9, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: "back.out(1.2)" }
    );
  }, []);

  const mediaFiles = [
    { id: 1, type: "folder", name: "Project Renders" },
    { id: 2, type: "folder", name: "Team Headshots" },
    { id: 3, type: "image", name: "marina-tower-ext.jpg", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" },
    { id: 4, type: "image", name: "ikoyi-interior.jpg", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop" },
    { id: 5, type: "image", name: "abuja-hub.jpg", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" },
    { id: 6, type: "image", name: "vi-mall.jpg", url: "https://images.unsplash.com/photo-1519567281799-9637b92f44eb?q=80&w=2070&auto=format&fit=crop" },
    { id: 7, type: "image", name: "office-space.jpg", url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop" },
    { id: 8, type: "image", name: "facade-detail.jpg", url: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop" },
  ];

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-accent-deep-blue">Media Library</h2>
          <p className="text-text-secondary mt-1">Manage all images, documents, and assets.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <UploadCloud size={16} />
          Upload Assets
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-surface-main p-4 rounded-lg border border-border-subtle">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search media..." 
            className="w-full pl-10 pr-4 py-2 bg-transparent rounded-md border border-border-subtle text-sm focus:outline-none focus:ring-1 focus:ring-accent-deep-blue"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {mediaFiles.map((file) => (
          <div key={file.id} className="media-item group relative aspect-square rounded-lg border border-border-subtle overflow-hidden bg-surface-main flex flex-col items-center justify-center cursor-pointer hover:border-accent-deep-blue transition-colors">
            {file.type === 'folder' ? (
              <>
                <Folder size={48} className="text-accent-muted-gold mb-2" />
                <span className="text-xs font-medium text-on-surface text-center px-2">{file.name}</span>
              </>
            ) : (
              <>
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button className="p-1.5 bg-white/20 hover:bg-error text-white rounded backdrop-blur transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <span className="text-[10px] text-white font-medium truncate bg-black/50 px-1.5 py-0.5 rounded backdrop-blur w-full text-center">
                    {file.name}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
