import { supabase } from "./supabase";

export async function saveTrip(trip: any) {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return;

  await supabase.from("trips").insert({
    user_id: user.user.id,
    from_location: trip.from,
    to_location: trip.to,
    route: trip.route,
  });
}