import { AudioEngine } from './AudioEngine';
import { StorageManager } from '../storage/StorageManager';
import { QueueManager } from '../queue/manager';
import { ErrorManager } from './ErrorManager';
import { db } from '../db';

export class ProjectManager {
  private static instance: ProjectManager;
  private audioEngine: AudioEngine;
  private storageManager: StorageManager;
  private queueManager: QueueManager;
  private errorManager: ErrorManager;

  private constructor() {
    this.audioEngine = AudioEngine.getInstance();
    this.storageManager = StorageManager.getInstance();
    this.queueManager = QueueManager.getInstance();
    this.errorManager = ErrorManager.getInstance();
  }

  static getInstance(): ProjectManager {
    if (!ProjectManager.instance) {
      ProjectManager.instance = new ProjectManager();
    }
    return ProjectManager.instance;
  }

  async createProject(
    userId: string,
    file: File,
    options: ProjectOptions
  ): Promise<string> {
    try {
      // Create project record
      const project = await db.project.create({
        data: {
          userId,
          name: options.name,
          status: 'pending',
          settings: options,
        },
      });

      // Upload file
      const fileKey = await this.storageManager.uploadFile(file, {
        projectId: project.id,
        userId,
      });

      // Add to processing queue
      await this.queueManager.enqueueAudioProcessing(
        project.id,
        file,
        options.processing
      );

      return project.id;
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'project_creation',
        userId,
        options,
      });
      throw error;
    }
  }

  async getProjectStatus(projectId: string): Promise<ProjectStatus> {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        inputFile: true,
        outputFiles: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return {
      status: project.status,
      progress: await this.queueManager.getProgress(projectId),
      files: {
        input: project.inputFile,
        output: project.outputFiles,
      },
    };
  }

  async updateProjectSettings(
    projectId: string,
    settings: Partial<ProjectOptions>
  ): Promise<void> {
    await db.project.update({
      where: { id: projectId },
      data: { settings },
    });

    // Reprocess if necessary
    if (settings.processing) {
      await this.reprocessProject(projectId);
    }
  }

  private async reprocessProject(projectId: string): Promise<void> {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { inputFile: true },
    });

    if (!project?.inputFile) return;

    // Add to processing queue
    const response = await fetch(project.inputFile.url);
    const file = new File(
      [await response.blob()],
      project.inputFile.name,
      { type: project.inputFile.type }
    );

    await this.queueManager.enqueueAudioProcessing(
      projectId,
      file,
      project.settings.processing
    );
  }
}