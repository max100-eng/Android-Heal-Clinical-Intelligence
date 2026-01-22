export const config = {
  runtime: 'nodejs20.x'
};

export default async function handler(req: Request): Promise<Response> {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

