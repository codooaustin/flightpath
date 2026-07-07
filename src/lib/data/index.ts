import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId } from "@/lib/auth";
import type { Mission, UserMission } from "@/types/models";

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
  ]);

  const missionList = missions ?? [];

  return {
    stages: stages ?? [],
    missions: missionList,
    userMissions: mergeUserMissions(userMissions ?? [], missionList),
    events: events ?? [],
    expenses: expenses ?? [],
    journal: journal ?? [],
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
