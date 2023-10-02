<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from "$lib/components/ui/card";
  import { PhoneIncoming, PhoneOff } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  export let peerName: string;

  const dispatch = createEventDispatcher();
  const handleAnswerCall = () => {
    dispatch("answer");
  };
  const handleDeclineCall = () => {
    dispatch("decline");
  };
</script>

<audio src="/ring.mp3" autoplay loop />
<Card.Content class="grid place-items-center h-full sm:min-h-[78vh]">
  <div class="flex flex-col gap-2 items-center">
    <p class="text-lg tracking-wide">Incomming Call</p>
    <p class="text-3xl font-semibold mb-8">
      {peerName}
    </p>
    <div class="flex gap-8">
      <div class="animate rounded-full">
        <Button
          on:click={handleAnswerCall}
          class=" rounded-full py-7"
          variant="default"
        >
          <PhoneIncoming size={28} />
        </Button>
      </div>
      <Button
        class="rounded-full py-7"
        on:click={handleDeclineCall}
        variant="secondary"
      >
        <PhoneOff size={28} />
      </Button>
    </div>
  </div>
</Card.Content>

<style>
  .animate {
    animation: bounce 1s infinite;
  }
  @keyframes bounce {
    0%,
    100% {
      transform: translateY(-15%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.5);
    }
    15% {
      box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.5),
        0 0 0 16px rgba(255, 255, 255, 0.3);
    }
    30% {
      box-shadow: 0 0 0 12px rgba(255, 255, 255, 0.5),
        0 0 0 38px rgba(255, 255, 255, 0.3);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }
</style>
