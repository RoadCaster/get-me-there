import { supabase } from "@/lib/supabase";

export async function saveTrip(trip: any) {
  const { data } = await supabase.auth.getSession();

  if (!data.session) return;

  await supabase.from("trips").insert({
    user_id: data.session.user.id,
    from_location: trip.from,
    to_location: trip.to,
    route: trip.route,
  });
}

export async function getTrips() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) return [];

  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", data.session.user.id)
    .order("created_at", { ascending: false });

  return trips || [];
}

export async function deleteTrip(id: string) {
  await supabase.from("trips").delete().eq("id", id);
}