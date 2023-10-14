import { writable } from "svelte/store";
export const connection = writable<Connection>({
  status: "disconnected",
  call: null,
});
