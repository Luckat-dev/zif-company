const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const authToken = event.headers.authorization;
  const expectedToken = process.env.ADMIN_API_TOKEN;
  
  if (!authToken || authToken !== `Bearer ${expectedToken}`) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Non autorisé' })
    };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { id, name, role, bio, whatsapp, display_order, photo_url } = JSON.parse(event.body);

  const { data, error } = await supabase
    .from('team')
    .update({ name, role, bio, whatsapp, display_order, photo_url })
    .eq('id', id)
    .select();

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data })
  };
};