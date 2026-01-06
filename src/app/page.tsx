import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            DezApp
          </h1>
          <p className="text-xl text-stone-600 max-w-md">
            Team knowledge management for medical device professionals
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>

        <p className="text-sm text-stone-500 mt-8">
          Share files, notes, and knowledge with your team
        </p>
      </main>
    </div>
  );
}
