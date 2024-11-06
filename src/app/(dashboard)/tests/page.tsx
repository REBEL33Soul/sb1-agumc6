import { TestPanel } from '@/components/testing/TestPanel';

export default function TestsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">System Tests</h2>
        <p className="text-gray-400 mt-2">
          Run and monitor system tests to ensure everything is working correctly
        </p>
      </div>

      <TestPanel />
    </div>
  );
}