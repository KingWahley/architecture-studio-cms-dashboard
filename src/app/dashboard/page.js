import Link from "next/link";
import { ArrowRight, Briefcase, Building2, Calendar, FileText, MessageSquare, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getDashboardData } from "@/lib/content-store";
import { cn } from "@/lib/utils";

const ICONS = [Building2, Briefcase, FileText, MessageSquare, Calendar];

export default async function DashboardPage() {
  const { stats, quickActions, recentMessages } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = ICONS[index] ?? Building2;

          return (
            <Card key={stat.title} className="border-border-subtle/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">{stat.title}</CardTitle>
                <div className="rounded-lg bg-surface-alt p-2">
                  <Icon className="h-5 w-5 text-accent-deep-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-bold text-on-surface">{stat.value}</div>
                <p className="mt-1 text-xs text-text-secondary">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Main Content Split View */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Quick Actions (Narrow) */}
        <section className="lg:col-span-4">
          <Card className="h-full border-border-subtle/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-white p-4 transition-all hover:border-accent-deep-blue hover:shadow-architectural"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface-alt transition-colors group-hover:border-accent-deep-blue/20 group-hover:bg-accent-deep-blue/5">
                    <Plus size={18} className="text-text-secondary group-hover:text-accent-deep-blue" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-on-surface">{action.label}</p>
                    <p className="truncate text-xs text-text-secondary">{action.helper}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Right: Recent Messages (Wide) */}
        <section className="lg:col-span-8">
          <Card className="h-full border-border-subtle/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Messages</CardTitle>
              <Link 
                href="/messages" 
                className="text-xs font-semibold uppercase tracking-wider text-accent-deep-blue hover:underline"
              >
                View All Messages
              </Link>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-8 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-border-subtle/50">
                {recentMessages.map((msg, idx) => (
                  <div key={msg.id} className="relative pl-8">
                    {/* Timeline Dot */}
                    <div className={cn(
                      "absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-white shadow-sm transition-colors",
                      idx === 0 ? "bg-status-active" : "bg-accent-muted-gold"
                    )} />
                    
                    <div className="group flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-display text-base font-semibold text-on-surface group-hover:text-accent-deep-blue transition-colors">
                          {msg.subject || `Message from ${msg.name}`}
                        </p>
                        <span className="rounded-md bg-surface-alt px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                          {msg.status}
                        </span>
                      </div>
                      
                      <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
                        {msg.message}
                      </p>
                      
                      <div className="mt-2 flex items-center gap-4 text-xs text-text-secondary/70">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-surface-alt flex items-center justify-center text-[10px] font-bold text-accent-deep-blue">
                            {msg.name.charAt(0)}
                          </div>
                          <span>{msg.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          <span>{new Date(msg.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {recentMessages.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-sm text-text-secondary">No recent messages to display.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
