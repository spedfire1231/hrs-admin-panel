import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequestPost = async ({ request }: any) => {
  return new Response(
    JSON.stringify({
      user: {
        id: "1",
        email: "admin@hrs.com",
        role: "admin",
        firstName: "Admin",
        lastName: "HRS",
      },
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};
