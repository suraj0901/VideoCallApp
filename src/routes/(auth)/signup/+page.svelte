<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from "$lib/components/ui/card";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import { Loader2 } from "lucide-svelte";
  import toast from "svelte-french-toast";

  export let form;

  $: {
    if (form?.message) {
      form?.success ? toast.success(form.message) : toast.error(form?.message);
    }
  }

  let loading = false;
</script>

<svelte:head>
  <title>Sign Up</title>
</svelte:head>

<Card.Root class="max-w-lg w-full mx-auto">
  <Card.Header />
  <Card.Content>
    <form
      method="post"
      class="grid gap-4"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          loading = false;
          update();
        };
      }}
    >
      <section class="grid gap-1.5">
        <Label for="name">Name</Label>
        <Input
          disabled={loading}
          name="name"
          type="text"
          placeholder="Your name"
          required
          value={form?.name ?? ""}
        />
      </section>
      <section class="grid gap-1.5">
        <Label for="username">Username</Label>
        <Input
          disabled={loading}
          name="username"
          type="text"
          placeholder="Your username"
          required
          value={form?.username ?? ""}
        />
      </section>
      <section class="grid gap-1.5">
        <Label for="email">Email</Label>
        <Input
          disabled={loading}
          name="email"
          type="email"
          placeholder="Your email address"
          required
          value={form?.email ?? ""}
        />
      </section>

      <section class="grid gap-1.5">
        <Label for="password">Password</Label>
        <Input
          disabled={loading}
          name="password"
          placeholder="Password"
          required
          type="password"
        />
      </section>
      <section class="grid gap-1.5">
        <Label for="confirmPassword">Confirm Password</Label>
        <Input
          disabled={loading}
          name="confirmPassword"
          placeholder="Renter Password"
          required
          type="password"
        />
      </section>
      <Button type="submit">
        <Loader2
          class="mr-2 h-4 w-4 animate-spin {loading ? 'block' : 'hidden'}"
        />
        Submit
      </Button>
    </form>
  </Card.Content>
  <Card.Footer>
    <a
      href="/signin"
      class="text-sm text-gray-400 hover:text-blue-600 underline">Sing In</a
    >
  </Card.Footer>
</Card.Root>
