<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Select from "$lib/components/ui/select";
  import Label from "$lib/components/ui/label/label.svelte";
  import { Settings } from "lucide-svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import toast from "svelte-french-toast";
  import { connection } from "./connection";

  let audioDevices: MediaDeviceInfo[] = [],
    videoDevices: MediaDeviceInfo[] = [];

  const listDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    if (devices) {
      const video: MediaDeviceInfo[] = [];
      const audio: MediaDeviceInfo[] = [];
      for (const device of devices) {
        switch (device.kind) {
          case "videoinput":
            video.push(device);
            break;
          case "audioinput":
            audio.push(device);
            break;
        }
      }
      return { video, audio };
    } else {
      throw new Error("Media Devices API is not supported.");
    }
  };

  let selectedAudio: { value: string | undefined; label: string | undefined },
    selectedVideo: { value: string | undefined; label: string | undefined };

  $: {
    if ($connection.call?.localStream) {
      let audioID = $connection.call?.localStream
        .getAudioTracks()[0]
        .getSettings().deviceId;
      let videoID = $connection.call?.localStream
        .getVideoTracks()[0]
        .getSettings().deviceId;

      selectedAudio = {
        value: audioID,
        label: audioDevices.find((item) => item.deviceId === audioID)?.label,
      };
      selectedVideo = {
        value: videoID,
        label: videoDevices.find((item) => item.deviceId === videoID)?.label,
      };
    }
  }

  const dispatch = createEventDispatcher();
  const handleSelectChange = (type: string) => (e: any) => {
    const { value } = e;
    dispatch("devicechange", {
      id: value,
      type,
    });
  };

  onMount(async () => {
    try {
      const devices = await listDevices();
      audioDevices = devices.audio;
      videoDevices = devices.video;
    } catch (error: any) {
      toast.error(error.message);
    }
  });
</script>

<Dialog.Root>
  <Dialog.Trigger class="sm:absolute sm:right-8">
    <Button variant="secondary" class="rounded-full py-7 sm:px-[18px] sm:py-8">
      <Settings class="sm:w-7" />
    </Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Media Settings</Dialog.Title>
    </Dialog.Header>
    <form method="dialog" class="grid gap-3">
      <section class="grid gap-1.5">
        <Label for="mic">Mic</Label>
        <Select.Root
          name="mic"
          selected={selectedAudio}
          onSelectedChange={handleSelectChange("audio")}
        >
          <Select.Trigger class="w-full">
            <Select.Value placeholder="Select Mic" />
          </Select.Trigger>
          <Select.Content>
            {#each audioDevices as audio}
              <Select.Item value={audio.deviceId}>{audio.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </section>
      <section class="grid gap-1.5">
        <Label for="mic">Video</Label>
        <Select.Root
          name="mic"
          selected={selectedVideo}
          onSelectedChange={handleSelectChange("video")}
        >
          <Select.Trigger class="w-full">
            <Select.Value placeholder="Select Mic" />
          </Select.Trigger>
          <Select.Content>
            {#each videoDevices as video}
              <Select.Item value={video.deviceId}>{video.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </section>
    </form>
  </Dialog.Content>
</Dialog.Root>
