import { currentUser } from '@clerk/nextjs/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FolderOpen, Mail, FileText, Search } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  {
    title: 'Files',
    description: 'Upload and manage files',
    href: '/dashboard/files',
    icon: FolderOpen,
  },
  {
    title: 'Email',
    description: 'Compose and send emails',
    href: '/dashboard/email',
    icon: Mail,
  },
  {
    title: 'Notes',
    description: 'Create and organize notes',
    href: '/dashboard/notes',
    icon: FileText,
  },
  {
    title: 'AI Search',
    description: 'Search your knowledge base',
    href: '/dashboard/search',
    icon: Search,
  },
];

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-stone-600 mt-1">
          Here&apos;s an overview of your workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
          >
            <Card className="hover:bg-stone-50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 bg-stone-100 rounded-lg">
                  <action.icon className="h-5 w-5 text-stone-600" />
                </div>
                <CardTitle className="text-lg">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
