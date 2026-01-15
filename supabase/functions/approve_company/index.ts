import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-jwt",
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
      return new Response(JSON.stringify({ error: "Missing env vars" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader =
      req.headers.get("x-user-jwt") ?? req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { companyId } = await req.json();
    if (!companyId) {
      return new Response(JSON.stringify({ error: "companyId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      data: authUser,
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !authUser?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userRow } = await userClient
      .from("users")
      .select("role")
      .eq("id", authUser.user.id)
      .single();

    if (!userRow || userRow.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: company, error: companyError } = await adminClient
      .from("companies")
      .select(
        "id, name, contact_name, contact_email, contact_phone, user_id, status, siret"
      )
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!company.contact_email) {
      return new Response(JSON.stringify({ error: "Missing contact email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (company.siret) {
      const { data: existingSiret } = await adminClient
        .from("companies")
        .select("id")
        .eq("siret", company.siret)
        .neq("id", company.id)
        .limit(1);

      if (existingSiret && existingSiret.length > 0) {
        return new Response(JSON.stringify({ error: "SIRET already exists" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    let userId = company.user_id;

    if (!userId) {
      const { data: inviteData, error: inviteError } =
        await adminClient.auth.admin.inviteUserByEmail(company.contact_email, {
          data: {
            role: "company",
            full_name: company.contact_name ?? "",
          },
        });

      if (inviteError || !inviteData.user) {
        return new Response(JSON.stringify({ error: "Invite failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      userId = inviteData.user.id;

      await adminClient.from("users").upsert({
        id: userId,
        email: company.contact_email,
        role: "company",
        full_name: company.contact_name ?? null,
        phone: company.contact_phone ?? null,
      });
    }

    const { data: updatedCompany, error: updateError } = await adminClient
      .from("companies")
      .update({ status: "approved", user_id: userId })
      .eq("id", companyId)
      .select()
      .single();

    if (updateError) {
      return new Response(JSON.stringify({ error: "Update failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ company: updatedCompany }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
