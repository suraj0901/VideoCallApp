<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button/button.svelte";
  import { page } from "$app/stores";
  import toast from "svelte-french-toast";

  $: ({ form, data } = $page);
  $: {
    if (form?.message) {
      form?.success ? toast.success(form?.message) : toast.error(form?.message);
    }
  }
</script>

<Dialog.Root>
  <Dialog.Trigger>Profile</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Profile</Dialog.Title>
    </Dialog.Header>
    <form method="post" action="?/updateProfile" class="grid gap-4" use:enhance>
      <section class="grid gap-2">
        <label class=" text-gray-400" for="name">Name</label>
        <input
          class="p-4 rounded bg-transparent border border-gray-600"
          name="name"
          type="text"
          placeholder="Your name"
          required
          value={data?.self?.name ?? form?.name ?? ""}
        />
      </section>
      <section class="grid gap-2">
        <label class=" text-gray-400" for="username">Username</label>
        <input
          class="p-4 rounded bg-transparent border border-gray-600"
          name="username"
          type="text"
          placeholder="Your username"
          required
          value={data?.self?.username ?? form?.username ?? ""}
        />
      </section>
      <Button type="submit">Submit</Button>
    </form>
  </Dialog.Content>
</Dialog.Root>
