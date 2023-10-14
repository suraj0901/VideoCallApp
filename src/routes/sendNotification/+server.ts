import type { RequestHandler } from "@sveltejs/kit";
import webpush from "web-push";
import { env } from "$env/dynamic/public";
import { env as envPrivate } from "$env/dynamic/private";

webpush.setVapidDetails(
  "mailto:test@test.com",
  env.PUBLIC_WEBPUSH_KEY,
  envPrivate.PRIVATE_WEBPUSH_KEY
);

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

  const notification = await request.json();
  const { data, error } = await supabase
    .from("pushNotification")
    .select("*")
    .eq("id", notification.id);

  if (error) return new Response("Server Error", { status: 500 });
  if (data?.length === 0) {
    return new Response("No subscription found for requested user", {
      status: 400,
    });
  }

  const subscription_data = data.at(0);
  const result = await webpush.sendNotification(
    {
      endpoint: subscription_data.endpoint,
      keys: {
        auth: subscription_data.auth,
        p256dh: subscription_data.p256dh,
      },
    },
    JSON.stringify(notification.payload)
  );
  return new Response(null, {
    status: result.statusCode,
    statusText: JSON.stringify(result.body),
  });
};
