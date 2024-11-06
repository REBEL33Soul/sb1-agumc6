import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { UsageMetrics } from '@/components/admin/usage-metrics';
import { ProfitMargins } from '@/components/admin/profit-margins';
import { CostBreakdown } from '@/components/admin/cost-breakdown';
import { ExportButton } from '@/components/admin/export-button';

export default async function AdminReportsPage() {
  const { userId } = auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Financial Reports</h2>
          <p className="text-gray-400 mt-2">
            Comprehensive financial and usage analytics
          </p>
        </div>
        <ExportButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart />
        <ProfitMargins />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <UsageMetrics />
        <CostBreakdown />
      </div>
    </div>
  );
}