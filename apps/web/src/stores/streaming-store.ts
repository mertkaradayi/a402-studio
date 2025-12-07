import { create } from "zustand";

// Streaming session states
export type StreamingState = "idle" | "configuring" | "starting" | "active" | "paused" | "stopping" | "stopped" | "error";

// Asset chunk for streaming
export interface StreamingAsset {
  assetId: string;
  name: string;
  quantity: number;
  unitPrice: string;
  description?: string;
}

// Charge event during streaming
export interface StreamingCharge {
  id: string;
  referenceKey: string;
  amount: string;
  asset: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
}

// Session log entry
export interface StreamingLogEntry {
  type: "info" | "charge" | "warning" | "error" | "success";
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

// Complete streaming session
export interface StreamingSession {
  id: string;
  invoiceId: string | null;
  payingMerchantId: string;
  assets: StreamingAsset[];
  state: StreamingState;
  startedAt: number | null;
  pausedAt: number | null;
  stoppedAt: number | null;
  totalDuration: number; // in seconds
  pausedDuration: number; // total paused time
  charges: StreamingCharge[];
  referenceKeys: string[];
  totalAccumulated: string;
  logs: StreamingLogEntry[];
  error: string | null;
}

// Session history entry
export interface StreamingHistoryEntry {
  id: string;
  session: StreamingSession;
  completedAt: number;
}

interface StreamingStore {
  // Current session
  currentSession: StreamingSession | null;

  // Session history
  sessionHistory: StreamingHistoryEntry[];

  // UI state
  isSimulationMode: boolean;

  // Actions - Session Management
  createSession: (payingMerchantId: string, assets: StreamingAsset[]) => void;
  setInvoiceId: (invoiceId: string) => void;
  setSessionState: (state: StreamingState) => void;
  setError: (error: string | null) => void;

  // Actions - Streaming Control
  startStreaming: () => void;
  pauseStreaming: () => void;
  resumeStreaming: () => void;
  stopStreaming: (referenceKeys?: string[]) => void;

  // Actions - Charges
  addCharge: (charge: Omit<StreamingCharge, "id" | "timestamp">) => void;
  updateChargeStatus: (chargeId: string, status: StreamingCharge["status"]) => void;
  updateTotalAccumulated: (total: string) => void;

  // Actions - Logging
  addLog: (type: StreamingLogEntry["type"], message: string, data?: Record<string, unknown>) => void;
  clearLogs: () => void;

  // Actions - Reference Keys
  addReferenceKey: (key: string) => void;

  // Actions - History
  saveToHistory: () => void;
  clearHistory: () => void;

  // Actions - Mode
  setSimulationMode: (mode: boolean) => void;

  // Actions - Reset
  resetSession: () => void;
}

const createEmptySession = (): StreamingSession => ({
  id: `stream_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  invoiceId: null,
  payingMerchantId: "",
  assets: [],
  state: "idle",
  startedAt: null,
  pausedAt: null,
  stoppedAt: null,
  totalDuration: 0,
  pausedDuration: 0,
  charges: [],
  referenceKeys: [],
  totalAccumulated: "0.00",
  logs: [],
  error: null,
});

export const useStreamingStore = create<StreamingStore>((set, get) => ({
  currentSession: null,
  sessionHistory: [],
  isSimulationMode: true,

  createSession: (payingMerchantId, assets) => {
    const session = createEmptySession();
    session.payingMerchantId = payingMerchantId;
    session.assets = assets;
    session.state = "configuring";
    set({ currentSession: session });
  },

  setInvoiceId: (invoiceId) => {
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, invoiceId }
        : null,
    }));
  },

  setSessionState: (sessionState) => {
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, state: sessionState }
        : null,
    }));
  },

  setError: (error) => {
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, error, state: error ? "error" : state.currentSession.state }
        : null,
    }));
  },

  startStreaming: () => {
    const now = Date.now();
    set((state) => {
      if (!state.currentSession) return state;

      const session = state.currentSession;
      const waspaused = session.state === "paused";

      return {
        currentSession: {
          ...session,
          state: "active",
          startedAt: waspaused ? session.startedAt : now,
          pausedAt: null,
          pausedDuration: waspaused && session.pausedAt
            ? session.pausedDuration + (now - session.pausedAt)
            : session.pausedDuration,
        },
      };
    });
  },

  pauseStreaming: () => {
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            state: "paused",
            pausedAt: Date.now(),
          }
        : null,
    }));
  },

  resumeStreaming: () => {
    get().startStreaming();
  },

  stopStreaming: (referenceKeys) => {
    const now = Date.now();
    set((state) => {
      if (!state.currentSession) return state;

      const session = state.currentSession;
      const duration = session.startedAt
        ? Math.floor((now - session.startedAt - session.pausedDuration) / 1000)
        : 0;

      return {
        currentSession: {
          ...session,
          state: "stopped",
          stoppedAt: now,
          totalDuration: duration,
          referenceKeys: referenceKeys || session.referenceKeys,
        },
      };
    });
  },

  addCharge: (charge) => {
    const newCharge: StreamingCharge = {
      ...charge,
      id: `charge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };

    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            charges: [...state.currentSession.charges, newCharge],
          }
        : null,
    }));
  },

  updateChargeStatus: (chargeId, status) => {
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            charges: state.currentSession.charges.map((c) =>
              c.id === chargeId ? { ...c, status } : c
            ),
          }
        : null,
    }));
  },

  updateTotalAccumulated: (total) => {
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, totalAccumulated: total }
        : null,
    }));
  },

  addLog: (type, message, data) => {
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            logs: [
              ...state.currentSession.logs,
              { type, message, timestamp: Date.now(), data },
            ],
          }
        : null,
    }));
  },

  clearLogs: () => {
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, logs: [] }
        : null,
    }));
  },

  addReferenceKey: (key) => {
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            referenceKeys: [...state.currentSession.referenceKeys, key],
          }
        : null,
    }));
  },

  saveToHistory: () => {
    set((state) => {
      if (!state.currentSession) return state;

      const historyEntry: StreamingHistoryEntry = {
        id: `hist_${Date.now()}`,
        session: { ...state.currentSession },
        completedAt: Date.now(),
      };

      return {
        sessionHistory: [historyEntry, ...state.sessionHistory].slice(0, 20),
      };
    });
  },

  clearHistory: () => set({ sessionHistory: [] }),

  setSimulationMode: (mode) => set({ isSimulationMode: mode }),

  resetSession: () => set({ currentSession: null }),
}));
