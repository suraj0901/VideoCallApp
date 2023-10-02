import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { AuthApiError } from "@supabase/supabase-js";

export const load: PageServerLoad = async ({ locals: { getSession } }) => {
  const session = await getSession();

  if (session) {
    throw redirect(303, "/");
  }
};

export const actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log(error);
    if (error) {
      if (error instanceof AuthApiError && error.status === 400) {
        return fail(400, {
          message: error.message,
          success: false,
          email,
        });
      }
      return fail(500, {
        message: "Server error. Try again later.",
        success: false,
        email,
      });
    }

    throw redirect(303, "/");
  },
};
