import { supabase } from "@/lib/supabaseClient";
import type { Profile } from "@/types";

export async function getSessionUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return (data as Profile) ?? null;
}

export async function signUpEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ needsVerification: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return { needsVerification: !data.session };
}

export async function signInEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}
