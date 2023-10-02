<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import CardFooter from "$lib/components/ui/card/card-footer.svelte";
  import { Mic, MicOff, Phone, VideoIcon, VideoOffIcon } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import Settings from "./Settings.svelte";

  export let stream: MediaStream | undefined;
  let mic = true,
    video = true;

  const dispatch = createEventDispatcher();
  const handleCancel = () => {
    dispatch("disconnect");
  };

  const handleMicClick = () => {
    mic = !mic;
    if (!stream) return;
    for (const track of stream.getAudioTracks()) {
      track.enabled = !track.enabled;
    }
  };

  const handleVideoClick = () => {
    video = !video;
    if (!stream) return;
    for (const track of stream.getVideoTracks()) {
      track.enabled = !track.enabled;
    }
  };
</script>

<CardFooter class="relative flex justify-center gap-4 mt-4">
  <Button
    on:click={handleCancel}
    class="rounded-full py-7 sm:px-[18px] sm:py-8"
    variant="destructive"
  >
    <Phone class="sm:w-7 fill-white" />
  </Button>
  <Button
    on:click={handleMicClick}
    class="rounded-full py-7 sm:px-[18px] sm:py-8 {mic &&
      'border border-transparent'}"
    variant={mic ? "default" : "outline"}
  >
    {#if mic}
      <Mic class="sm:w-7" />
    {:else}
      <MicOff class="sm:w-7" />
    {/if}
  </Button>
  <Button
    variant={video ? "default" : "outline"}
    on:click={handleVideoClick}
    class="rounded-full py-7 sm:px-[18px] sm:py-8 {video &&
      'border border-transparent'}"
  >
    {#if video}
      <VideoIcon class="sm:w-7" />
    {:else}
      <VideoOffIcon class="sm:w-7" />
    {/if}
  </Button>
  <Settings />
</CardFooter>
