import { getStats } from '@/app/admin/actions';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { FolderOpen, Globe, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      title: 'Groups',
      value: stats.totalGroups,
      icon: FolderOpen,
      href: '/admin/groups',
    },
    {
      title: 'Words',
      value: stats.totalWords,
      icon: BookOpen,
      href: '/admin/groups',
    },
    {
      title: 'Translations',
      value: stats.totalTranslations,
      icon: Globe,
      href: '/admin/groups',
    },
    {
      title: 'Users',
      value: stats.totalUsers,
      icon: Users,
      href: '/admin/users',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your word comparison data</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest Groups</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.latestGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No groups yet</p>
            ) : (
              <ul className="space-y-2">
                {stats.latestGroups.map((group) => (
                  <li key={group.id} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/admin/groups/${group.id}`}
                      className="hover:underline"
                    >
                      {group.name}
                    </Link>
                    <span className="text-muted-foreground text-xs">
                      {stats.groupWordCounts[group.id] || 0} words
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest Words</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.latestWords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No words yet</p>
            ) : (
              <ul className="space-y-2">
                {stats.latestWords.map((word) => (
                  <li key={word.id} className="flex items-center justify-between text-sm">
                    <span>{word.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(word.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}