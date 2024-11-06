export const MONITORING_CONFIG = {
  metrics: {
    collection_interval: 60000, // 1 minute
    retention_days: 30,
    batch_size: 100,
  },
  alerts: {
    thresholds: {
      cpu_usage: 80, // 80%
      memory_usage: 85, // 85%
      error_rate: 5, // 5%
      queue_size: 1000,
      processing_latency: 30000, // 30 seconds
    },
    notification_channels: ['email', 'slack'],
  },
  scaling: {
    min_instances: 1,
    max_instances: 10,
    scale_up_threshold: 80, // 80% CPU/Memory
    scale_down_threshold: 20, // 20% CPU/Memory
  }
};