export type DTEventType =
  | 'stage_start' | 'stage_end' | 'thinking' | 'observation'
  | 'content' | 'tool_call' | 'tool_result' | 'progress'
  | 'sources' | 'result' | 'error' | 'session' | 'done';

export interface DTEvent {
  type: DTEventType;
  source: string;
  stage: string;
  content: string;
  metadata: Record<string, unknown>;
  session_id?: string;
  turn_id?: string;
  seq?: number;
}

export interface DTChatRequest {
  message: string;
  session_id?: string;
  kb_name?: string;
  enable_rag?: boolean;
  enable_web_search?: boolean;
}

const BASE_URL = import.meta.env.VITE_DEEPTUTOR_API_URL ?? 'http://localhost:8000';
const WS_URL   = import.meta.env.VITE_DEEPTUTOR_WS_URL  ?? 'ws://localhost:8000';

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export function connectDeepTutorChat(
  onEvent: (ev: DTEvent) => void,
  onClose?: () => void,
): {
  send: (req: DTChatRequest) => void;
  close: () => void;
} {
  const ws = new WebSocket(`${WS_URL}/api/v1/chat`);

  ws.onmessage = (e) => {
    try {
      const ev: DTEvent = JSON.parse(e.data);
      onEvent(ev);
    } catch {
      onEvent({ type: 'content', source: 'chat', stage: '', content: e.data, metadata: {} });
    }
  };

  ws.onclose = () => onClose?.();
  ws.onerror = () => onClose?.();

  const send = (req: DTChatRequest) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(req));
    }
  };

  const close = () => ws.close();

  return { send, close };
}

export function connectDeepTutorSolve(
  onEvent: (ev: DTEvent) => void,
  onClose?: () => void,
): {
  send: (question: string, kbName?: string) => void;
  close: () => void;
} {
  const ws = new WebSocket(`${WS_URL}/api/v1/solve`);

  ws.onmessage = (e) => {
    try {
      const ev: DTEvent = JSON.parse(e.data);
      onEvent(ev);
    } catch {
      onEvent({ type: 'content', source: 'solve', stage: '', content: e.data, metadata: {} });
    }
  };

  ws.onclose = () => onClose?.();
  ws.onerror = () => onClose?.();

  const send = (question: string, kbName?: string) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ question, kb_name: kbName, tools: ['rag', 'reason'] }));
    }
  };

  return { send, close: () => ws.close() };
}
