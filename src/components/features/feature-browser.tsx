import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FEATURE_CATEGORIES } from '@/lib/features/categories';
import { Badge } from '@/components/ui/badge';
import { Lock, Check } from 'lucide-react';

interface FeatureBrowserProps {
  subscription: string;
}

export function FeatureBrowser({ subscription }: FeatureBrowserProps) {
  const [activeCategory, setActiveCategory] = useState(Object.keys(FEATURE_CATEGORIES)[0]);

  const hasAccess = (requirements: string[]) => {
    return requirements.some(req => req === subscription);
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {Object.entries(FEATURE_CATEGORIES).map(([id, category]) => (
            <TabsTrigger
              key={id}
              value={id}
              className="data-[state=active]:bg-blue-500"
            >
              {category.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(FEATURE_CATEGORIES).map(([id, category]) => (
          <TabsContent key={id} value={id} className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">{category.title}</h3>
                <p className="text-gray-400 mt-1">{category.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.features.map((feature) => (
                  <Card
                    key={feature.id}
                    className="p-4 bg-gray-900/50 hover:bg-gray-900/80 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">
                          {feature.name}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          {feature.description}
                        </p>
                      </div>
                      {hasAccess(feature.requirements) ? (
                        <Badge variant="success">
                          <Check className="h-4 w-4" />
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Lock className="h-4 w-4" />
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}