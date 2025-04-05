/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === '/login') {
			// Use environment variables for the GitHub Client ID
			const clientId = env.GITHUB_CLIENT_ID;
			const domain = 'sfhacks2025-auth.bilk0h.workers.dev';
			const redirectUri = encodeURIComponent('https://' + domain + '/callback');
			const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
			return Response.redirect(githubAuthUrl, 302);
		} else if (url.pathname === '/callback') {
			const code = url.searchParams.get('code');
			if (!code) return new Response('No code provided', { status: 400 });

			// Exchange the authorization code for an access token
			const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({
					client_id: env.GITHUB_CLIENT_ID,
					client_secret: env.GITHUB_CLIENT_SECRET,
					code: code,
				}),
			});

			const tokenData = await tokenResponse.json();

			// Use the access token to retrieve user information from GitHub
			const userResponse = await fetch('https://api.github.com/user', {
				headers: { Authorization: `token ${tokenData.access_token}` },
			});
			const userData = await userResponse.json();

			// Here, you would create a session or further process userData as needed
			return new Response(`Hello, ${userData.login}!`, { status: 200 });
		}

		return new Response('Welcome to your site!', { status: 200 });
	},
};
