export async function getBomSummaryJsonWithLocalCache(): Promise<{
	weather: unknown;
	forecastDaily: unknown;
	forecastText: unknown;
}> {
	const cacheKey = 'bom-summary-json';
	const cachedData = await caches.default.match(cacheKey);

	if (cachedData) {
		console.log('Using cached BOM data');
		return cachedData.json();
	}

	const data = await getBomSummaryJson();
	await caches.default.put(cacheKey, new Response(JSON.stringify(data), { status: 200 }));
	return data;
}

export async function getBomSummaryJson(): Promise<{
	weather: unknown;
	forecastDaily: unknown;
	forecastText: unknown;
}> {
	const weatherUrl = 'https://api.bom.gov.au/apikey/v1/observations/latest/40913/atm/surf_air?include_qc_results=false';
	const forecastTextUrl =
		'https://api.bom.gov.au/apikey/v1/forecasts/texts?aac=QLD_PW015&aac=QLD_FW015&aac=QLD_MW013&aac=QLD_FA001&aac=QLD_ME001&aac=QLD_PT001&timezone=Australia%2FBrisbane';
	const forecastDailyUrl = 'https://api.bom.gov.au/apikey/v1/forecasts/daily/689/350?timezone=Australia%2FBrisbane';

	const [weatherResponse, forecastTextReponse, forecastDailyResponse] = await Promise.all([
		makeRequest(weatherUrl, 'Weather'),
		makeRequest(forecastTextUrl, 'Forecast Text'),
		makeRequest(forecastDailyUrl, 'Forecast Daily'),
	]);

	console.log('Fetched BOM data');

	return {
		weather: weatherResponse,
		forecastDaily: forecastDailyResponse,
		forecastText: forecastTextReponse,
	};
}

async function makeRequest(url: string, description: string) {
	const resp = await fetch(url, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
		},
	});

	if (!resp.ok) {
		throw new Error(`Non-200 response for ${description}: ${resp.status}: ${await resp.text()}`);
	}

	return resp.json();
}
