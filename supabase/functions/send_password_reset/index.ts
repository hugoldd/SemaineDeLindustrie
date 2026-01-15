import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const emailJsEndpoint = "https://api.emailjs.com/api/v1.0/email/send";

const jsonResponse = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sendEmail = async (
  serviceId: string,
  templateId: string,
  publicKey: string,
  templateParams: Record<string, string | number | boolean | null>,
  privateKey?: string | null
) => {
  const payload: Record<string, unknown> = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams,
  };

  if (privateKey) {
    payload.accessToken = privateKey;
  }

  const response = await fetch(emailJsEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("EmailJS error");
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const publicSiteUrl = Deno.env.get("PUBLIC_SITE_URL");

    const emailJsServiceId = Deno.env.get("EMAILJS_SERVICE_ID");
    const emailJsTemplateId = Deno.env.get("EMAILJS_TEMPLATE_RESET_PASSWORD");
    const emailJsPublicKey = Deno.env.get("EMAILJS_PUBLIC_KEY");
    const emailJsPrivateKey = Deno.env.get("EMAILJS_PRIVATE_KEY");

    if (!supabaseUrl || !serviceRoleKey || !publicSiteUrl) {
      return jsonResponse(500, { error: "Missing env vars" });
    }

    if (!emailJsServiceId || !emailJsTemplateId || !emailJsPublicKey) {
      return jsonResponse(500, { error: "Missing EmailJS config" });
    }

    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return jsonResponse(400, { error: "Email required" });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${publicSiteUrl}/auth/callback`,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      return jsonResponse(500, { error: "Link generation failed" });
    }

    const { data: profile } = await adminClient
      .from("users")
      .select("full_name")
      .eq("email", email)
      .maybeSingle();

    await sendEmail(
      emailJsServiceId,
      emailJsTemplateId,
      emailJsPublicKey,
      {
        to_email: email,
        to_name: profile?.full_name ?? email,
        user_email: email,
        action_url: linkData.properties.action_link,
      },
      emailJsPrivateKey
    );

    return jsonResponse(200, { ok: true });
  } catch (error) {
    return jsonResponse(500, { error: "Unexpected error" });
  }
});
