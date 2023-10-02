<script lang="ts">
  import Profile from "$lib/Profile.svelte";
  import Content from "$lib/Video/Content.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import Button from "$lib/components/ui/button/button.svelte";
  import { LogOut, Phone } from "lucide-svelte";

  export let data;

  let filter_user: any[] = [];
  $: {
    if (data.users) {
      filter_user = data.users.filter((user) => user.id !== data.self.id);
    }
  }
</script>

<Content currentUser={data.self} let:handleCall>
  <span class="flex justify-between" slot="header">
    <p class="text-xl items-center">{data.self.user_metadata.name}</p>
    <form method="post" action="?/signout">
      <Button type="submit" size="icon">
        <LogOut size={20} />
      </Button>
    </form>
  </span>
  {#if filter_user.length}
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
