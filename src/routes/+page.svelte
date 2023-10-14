<script lang="ts">
  import Content from "$lib/Video/Content.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import Button from "$lib/components/ui/button/button.svelte";
  import db, { Store } from "$lib/db.js";
  import { LogOut, Phone } from "lucide-svelte";
  import { onMount } from "svelte";

  export let data;

  let profileQuery = db.query(Store.profiles);
  let filter_user: IDBRequest<any[]>;

  const refresh_user_list = async () => {
    const user = await profileQuery.get(1);
    filter_user = user.user.filter((user) => user.id !== data.self.id);
  };

  onMount(async () => {
    await refresh_user_list();
  });

  $: {
    if (data.users) {
      profileQuery.put({ user: data.users, id: 1 });
    }
  }
</script>

<Content
  currentUser={data.self}
  pushNotificationPublicKey={data.subscription_public_key}
  let:handleCall
  let:sendNotification
>
  <span class="flex justify-between" slot="header">
    <p class="text-xl items-center">{data.self.user_metadata.name}</p>
    <form method="post" action="?/signout">
      <Button type="submit" size="icon">
        <LogOut size={20} />
      </Button>
    </form>
  </span>
  {#if filter_user?.length}
    <div class="grid">
      {#each filter_user as user}
        <div class="shadow bg-gray-800/30 p-2 rounded flex justify-between">
          <div class="flex items-stretch gap-2">
            <Avatar.Root>
              <Avatar.Image
                src={`https://ui-avatars.com/api/?name=${user.name}`}
                alt={user.name}
              />
              <Avatar.Fallback>{user.name.slice(0, 2)}</Avatar.Fallback>
            </Avatar.Root>

            <div>
              <p class="text-lg">{user.name}</p>
              <p class="text-sm">{user.username}</p>
            </div>
          </div>
          <Button
            on:click={() => handleCall(user.id, user.name)}
            class="rounded-full py-6"
            variant="secondary"
          >
            <Phone class="fill-white" size={20} />
          </Button>
        </div>
      {/each}
    </div>
  {:else}
    <p
      class=" text-gray-600/30 h-full grid place-content-center font-semibold text-xl"
    >
      No Users Available
    </p>
  {/if}
</Content>

<!-- on:click={() => handleCall(user.id, user.name)} -->
