import { getApiOrigin } from "./api-config";

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

    const origin = getApiOrigin();
    const url = `${origin}/sse`;

    const src = new EventSource(url, { withCredentials: false });
    this.source = src;

    const dispatch = (ev: MessageEvent) => {
      try {
        const raw = JSON.parse(ev.data);
        const envelope =
          raw && typeof raw.event === "string"
            ? raw
            : raw?.event && typeof raw.event.event === "string"
            ? raw.event
            : null;

        if (envelope && typeof envelope.event === "string") {
          this.emit(envelope as SSEEvent);
        }
      } catch {}
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
    for (const l of this.listeners) {
      try {
        l(e);
      } catch {}
    }
  }

  disconnect(): void {
    if (this.source) {
      this.source.close();
      this.source = null;
      this.connected = false;
    }
  }
}

export const sseClient = SSEClient.get();
