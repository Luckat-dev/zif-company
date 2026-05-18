// netlify/functions/newsletter-signup.mjs
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email;
  try {
    const params = new URLSearchParams(event.body);
    email = params.get('email');
    if (!email || !email.includes('@')) {
      throw new Error('Email invalide');
    }
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email invalide' }) };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        listIds: [3],
        updateEnabled: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur Brevo');
    }

    return {
      statusCode: 302,
      headers: { 'Location': '/merci-inscription' }
    };
  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 302,
      headers: { 'Location': '/erreur-inscription' }
    };
  }
};