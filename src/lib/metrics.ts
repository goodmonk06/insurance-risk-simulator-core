/**
 * Metrics collection abstraction
 */

interface MetricLabels {
  [key: string]: string | number;
}

class Metrics {
  recordCounter(name: string, value: number = 1, labels?: MetricLabels): void {
    // For now, just log. Can be extended to push to Prometheus, DataDog, etc.
    if (process.env.NODE_ENV === 'development') {
      console.log(`[METRIC] Counter: ${name} = ${value}`, labels || '');
    }
  }

  recordGauge(name: string, value: number, labels?: MetricLabels): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[METRIC] Gauge: ${name} = ${value}`, labels || '');
    }
  }

  recordHistogram(name: string, value: number, labels?: MetricLabels): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[METRIC] Histogram: ${name} = ${value}ms`, labels || '');
    }
  }

  async measureTime<T>(name: string, fn: () => Promise<T>, labels?: MetricLabels): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.recordHistogram(name, duration, labels);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordHistogram(name, duration, { ...labels, error: 'true' });
      throw error;
    }
  }
}

export const metrics = new Metrics();
