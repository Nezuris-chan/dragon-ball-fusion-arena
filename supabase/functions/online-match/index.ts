import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const respond = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond({ error: "Méthode non autorisée" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return respond({ error: "Configuration serveur incomplète" }, 500);

  const authorization = req.headers.get("Authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token || token === authorization) return respond({ error: "Connexion requise" }, 401);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return respond({ error: "Session invalide" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return respond({ error: "Corps JSON invalide" }, 400);
  }

  const actor = authData.user.id;
  if (body.action === "register") {
    const matchId = String(body.match_id || "");
    const player2 = String(body.player2 || "");
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!matchId || !uuidPattern.test(matchId) || !uuidPattern.test(player2) || player2 === actor) {
      return respond({ error: "Paramètres du match invalides" }, 400);
    }
    const { data: opponentProfile, error: opponentError } = await admin
      .from("profiles")
      .select("id")
      .eq("id", player2)
      .maybeSingle();
    if (opponentError) return respond({ error: "Vérification de l'adversaire impossible" }, 500);
    if (!opponentProfile) return respond({ error: "Adversaire introuvable" }, 404);

    const { error } = await admin.rpc("register_online_match_secure", {
      p_match_id: matchId,
      p_player1: actor,
      p_player2: player2,
      p_actor: actor,
    });
    if (error) return respond({ error: "Création du match refusée" }, 400);
    return respond({ status: "registered" });
  }

  if (body.action === "report") {
    const matchId = String(body.match_id || "");
    const winner = String(body.winner || "");
    if (!matchId || !winner) return respond({ error: "Résultat incomplet" }, 400);
    const { data, error } = await admin.rpc("report_online_match_secure", {
      p_match_id: matchId,
      p_winner: winner,
      p_actor: actor,
    });
    if (error) return respond({ error: "Validation du résultat refusée" }, 400);
    return respond({ status: data });
  }

  return respond({ error: "Action inconnue" }, 400);
});
