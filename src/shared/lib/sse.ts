// Simple SSE client singleton that auto-connects once a listener is attached.
// Exposes a single on(listener) API and emits parsed JSON events.

type PracticeStartedEvent = {
  event: "practice-started";
  practiceId: number;
  payload?: Record<string, unknown>;
};

type PracticeFinishedEvent = {
  event: "practice-finished";
  practiceId: number;
  payload?: Record<string, unknown>;
};

export type SSEEvent = PracticeStartedEvent | PracticeFinishedEvent;

type Listener = (e: SSEEvent) => void;

class SSEClient {
  private static instance: SSEClient | null = null;
  private source: EventSource | null = null;
  private listeners = new Set<Listener>();
  private connected = false;

  static get(): SSEClient {
    if (!SSEClient.instance) {
      SSEClient.instance = new SSEClient();
    }
    return SSEClient.instance;
  }

  private connect(): void {
    if (this.connected || this.source) return;
    const api = import.meta.env.VITE_API_URL;
    const origin = (() => {
      try {
        return api ? new URL(api).origin : window.location.origin;
      } catch {
        return window.location.origin;
      }
    })();
    const url = `${origin}/sse`;
    const src = new EventSource(url, { withCredentials: false });
    this.source = src;

    const dispatch = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data) as SSEEvent;
        this.emit(data);
      } catch {
        // ignore malformed frames
      }
    };

    src.addEventListener("message", dispatch);
    src.addEventListener("practice-started", dispatch);
    src.addEventListener("practice-finished", dispatch);

    src.onopen = () => {
      this.connected = true;
    };
    src.onerror = () => {
      this.connected = false;
    };
  }

  on(listener: Listener): () => void {
    this.listeners.add(listener);
    this.connect();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(e: SSEEvent): void {
    for (const l of this.listeners) l(e);
  }
}

export const sseClient = SSEClient.get();


