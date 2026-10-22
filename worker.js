export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Missing 'url' parameter", { status: 400 });
    }

    const authKey = request.headers.get("X-Proxy-Key");
    if (env.PROXY_KEY && authKey !== env.PROXY_KEY) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const newHeaders = new Headers();
      const allowedHeaders = ['user-agent', 'accept', 'accept-language', 'referer', 'cookie', 'authorization', 'content-type'];

      allowedHeaders.forEach(h => {
        const val = request.headers.get(h);
        if (val) newHeaders.set(h, val);
      });

      if (!newHeaders.has('user-agent')) {
        newHeaders.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
      }

      let body = null;
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        body = await request.arrayBuffer();
      }

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: newHeaders,
        body: body,
        redirect: 'follow'
      });

      const finalHeaders = new Headers(response.headers);
      finalHeaders.set("Access-Control-Allow-Origin", "*");

      return new Response(response.body, {
        status: response.status,
        headers: finalHeaders,
      });
    } catch (error) {
      return new Response("Proxy Error: " + error.message, { status: 500 });
    }
  },
};