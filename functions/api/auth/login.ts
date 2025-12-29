import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequestPost = async ({ request }: any) => {
  const { email, password } = await request.json();

  if (email === "admin@hrs.com" && password === "123456") {
    return new Response(
      JSON.stringify({
        token: "demo-token",
        user: {
          id: "1",
          email,
          role: "admin",
          firstName: "Admin",
          lastName: "HRS",
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ error: "Invalid credentials" }),
    { status: 401 }
  );
};
