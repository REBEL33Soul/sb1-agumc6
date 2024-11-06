import { Card } from "@/components/ui/card";
import { 
  Music, 
  History, 
  Upload,
  BarChart3
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Welcome back</h2>
        <p className="text-gray-400 mt-2">Here's an overview of your projects</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
          <div className="flex items-center space-x-4">
            <Upload className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
          <div className="flex items-center space-x-4">
            <Music className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-white">48</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
          <div className="flex items-center space-x-4">
            <History className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Processing</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Storage Used</p>
              <p className="text-2xl font-bold text-white">64%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}