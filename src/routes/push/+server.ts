import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { getSession, supabase },
}) => {
  const session = await getSession();
  if (!session)
    return new Response("UnAuthorized", {
      status: 401,
      statusText: "UnAuthorized",
    });

  const user_id = session.user.id;
  const { data, error } = await supabase
    .from("pushNotification")
    .select("*")
    .eq("id", user_id);

  if (error) return new Response("Server Error", { status: 500 });

  const subscription = await request.json();

  const subscription_obj = {
    id: user_id,
    endpoint: subscription.subscription.endpoint,
    ...subscription.subscription.keys,
  };
  if (data?.length ?? 0 > 0) {
    const { error } = await supabase
      .from("pushNotification")
      .update(subscription_obj)
      .eq("id", user_id);

    if (error) return new Response("Server Error", { status: 500 });
    return new Response("Subscription Updated", { status: 201 });
  }

  const { error: SubscriptionError } = await supabase
    .from("pushNotification")
    .insert([subscription_obj]);

  if (SubscriptionError) return new Response("Server Error", { status: 500 });
  return new Response("Subscription Added", { status: 201 });
};
