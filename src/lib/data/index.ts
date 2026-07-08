import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId } from "@/lib/auth";
import { parseFlights } from "@/lib/flights/parse";
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

  return {
    stages: stages ?? [],
    missions: missionList,
    userMissions: mergeUserMissions(userMissions ?? [], missionList),
    events: events ?? [],
    expenses: expenses ?? [],
    journal: journal ?? [],
    flights: parseFlights(flights ?? []),
    studentProfile: (studentProfile as Profile | null) ?? null,
    studentId,
  };
}

export async function getLogbookData(searchParams?: { student?: string }) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId(searchParams);

  const [{ data: flights }, { data: profile }] = await Promise.all([
    supabase
      .from("flights")
      .select("*")
      .eq("user_id", studentId)
      .order("date", { ascending: false }),
    supabase
      .from("profiles")
      .select("home_airport")
      .eq("id", studentId)
      .single(),
  ]);

  return {
    flights: parseFlights(flights ?? []),
    homeAirport: profile?.home_airport ?? null,
    studentId,
  };
}

export async function getMissionsData(searchParams?: { student?: string }) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId(searchParams);

  const [{ data: stages }, { data: missions }, { data: userMissions }] =
    await Promise.all([
      supabase.from("stages").select("*").order("order_number"),
      supabase.from("missions").select("*").order("order_number"),
      supabase.from("user_missions").select("*").eq("user_id", studentId),
    ]);

  const missionList = missions ?? [];

  return {
    stages: stages ?? [],
    missions: missionList,
    userMissions: mergeUserMissions(userMissions ?? [], missionList),
    studentId,
  };
}
