export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{
    task: string;
    data: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private availableWorkers: Worker[] = [];

  constructor(private size: number) {}

  async initialize(workerScript: string): Promise<void> {
    for (let i = 0; i < this.size; i++) {
      const worker = new Worker(workerScript, { type: 'module' });
      worker.onmessage = (e) => this.handleWorkerMessage(worker, e);
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  async processTask(task: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.availableWorkers.pop();
      
      if (worker) {
        worker.postMessage({ task, data });
        worker.onmessage = (e) => {
          this.availableWorkers.push(worker);
          resolve(e.data);
          this.processNextTask();
        };
        worker.onerror = (error) => {
          this.availableWorkers.push(worker);
          reject(error);
          this.processNextTask();
        };
      } else {
        this.queue.push({ task, data, resolve, reject });
      }
    });
  }

  private processNextTask() {
    if (this.queue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.queue.shift()!;
      this.processTask(task.task, task.data)
        .then(task.resolve)
        .catch(task.reject);
    }
  }

  private handleWorkerMessage(worker: Worker, event: MessageEvent) {
    this.availableWorkers.push(worker);
    this.processNextTask();
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];
    this.queue = [];
  }
}