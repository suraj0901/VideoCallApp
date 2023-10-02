import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
  locals: { getSession, supabase },
}) => {
  const session = await getSession();

  if (!session) {
    throw redirect(303, "/signin");
  }

  let { data: profile, error } = await supabase.from("profile").select("*");

  return {
    users: profile,
    self: session.user,
  };
};

export const actions = {
  signout: async ({ locals: { supabase } }) => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return fail(500, {
        message: "Server error. Try again later.",
        success: false,
      });
    }

    throw redirect(303, "/signin");
  },
  updateProfile: async ({ request, locals: { supabase, getSession } }) => {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const username = formData.get("username") as string;

    let status = 500;
    try {
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

      const session = await getSession();

      const { error } = await supabase.from("profile").insert([
        {
          id: session?.user.id,
          name,
          username,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      return {
        message: "Successfully update profile",
        success: true,
      };
    } catch (error: any) {
      return fail(status, {
        message: error.message,
        success: false,
        username,
        name,
      });
    }
  },
};
