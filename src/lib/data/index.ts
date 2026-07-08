import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId } from "@/lib/auth";
import { parseFlights } from "@/lib/flights/parse";
import { syncAgeGatedMissionAvailability } from "@/lib/missions/sync-missions";
import type { Mission, Profile, UserMission } from "@/types/models";

function mergeUserMissions(
  userMissions: UserMission[],
  missions: Mission[]
): (UserMission & { mission?: Mission })[] {
  const missionMap = new Map(missions.map((m) => [m.id, m]));
  return userMissions.map((um) => ({
    ...um,
    mission: missionMap.get(um.mission_id),
  }));
}

export async function getDashboardData(searchParams?: { student?: string }) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId(searchParams);

  const [
    { data: stages },
    { data: missions },
    { data: userMissions },
    { data: events },
    { data: expenses },
    { data: journal },
    { data: flights },
    { data: studentProfile },
  ] = await Promise.all([
    supabase.from("stages").select("*").order("order_number"),
    supabase.from("missions").select("*").order("order_number"),
    supabase.from("user_missions").select("*").eq("user_id", studentId),
    supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", studentId)
      .gte("start_date", new Date().toISOString())
      .order("start_date")
      .limit(3),
    supabase.from("expenses").select("*").eq("user_id", studentId),
    supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", studentId)
      .order("entry_date", { ascending: false })
      .limit(1),
    supabase
      .from("flights")
      .select("*")
      .eq("user_id", studentId)
      .order("date", { ascending: false }),
    supabase.from("profiles").select("*").eq("id", studentId).single(),
  ]);

  const missionList = missions ?? [];
  const mergedUserMissions = mergeUserMissions(userMissions ?? [], missionList);
  const profile = (studentProfile as Profile | null) ?? null;

  await syncAgeGatedMissionAvailability(
    studentId,
    profile?.birth_date ?? null,
    missionList,
    mergedUserMissions,
    stages ?? []
  );

  const { data: refreshedUserMissions } = await supabase
    .from("user_missions")
    .select("*")
    .eq("user_id", studentId);

  return {
    stages: stages ?? [],
    missions: missionList,
    userMissions: mergeUserMissions(refreshedUserMissions ?? [], missionList),
    events: events ?? [],
    expenses: expenses ?? [],
    journal: journal ?? [],
    flights: parseFlights(flights ?? []),
    studentProfile: profile,
    studentId,
  };
}

export async function getLogbookData(searchParams?: { student?: string }) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId(searchParams);

  const [
    { data: flights },
    { data: profile },
    { data: stages },
    { data: missions },
    { data: userMissions },
  ] = await Promise.all([
    supabase
      .from("flights")
      .select("*")
      .eq("user_id", studentId)
      .order("date", { ascending: false }),
    supabase
      .from("profiles")
      .select("home_airport, birth_date")
      .eq("id", studentId)
      .single(),
    supabase.from("stages").select("*").order("order_number"),
    supabase.from("missions").select("*").order("order_number"),
    supabase.from("user_missions").select("*").eq("user_id", studentId),
  ]);

  const missionList = missions ?? [];

  return {
    flights: parseFlights(flights ?? []),
    homeAirport: profile?.home_airport ?? null,
    studentProfile: profile,
    stages: stages ?? [],
    missions: missionList,
    userMissions: mergeUserMissions(userMissions ?? [], missionList),
    studentId,
  };
}

export async function getMissionsData(searchParams?: { student?: string }) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId(searchParams);

  const [
    { data: stages },
    { data: missions },
    { data: userMissions },
    { data: studentProfile },
  ] = await Promise.all([
    supabase.from("stages").select("*").order("order_number"),
    supabase.from("missions").select("*").order("order_number"),
    supabase.from("user_missions").select("*").eq("user_id", studentId),
    supabase.from("profiles").select("birth_date").eq("id", studentId).single(),
  ]);

  const missionList = missions ?? [];
  const mergedUserMissions = mergeUserMissions(userMissions ?? [], missionList);

  await syncAgeGatedMissionAvailability(
    studentId,
    studentProfile?.birth_date ?? null,
    missionList,
    mergedUserMissions,
    stages ?? []
  );

  const { data: refreshedUserMissions } = await supabase
    .from("user_missions")
    .select("*")
    .eq("user_id", studentId);

  return {
    stages: stages ?? [],
    missions: missionList,
    userMissions: mergeUserMissions(refreshedUserMissions ?? [], missionList),
    studentProfile: studentProfile ?? null,
    studentId,
  };
}
