import { redirect } from "@sveltejs/kit";

export const GET = async ({ url, locals: { supabase, getSession } }) => {
  const code = url.searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const session = await getSession();
  if (session) {
    const { name, username } = session?.user.user_metadata;
    console.log({ name, username });

    const { error } = await supabase.from("profile").insert([
      {
        id: session?.user.id,
        name,
        username,
      },
    ]);

    if (error) {
      // throw new Error(error.message);
      console.log(error.message);
    }
  }

  throw redirect(303, "/");
};
