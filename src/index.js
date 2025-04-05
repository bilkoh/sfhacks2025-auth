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
		const clientId = env.GITHUB_CLIENT_ID;
		const clientSecret = env.GITHUB_CLIENT_SECRET;

		if (url.pathname === '/login') {
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
					client_id: clientId,
					client_secret: clientSecret,
					code: code,
				}),
			});
			const tokenData = await tokenResponse.json();

			return new Response(`${JSON.stringify(tokenData)} ${clientId} ${clientSecret}`, {
				status: tokenResponse.status,
				headers: {
					'Content-Type': 'application/json',
					// Add CORS headers to allow your Pages domain to access this API
					'Access-Control-Allow-Origin': '*', // In production, specify your actual domain
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});

			// // const tokenData = await tokenResponse.json();
			// // Add robust error handling
			// if (!tokenResponse.ok) {
			// 	const errorText = await tokenResponse.text();
			// 	return new Response(`GitHub API error: ${errorText.substring(0, 500)}`, {
			// 		status: tokenResponse.status,
			// 		headers: { 'Content-Type': 'text/plain' },
			// 	});
			// }

			// let tokenData;
			// try {
			// 	const text = await tokenResponse.text();
			// 	try {
			// 		tokenData = JSON.parse(text);
			// 	} catch (e) {
			// 		return new Response(`Failed to parse GitHub response: ${text.substring(0, 200)}...`, {
			// 			status: 500,
			// 			headers: { 'Content-Type': 'text/plain' },
			// 		});
			// 	}
			// } catch (e) {
			// 	return new Response(`Error processing GitHub response: ${e.message}`, {
			// 		status: 500,
			// 		headers: { 'Content-Type': 'text/plain' },
			// 	});
			// }

			// // Check if we have an access token
			// if (!tokenData.access_token) {
			// 	return new Response(`GitHub did not provide access token: ${JSON.stringify(tokenData)}`, {
			// 		status: 400,
			// 		headers: { 'Content-Type': 'text/plain' },
			// 	});
			// }

			// // Use the access token to retrieve user information from GitHub
			// const userResponse = await fetch('https://api.github.com/user', {
			// 	headers: { Authorization: `token ${tokenData.access_token}` },
			// });
			// const userData = await userResponse.json();

			// // Here, you would create a session or further process userData as needed
			// // return new Response(`Hello, ${userData.login}!`, { status: 200 });
			// return new Response(JSON.stringify(userData), {
			// 	status: 200,
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 		// Add CORS headers to allow your Pages domain to access this API
			// 		'Access-Control-Allow-Origin': '*', // In production, specify your actual domain
			// 		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			// 		'Access-Control-Allow-Headers': 'Content-Type',
			// 	},
			// });
		}

		return new Response('Welcome to your site!', { status: 200 });
	},
};
