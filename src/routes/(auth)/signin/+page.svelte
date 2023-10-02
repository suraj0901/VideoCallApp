<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from "$lib/components/ui/card";
  import Input from "$lib/components/ui/input/input.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import toast from "svelte-french-toast";

  export let form;

  $: {
    if (form?.message) {
      form.success ? toast.success(form.message) : toast.error(form.message);
    }
  }
</script>

<svelte:head>
  <title>Sign In</title>
</svelte:head>

<Card.Root class="max-w-lg mx-auto w-full">
  <Card.Header />
  <Card.Content>
    <form method="post" class="grid gap-4" use:enhance>
      <section class="grid gap-1.5">
        <Label for="email">Email</Label>
        <Input
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
          name="password"
          placeholder="Password"
          required
          type="password"
        />
      </section>
      <Button type="submit">Submit</Button>
    </form>
  </Card.Content>
  <Card.Footer>
    <a
      href="/signup"
      class="text-sm text-gray-400 hover:text-blue-600 underline">Sing up</a
    >
  </Card.Footer>
</Card.Root>
