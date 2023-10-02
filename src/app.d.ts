// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import { type MediaConnection } from "peerjs";
import { SupabaseClient, Session } from "@supabase/supabase-js";

declare global {
  interface Connection {
    status: "disconnected" | "connected" | "incomming" | "connecting";
    call: MediaConnection | null;
  }
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient;
      getSession(): Promise<Session | null>;
    }
    interface PageData {
      session: Session | null;
    }
    // interface Platform {}
  }
}

export {};
