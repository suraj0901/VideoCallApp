import { writable } from "svelte/store";

export const connection = writable<Connection>({
  status: "disconnected",
  call: null,
});

export const mediaObject = writable<{
  video: {
    aspectRatio: number;
    deviceId?: string;
  };
  audio:
    | {
        deviceId?: string;
      }
    | boolean;
}>({
  video: {
    aspectRatio: 9 / 16,
  },
  audio: true,
});
