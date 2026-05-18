type LogEntry = {
  timestamp: string;
  message: string;
  componentId?: string;
  componentName?: string;
};

class RemoteLogger {
  private buffer: LogEntry[] = [];
  private flushThreshold = 10;
  private flushInterval = 5000; // 5 seconds
  private intervalId: any;

  constructor() {
    if (typeof window !== 'undefined') {
      this.intervalId = setInterval(() => this.flush(), this.flushInterval);
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  public log(message: string, componentId?: string, componentName?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      message,
      componentId,
      componentName,
    };
    this.buffer.push(entry);

    if (this.buffer.length >= this.flushThreshold) {
      this.flush();
    }
  }

  private async flush() {
    if (this.buffer.length === 0) return;

    const logsToSend = [...this.buffer];
    this.buffer = [];

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
      });

      if (!response.ok) {
        console.error('Failed to send logs to server:', await response.text());
        this.buffer = [...logsToSend, ...this.buffer]; // retry
      }
    } catch (error) {
      console.error('Error sending logs:', error);
      this.buffer = [...logsToSend, ...this.buffer]; // retry
    }
  }
}

export const logger = new RemoteLogger();
