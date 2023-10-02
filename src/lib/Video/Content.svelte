<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import Peer from "peerjs";
  import { onMount } from "svelte";
  import toast from "svelte-french-toast";
  import Connecting from "./Connecting.svelte";
  import Footer from "./Footer.svelte";
  import Incomming from "./Incomming.svelte";
  import { connection } from "./connection";

  export let currentUser;
  let self: HTMLVideoElement, remote: HTMLVideoElement;

  let mediaObject = {
    video: {
      aspectRatio: 9 / 16,
    },
    audio: true,
  };

  let connectionTimeOutId: NodeJS.Timeout | null;
  $: {
    if ($connection.status === "incomming") {
      navigator.vibrate([200, 300, 500]);
      connectionTimeOutId = setTimeout(
        () => handleDecline("Not Recieved"),
        20000
      );
    } else {
      navigator.vibrate([]);
      if (connectionTimeOutId) {
        clearTimeout(connectionTimeOutId);
        connectionTimeOutId = null;
      }
    }
  }

  const peer = new Peer(currentUser.id ?? "");

  const addVideoStream = (video: HTMLVideoElement, stream: MediaStream) => {
    if (!video) return;
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
  };

  const handleOnClose = () => {
    closeVideo($connection.call?.localStream!);
    $connection = {
      status: "disconnected",
      call: null,
    };
  };

  const handleStream = (stream: MediaStream) => {
    const call = $connection.call!;

    const handleStream = (remoteStream: MediaStream) => {
      addVideoStream(self, stream);
      addVideoStream(remote, remoteStream);
      $connection = {
        status: "connected",
        call,
      };
    };

    const handleClose = () => {
      closeVideo(stream);
      $connection = {
        status: "disconnected",
        call: null,
      };
    };

    call.on("stream", handleStream);
    call.on("close", handleClose);
    call.on("error", handleClose);
  };

  const closeVideo = (stream: MediaStream) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  };

  const handleCall = async (id: string, name: string) => {
    if ($connection.status !== "disconnected") {
      toast.error("Already on another call");
      return;
    }
    if (!id) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia(mediaObject);
      const call = peer.call(id, stream, {
        metadata: { peerName: name },
      });
      $connection = {
        status: "connecting",
        call,
      };
      handleStream(stream);
    } catch (err) {
      console.log({ err });
    }
  };

  const handleAnswerCall = async () => {
    if (!$connection.call || $connection.status !== "incomming") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia(mediaObject);
      handleStream(stream);
      $connection?.call?.answer?.(stream);
    } catch (err) {
      console.log({ err });
      toast.error("Please provide video and audio access");
    }
  };

  const handleDecline = (label = "Decline") => {
    if (!$connection.call) return;
    const decline_connection = peer.connect($connection.call.peer, {
      label,
    });
    decline_connection.on("open", () => {
      decline_connection.close();
    });
    handleOnClose();
  };

  const handleEndCall = () => {
    if ($connection.status === "disconnected") return;
    console.log("handleEndCall");
    $connection.call?.close();
  };

  const handleDeviceChange = (e: any) => {
    if (e.detail.type) {
      mediaObject.audio = {
        deviceId: e.id,
      };
    }

    if (e.detail.type) {
      mediaObject.video = {
        aspectRatio: 9 / 16,
        deviceId: e.id,
      };
    }
  };

  onMount(() => {
    peer.on("error", (error) => {
      if (error.type === "peer-unavailable") {
        if (!$connection.call?.metadata?.peerName) return;
        toast.error(`${$connection.call?.metadata?.peerName} is not online`);
        handleOnClose();
        $connection.call?.close();
        console.error(error.message);
      } else {
        console.log({ error });
        toast.error("Sorry we have an issue. Call Suraj");
      }
    });

    peer.on("call", async (call) => {
      $connection = {
        status: "incomming",
        call,
      };
    });

    peer.on("connection", (connection) => {
      if (
        connection.label === "Decline" ||
        connection.label === "Not Recieved"
      ) {
        toast.error(
          `${
            $connection.call?.metadata?.peerName
          } have ${connection.label.toLowerCase()} the call`
        );
        handleOnClose();
        $connection.call?.close();
        connection.close();
      }
    });

    return () => {
      $connection.call?.close();
      peer.destroy();
    };
  });
</script>

<div class="grid sm:grid-cols-4 gap-1 h-screen sm:py-14">
  <Card.Root class="sm:col-span-1 bg-gray-900/30 rounded-lg p-2">
    <Card.Header>
      <slot name="header" />
    </Card.Header>
    <Card.Content>
      <slot {handleAnswerCall} {handleCall} />
    </Card.Content>
  </Card.Root>
  <Card.Root
    class="{$connection.status === 'disconnected'
      ? 'opacity-0 -z-10'
      : 'opacity-100 z-10'} sm:opacity-100 sm:z-0 sm:col-span-3 h-full sm:relative absolute inset-0"
  >
    <!-- <Card.Header>
        <Card.Title>Card Title</Card.Title>
        <Card.Description>Card Description</Card.Description>
      </Card.Header> -->
    {#if $connection.status === "connected"}
      <Card.Content class="relative m-1 min-h-[85vh] sm:min-h-[78vh]">
        <div class="absolute inset-0">
          <video
            bind:this={remote}
            class="border w-full sm:w-auto h-full rounded mx-auto"
          >
            <track kind="captions" />
          </video>
        </div>

        <div class="absolute bottom-0 right-0 z-10 w-36 sm:w-40">
          <video bind:this={self} class="border h-full rounded">
            <track kind="captions" />
          </video>
        </div>
      </Card.Content>
      <Footer
        on:devicechange={handleDeviceChange}
        on:disconnect={handleEndCall}
        stream={$connection.call?.localStream}
      />
    {:else if $connection.status === "incomming"}
      <Incomming
        peerName={$connection.call?.metadata?.peerName}
        on:answer={handleAnswerCall}
        on:decline={() => handleDecline()}
      />
    {:else if $connection.status === "connecting"}
      <Connecting
        peerName={$connection.call?.metadata?.peerName}
        on:decline={() => handleDecline()}
      />
    {:else}
      <Card.Content class="grid place-items-center h-[78vh]">
        <p class="text-4xl font-semibold text-white/30">Call someone</p>
      </Card.Content>
    {/if}
  </Card.Root>
</div>
