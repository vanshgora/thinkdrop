const { createClient } = require('@supabase/supabase-js');

function connectToDB() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    return supabase;
}

module.exports = connectToDB;
