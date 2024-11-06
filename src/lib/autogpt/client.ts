import { config } from '../config/environment';

interface AutoGPTTask {
  objective: string;
  constraints?: string[];
  tools?: string[];
}

export class AutoGPTClient {
  private static instance: AutoGPTClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.AUTOGPT_API_URL || 'http://localhost:8000';
  }

  static getInstance(): AutoGPTClient {
    if (!AutoGPTClient.instance) {
      AutoGPTClient.instance = new AutoGPTClient();
    }
    return AutoGPTClient.instance;
  }

  async createTask(task: AutoGPTTask): Promise<string> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error('Failed to create AutoGPT task');
    }

    const data = await response.json();
    return data.taskId;
  }

  async getTaskStatus(taskId: string): Promise<{
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
  }> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`);
    if (!response.ok) {
      throw new Error('Failed to get task status');
    }
    return response.json();
  }

  // Audio processing specific tasks
  async analyzeAudioStructure(audioUrl: string): Promise<any> {
    return this.createTask({
      objective: 'Analyze audio structure and composition',
      constraints: ['Focus on musical elements', 'Identify patterns'],
      tools: ['audio_analyzer', 'pattern_detector'],
    });
  }

  async suggestRestorationStrategy(analysisResult: any): Promise<any> {
    return this.createTask({
      objective: 'Suggest optimal restoration strategy',
      constraints: ['Consider audio quality', 'Preserve authenticity'],
      tools: ['restoration_planner', 'quality_assessor'],
    });
  }

  async optimizeProcessingParameters(
    audioCharacteristics: any,
    targetQuality: any
  ): Promise<any> {
    return this.createTask({
      objective: 'Optimize audio processing parameters',
      constraints: ['Maintain audio fidelity', 'Minimize artifacts'],
      tools: ['parameter_optimizer', 'quality_monitor'],
    });
  }
}