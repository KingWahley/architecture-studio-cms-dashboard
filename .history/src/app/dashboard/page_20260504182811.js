import Link from "next/link";
import { ArrowRight, Briefcase, Building2, Calendar, FileText, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getDashboardData } from "@/lib/content-store";

const ICONS = [Building2, Briefcase, FileText, MessageSquare, Calendar];

function formatTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function DashboardPage() {
  const { stats, activity, quickActions } = await getDashboardData();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-accent-deep-blue/10 bg-[linear-gradient(135deg,rgba(27,54,93,0.08),rgba(197,160,89,0.14),rgba(255,255,255,0.95))] p-8 shadow-architectural">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 self-start rounded-full bg-accent-deep-blue px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-deep-blue/90"
          >
            Open content workspace
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, index) => {
          const Icon = ICONS[index] ?? Building2;

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">{stat.title}</CardTitle>
                <Icon className="h-5 w-5 text-accent-muted-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display font-bold text-on-surface">{stat.value}</div>
                <p className="mt-2 text-xs text-text-secondary">{stat.trend}</p>
                <Link href={stat.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-deep-blue">
                  Open section
                  <ArrowRight size={14} />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Fresh updates from the content collections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((item) => (
              <div key={`${item.entityKey}-${item.target}-${item.time}`} className="flex items-start gap-4 border-b border-border-subtle pb-4 last:border-0 last:pb-0">
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-deep-blue" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-on-surface">{item.action}</p>
                  <p className="text-xs text-text-secondary">
                    {item.target} • {item.label} • {formatTime(item.time)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump straight into the most common editor flows.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group rounded-2xl border border-border-subtle bg-surface-alt p-5 transition hover:border-accent-deep-blue hover:bg-white"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-muted-gold">{action.helper}</p>
                <p className="mt-3 text-lg font-display font-semibold text-on-surface">{action.label}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-deep-blue">
                  Open editor
                  <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
