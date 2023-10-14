<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import Peer from "peerjs";
  import { onMount } from "svelte";
  import toast from "svelte-french-toast";
  import Connecting from "./Connecting.svelte";
  import Footer from "./Footer.svelte";
  import Incomming from "./Incomming.svelte";
  import { connection } from "./connection";
  import { page } from "$app/stores";

  export let currentUser: any;
  export let pushNotificationPublicKey: string;
  let self: HTMLVideoElement, remote: HTMLVideoElement;

  let mediaObject = {
    video: true,
    audio: true,
  };

  let connectionTimeOutId: NodeJS.Timeout | null;
  $: {
    if ($connection.status === "connecting") {
      connectionTimeOutId = setTimeout(handleOnClose, 20000);
    } else if ($connection.status === "incomming") {
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

  const peer = new Peer(currentUser.id ?? "", {
    secure: true,
  });

  const addVideoStream = (video: HTMLVideoElement, stream: MediaStream) => {
    if (!video) return;
    video.srcObject = stream;
  };

  const handleOnClose = () => {
    closeVideo($connection.call?.localStream!);
    $connection.call?.close();
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

  const handleCall = async (id: string, name?: string) => {
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
        status: name === undefined ? "connected" : "connecting",
        call,
      };

      handleStream(stream);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        toast.error("Allow permission to access audio and video");
      } else {
        console.log({ err });
      }
    }
  };

  const handleAnswerCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(mediaObject);
      handleStream(stream);
      $connection?.call?.answer?.(stream);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        toast.error("Allow permission to access audio and video");
      } else {
        console.log({ err });
      }
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

  let retryAttempts = 0;
  const sendNotification = async (id: string) => {
    try {
      console.log({ id });
      const response = await fetch("/sendNotification", {
        method: "POST",
        body: JSON.stringify({
          id,
          payload: {
            id,
            peerId: currentUser.id,
            type: "call",
            time: Date.now(),
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      // toast.success("Notification Sent Successfully");
    } catch (error: any) {
      console.error(error);
      handleOnClose();
      toast.error(error.message);
    } finally {
      retryAttempts = 0;
    }
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

  const requestNotificationPermission = async () => {
    try {
      const data = await Notification.requestPermission();
      if (data !== "granted") {
        throw new Error("Please allow notification permission to recieve call");
      }
      const registration = await navigator.serviceWorker.ready;

      // const existingSubscription =
      //   await registration.pushManager.getSubscription();

      // if (existingSubscription) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: pushNotificationPublicKey,
      });

      const response = await fetch("/push", {
        method: "POST",
        body: JSON.stringify({ subscription }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Push Subcription fails");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  onMount(() => {
    const channel = new BroadcastChannel("sw-messages");
    channel.addEventListener("message", (event) => {
      if (event.data.type === "decline") {
        handleOnClose();
      }
    });
    peer.on("error", (error) => {
      if (error.type === "unavailable-id" || error.type === "disconnected") {
        toast.error("Already loggedIn on another place. Logout from there");
      } else if (error.type === "peer-unavailable") {
        if (!$connection.call) return;
        retryAttempts++;
        if (retryAttempts > 15) {
          sendNotification($connection.call?.peer!);
          closeVideo($connection.call?.localStream!);
          $connection.call.close();
        }
        console.error(error.message);
      } else {
        console.log({ error });
        toast.error("Sorry we have an issue. Call Suraj");
      }
    });

    const query = $page.url.searchParams.get("answer");

    peer.on("call", async (call) => {
      // console.log("document.visibilityState", document.visibilityState);
      // console.log("Notification.permission", Notification.permission);
      if ($connection.status === "connecting") {
        $connection = {
          status: "connected",
          call,
        };
        await handleAnswerCall();
        return;
      }
      try {
        if (
          document.visibilityState === "hidden" &&
          Notification.permission === "granted"
        ) {
          // console.log("Sending Notification");
          // const notification = new Notification(`${call.metadata.peerName}`, {
          //   vibrate: [200, 100, 200, 100, 200, 100, 200],
          //   requireInteraction: true,
          // });
          // document.addEventListener("visibilitychange", () => {
          //   if (document.visibilityState === "visible" && notification) {
          //     console.log("closing notification");
          //     notification.close();
          //   }
          // });
        }
      } catch (error) {
        console.error(error);
      } finally {
        $connection = {
          status: "incomming",
          call,
        };
      }
    });

    peer.on("connection", (connection) => {
      if (
        connection.label === "Decline" ||
        connection.label === "Not Recieved"
      ) {
        toast.error(
          `${
            $connection.call?.metadata.peerName
          } have ${connection.label.toLowerCase()} the call`
        );
        handleOnClose();
        connection.close();
      }
    });

    requestNotificationPermission();
    if (query !== null) {
      handleCall(query);
    }
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
      <slot {handleAnswerCall} {handleCall} {sendNotification} />
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
            autoplay
          >
            <track kind="captions" />
          </video>
        </div>

        <div class="absolute bottom-0 right-0 z-10 w-36 sm:w-40">
          <video bind:this={self} autoplay class="border h-full rounded" muted>
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
        peerName={$connection.call?.metadata.peerName}
        on:answer={handleAnswerCall}
        on:decline={() => handleDecline()}
      />
    {:else if $connection.status === "connecting"}
      <Connecting
        peerName={$connection.call?.metadata.peerName}
        on:decline={() => handleDecline()}
      />
    {:else}
      <Card.Content class="grid place-items-center h-[78vh]">
        <p class="text-4xl font-semibold text-white/30">Call someone</p>
      </Card.Content>
    {/if}
  </Card.Root>
</div>
