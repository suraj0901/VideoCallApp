import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({
  locals: { getSession, supabase },
}) => {
  const session = await getSession();

  if (session) {
    throw redirect(303, "/");
  }
};

export const actions = {
  default: async ({ request, url, locals: { supabase, getSession } }) => {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    let status: number = 500;
    try {
      if (confirmPassword !== password) {
        status = 400;
        throw new Error("Password and Confirm Password are not same");
      }

      const { data: profile, error: profile_error } = await supabase
        .from("profile")
        .select("*")
        .eq("username", username);

      if (profile?.length && profile.length > 0) {
        status = 400;
        throw new Error("Username already taken");
      }

      if (profile_error) {
        throw new Error(profile_error.message);
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${url.origin}/auth/callback`,
          data: { name, username },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        message:
          "Please check your email for a magic link to log into the website.",
        success: true,
      };
    } catch (error: any) {
      return fail(status, {
        message: error.message,
        success: false,
        email,
        name,
        username,
      });
    }
  },
};
