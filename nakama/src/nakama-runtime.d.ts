/**
 * Type definitions for Nakama TypeScript runtime.
 */
declare namespace nkruntime {
  interface Nakama {
    logger: Logger;
    binaryToString(data: string): string;
    registerMatch(name: string, callback: MatchInitCallback): void;
    registerRpc(id: string, callback: (ctx: Context, logger: Logger, nk: Nakama, payload: string) => string | void): void;
  }

  interface Logger {
    info(msg: string, ...args: any[]): void;
    error(msg: string, ...args: any[]): void;
    warn(msg: string, ...args: any[]): void;
    debug(msg: string, ...args: any[]): void;
  }

  interface Context {
    userId?: string;
    username?: string;
    vars?: { [key: string]: string };
    executionMode: string;
    matchId?: string;
  }

  interface MatchDispatcher {
    broadcastMessage(opCode: number, data: string, presences?: Presence[], sender?: Presence): void;
    matchLabelUpdate(label: string): void;
    matchTerminate(graceSeconds: number): void;
  }

  interface Presence {
    userId: string;
    sessionId: string;
    username: string;
    node: string;
  }

  interface MatchData {
    presence: Presence;
    opCode: number;
    data: string;
    reliable: boolean;
    receiveTimeMs: number;
  }

  interface MatchState {
    [key: string]: any;
  }

  type MatchInitCallback = (ctx: Context, logger: Logger, nk: Nakama, params: { [key: string]: any }) => { state: MatchState; tickRate: number; label: string };
}
