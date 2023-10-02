import { writable } from "svelte/store";

export const Connection = () => {
  const { subscribe, update } = writable<Connection>({
    status: "disconnected",
    call: null,
  });

  return {
    subscribe,
    update(value: Partial<Connection>) {
      update((prev) => ({ ...prev, ...value }));
    },
  };
};
