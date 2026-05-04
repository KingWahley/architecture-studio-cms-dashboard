"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  CloudUpload, 
  Eye, 
  Globe, 
  MapPin, 
  Plus, 
  Save, 
  Trash2, 
  X,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveContentItem } from "@/app/actions/content";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export default function ProjectEditor({ project, config }) {
  const router = useRouter();
  const [isPending, startSaving] = useTransition();
  const [draft, setDraft] = useState(project);
  const [feedback, setFeedback] = useState("");

  const handleChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setFeedback("");
    startSaving(async () => {
      const result = await saveContentItem({
        entityKey: "projects",
        id: project.id === "new" ? undefined : project.id,
        ...draft,
      });
      setFeedback(result.message);
      if (project.id === "new" && result.item?.id) {
        router.push(`/projects/${result.item.id}`);
      }
    });
  };

  const categories = ["Residential", "Commercial", "Industrial"];
  const statuses = ["Draft", "Ongoing Construction", "Completed", "Published"];

  // Mock gallery if empty for design fidelity
  const gallery = draft.gallery || [
    "https://images.unsplash.com/photo-1600585154340-be6191dae10c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600607687940-4e524cb350b1?auto=format&fit=crop&q=80&w=800",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface-alt/30">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border-subtle px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-text-secondary uppercase mb-1">
              <button onClick={() => router.push("/projects")} className="hover:text-accent-deep-blue transition-colors">PROJECTS</button>
              <ChevronRight size={10} className="text-border-subtle" />
              <span className="text-accent-deep-blue">EDIT PROJECT</span>
            </nav>
            <h1 className="text-2xl font-display font-semibold text-accent-deep-blue leading-tight">
              {draft.title || "Untitled Project"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending} className="bg-accent-deep-blue hover:bg-accent-deep-blue/90 min-w-[140px]">
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            {/* Project Information */}
            <Card className="border-none shadow-architectural-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-border-subtle/50 pb-4">
                <CardTitle className="text-lg font-display">Project Information</CardTitle>
                <CardDescription>Core details that define the project scope and identity.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Project Title</label>
                  <Input 
                    value={draft.title} 
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter project name..."
                    className="h-12 text-lg font-medium border-border-subtle focus:border-accent-deep-blue bg-surface-alt/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Description</label>
                  <Textarea 
                    value={draft.summary} 
                    onChange={(e) => handleChange("summary", e.target.value)}
                    placeholder="Describe the architectural concept, materials, and design philosophy..."
                    className="min-h-[160px] resize-none border-border-subtle focus:border-accent-deep-blue bg-surface-alt/10 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Location</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <Input 
                        value={draft.location} 
                        onChange={(e) => handleChange("location", e.target.value)}
                        placeholder="Lagos, Nigeria"
                        className="h-11 pl-10 border-border-subtle focus:border-accent-deep-blue bg-surface-alt/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Year</label>
                    <Input 
                      value={draft.year} 
                      onChange={(e) => handleChange("year", e.target.value)}
                      placeholder="2024"
                      className="h-11 border-border-subtle focus:border-accent-deep-blue bg-surface-alt/10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Gallery */}
            <Card className="border-none shadow-architectural-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-border-subtle/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-display">Project Gallery</CardTitle>
                    <CardDescription>Visual assets that showcase the project aesthetics.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Plus size={14} /> Add from Library
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {gallery.map((img, idx) => (
                    <motion.div 
                      key={idx} 
                      className="group relative aspect-square rounded-xl overflow-hidden bg-surface-alt"
                      whileHover={{ scale: 0.98 }}
                    >
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-md text-white transition-all">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 bg-white/20 hover:bg-error/80 rounded-full backdrop-blur-md text-white transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="aspect-square border-2 border-dashed border-border-subtle rounded-xl bg-surface-alt/30 hover:bg-surface-alt/50 hover:border-accent-deep-blue/40 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-text-secondary group-hover:text-accent-deep-blue transition-colors mb-3">
                      <CloudUpload size={20} />
                    </div>
                    <p className="text-xs font-bold text-on-surface mb-1">Upload More</p>
                    <p className="text-[10px] text-text-secondary">Drop files here or click to browse</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-8">
            {/* Classification */}
            <Card className="border-none shadow-architectural-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-border-subtle/50 pb-4">
                <CardTitle className="text-lg font-display">Classification</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Project Category</label>
                  <div className="flex flex-col gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleChange("category", cat)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                          draft.category === cat 
                            ? "border-accent-deep-blue bg-accent-deep-blue/5 text-accent-deep-blue shadow-sm" 
                            : "border-border-subtle hover:border-accent-deep-blue/30 text-on-surface"
                        )}
                      >
                        {cat}
                        {draft.category === cat && <CheckCircle2 size={16} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Project Status</label>
                  <select 
                    value={draft.status} 
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-surface-alt/10 text-sm focus:border-accent-deep-blue focus:ring-0 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Map Reference */}
            <Card className="border-none shadow-architectural-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-border-subtle/50 pb-4">
                <CardTitle className="text-lg font-display">Map Reference</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="aspect-video w-full rounded-xl bg-surface-alt overflow-hidden relative">
                  <img src={`https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-122.4241,37.78,14,0/600x400?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""}`} alt="Map" className="w-full h-full object-cover grayscale opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-accent-deep-blue/20 flex items-center justify-center animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-accent-deep-blue" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Coordinates</label>
                  <Input 
                    value={draft.coordinates} 
                    onChange={(e) => handleChange("coordinates", e.target.value)}
                    placeholder="6.4281° N, 3.4215° E"
                    className="h-10 text-xs border-border-subtle focus:border-accent-deep-blue bg-surface-alt/10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Public Visibility */}
            <Card className="border-none shadow-architectural-sm bg-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      draft.publicVisibility ? "bg-accent-deep-blue/10 text-accent-deep-blue" : "bg-surface-alt text-text-secondary"
                    )}>
                      <Globe size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Public Visibility</p>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Publish to website</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleChange("publicVisibility", !draft.publicVisibility)}
                    className={cn(
                      "w-11 h-6 rounded-full relative transition-colors duration-200 outline-none",
                      draft.publicVisibility ? "bg-accent-deep-blue" : "bg-border-subtle"
                    )}
                  >
                    <motion.div 
                      className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                      animate={{ x: draft.publicVisibility ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="sticky bottom-0 z-30 bg-white border-t border-border-subtle px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
            <Clock size={14} className="text-status-active" />
            <span>Draft auto-saved at 12:45 PM</span>
            {feedback && (
              <span className="ml-4 px-2 py-0.5 rounded bg-status-active/10 text-status-active font-bold uppercase tracking-tighter text-[9px]">
                {feedback}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="gap-2 flex-1 sm:flex-none h-11 border-border-subtle text-accent-deep-blue font-bold text-xs uppercase tracking-widest hover:bg-accent-deep-blue hover:text-white transition-all">
              <Eye size={14} /> Preview Project
            </Button>
            <Button className="gap-2 flex-1 sm:flex-none h-11 bg-accent-deep-blue hover:bg-accent-deep-blue/90 font-bold text-xs uppercase tracking-widest px-8">
              Publish Project
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
