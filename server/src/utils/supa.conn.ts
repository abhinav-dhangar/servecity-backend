import { createClient } from "@supabase/supabase-js";
require("dotenv").config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY,
  {
    auth: {
      flowType: "pkce",
    },
  }
);

export { supabase };
