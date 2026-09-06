import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://innkgyknwiehspebjypz.supabase.co",
  "sb_publishable_sp7_74R0t1apeEfxnI1K3A_jyZzyEdq"
);

async function inspect() {
  const { data: u, error: eu } = await supabase.from("users").select("*").limit(2);
  console.log("USERS:", { error: eu, data: u });

  const { data: m, error: em } = await supabase.from("memories").select("*").limit(2);
  console.log("MEMORIES:", { error: em, data: m });

  const { data: r, error: er } = await supabase.from("reminders").select("*").limit(2);
  console.log("REMINDERS:", { error: er, data: r });
}

inspect();
