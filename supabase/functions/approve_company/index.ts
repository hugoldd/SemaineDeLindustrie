import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-jwt",
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

const buildLocation = (company: {
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
}) => {
  const parts = [company.address, company.postal_code, company.city].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnon || !serviceRoleKey) {
      return jsonResponse(500, { error: "Missing env vars" });
    }

    const authHeader =
      req.headers.get("x-user-jwt") ?? req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { companyId } = await req.json();
    if (!companyId) {
      return jsonResponse(400, { error: "companyId required" });
    }

    const { data: authUser, error: authError } = await userClient.auth.getUser();
    if (authError || !authUser?.user) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    const { data: userRow } = await userClient
      .from("users")
      .select("role")
      .eq("id", authUser.user.id)
      .single();

    if (!userRow || userRow.role !== "admin") {
      return jsonResponse(403, { error: "Forbidden" });
    }

    const { data: company, error: companyError } = await adminClient
      .from("companies")
      .select(
        "id, name, contact_name, contact_email, contact_phone, user_id, status, siret, address, city, postal_code, themes"
      )
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return jsonResponse(404, { error: "Company not found" });
    }

    if (!company.contact_email) {
      return jsonResponse(400, { error: "Missing contact email" });
    }

    if (company.siret) {
      const { data: existingSiret } = await adminClient
        .from("companies")
        .select("id")
        .eq("siret", company.siret)
        .neq("id", company.id)
        .limit(1);

      if (existingSiret && existingSiret.length > 0) {
        return jsonResponse(409, { error: "SIRET already exists" });
      }
    }

    let userId = company.user_id;

    if (!userId) {
      const publicSiteUrl = Deno.env.get("PUBLIC_SITE_URL");
      const emailJsServiceId = Deno.env.get("EMAILJS_SERVICE_ID");
      const emailJsTemplateId = Deno.env.get("EMAILJS_TEMPLATE_INVITE_COMPANY");
      const emailJsPublicKey = Deno.env.get("EMAILJS_PUBLIC_KEY");
      const emailJsPrivateKey = Deno.env.get("EMAILJS_PRIVATE_KEY");

      if (!publicSiteUrl) {
        return jsonResponse(500, { error: "Missing PUBLIC_SITE_URL" });
      }

      if (!emailJsServiceId || !emailJsTemplateId || !emailJsPublicKey) {
        return jsonResponse(500, { error: "Missing EmailJS config" });
      }

      const { data: inviteData, error: inviteError } =
        await adminClient.auth.admin.generateLink({
          type: "invite",
          email: company.contact_email,
          options: {
            data: {
              role: "company",
              full_name: company.contact_name ?? "",
            },
            redirectTo: `${publicSiteUrl}/auth/callback`,
          },
        });

      if (inviteError || !inviteData.user || !inviteData.properties?.action_link) {
        return jsonResponse(500, { error: "Invite failed" });
      }

      userId = inviteData.user.id;

      await adminClient.from("users").upsert({
        id: userId,
        email: company.contact_email,
        role: "company",
        full_name: company.contact_name ?? null,
        phone: company.contact_phone ?? null,
      });

      let sectorName: string | null = null;
      const themeId = company.themes?.[0];
      if (themeId) {
        const { data: themeRow } = await adminClient
          .from("themes")
          .select("name")
          .eq("id", themeId)
          .single();
        sectorName = themeRow?.name ?? null;
      }

      await sendEmail(
        emailJsServiceId,
        emailJsTemplateId,
        emailJsPublicKey,
        {
          to_email: company.contact_email,
          to_name: company.contact_name ?? company.contact_email,
          action_url: inviteData.properties.action_link,
          company_name: company.name,
          company_siret: company.siret ?? "",
          company_sector: sectorName ?? "",
          company_location: buildLocation(company) ?? "",
        },
        emailJsPrivateKey
      );
    }

    const { data: updatedCompany, error: updateError } = await adminClient
      .from("companies")
      .update({ status: "approved", user_id: userId })
      .eq("id", companyId)
      .select()
      .single();

    if (updateError) {
      return jsonResponse(500, { error: "Update failed" });
    }

    return jsonResponse(200, { company: updatedCompany });
  } catch (error) {
    return jsonResponse(500, { error: "Unexpected error" });
  }
});
