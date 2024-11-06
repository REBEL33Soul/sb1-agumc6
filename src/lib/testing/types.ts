interface TestResults {
  audio: ComponentTestResult;
  models: ComponentTestResult;
  browser: ComponentTestResult;
  recovery: ComponentTestResult;
  immersive: ComponentTestResult;
  ai: ComponentTestResult;
}

interface ComponentTestResult {
  component: string;
  passed: number;
  failed: number;
  tests: Array<{
    name: string;
    passed: boolean;
    duration: number;
    error?: string;
  }>;
}

export type { TestResults, ComponentTestResult };