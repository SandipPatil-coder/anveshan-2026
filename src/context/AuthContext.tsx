import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { getProfile } from "@/services/auth";
import type { Profile } from "@/types";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (user) {
      getProfile(user.id).then((p) => {
        if (mounted) setProfile(p);
      });
      supabase
        .from("profiles")
        .select("updated_at")
        .eq("id", user.id)
        .maybeSingle()
        .then(() => undefined);
    } else {
      setProfile(null);
    }
    return () => {
      mounted = false;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshProfile = async () => {
    if (user) setProfile(await getProfile(user.id));
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, isAdmin: profile?.role === "admin" || profile?.role === "super_admin", refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
