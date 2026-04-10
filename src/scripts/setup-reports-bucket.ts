
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function setup() {
  console.log('Starting Supabase setup...');
  
  try {
    // Create bucket
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 'reports',
        name: 'reports',
        public: true
      })
    });
    
    if (res.ok) {
      console.log('Bucket "reports" created successfully');
    } else {
      const error = await res.text();
      console.log('Bucket might already exist or error:', error);
    }
    
    console.log('Setup finished');
  } catch (err) {
    console.error('Setup failed:', err);
  }
}

setup();
