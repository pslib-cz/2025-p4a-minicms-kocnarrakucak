import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FaPlus, FaList, FaTags, FaRobot } from "react-icons/fa";

export default async function DashboardHome() {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // Handled by middleware
  }

  const [promptsCount, tagsCount, modelsCount] = await Promise.all([
    prisma.prompt.count({ where: { userId: session.user.id } }),
    prisma.tag.count(),
    prisma.aiModel.count(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Welcome back, {session.user.name || "Creator"}! Here is a summary of your prompts and available assets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prompts Stat */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="flex items-center space-x-4 mb-4 text-blue-500">
            <FaList size={24} />
            <h2 className="text-xl font-semibold">My Prompts</h2>
          </div>
          <p className="text-4xl font-bold mb-4">{promptsCount}</p>
          <div className="flex space-x-3">
            <Link
              href="/dashboard/prompts/new"
              className="flex items-center space-x-2 text-sm font-medium bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <FaPlus />
              <span>Create New</span>
            </Link>
            <Link
              href="/dashboard/prompts"
              className="flex items-center space-x-2 text-sm font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
            >
              <span>View All</span>
            </Link>
          </div>
        </div>

        {/* Tags Stat */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-4 mb-4 text-zinc-500">
            <FaTags size={24} />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Global Tags</h2>
          </div>
          <p className="text-4xl font-bold mb-4">{tagsCount}</p>
          <Link
            href="/dashboard/tags"
            className="text-sm font-medium text-blue-500 hover:text-blue-600 transition"
          >
            Manage Tags &rarr;
          </Link>
        </div>

        {/* AI Models Stat */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-4 mb-4 text-zinc-500">
            <FaRobot size={24} />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">AI Models</h2>
          </div>
          <p className="text-4xl font-bold mb-4">{modelsCount}</p>
          <Link
            href="/dashboard/ai-models"
            className="text-sm font-medium text-blue-500 hover:text-blue-600 transition"
          >
            Manage Models &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
