import { DailyForecastsResponse } from './dailyForecastsResponse';
import { ForecastTextsResponse } from './forecastResponse';
import { WeatherResponse } from './weatherResponse';

type RainSummary = {
	chance25Percent: number;
	chance75Percent: number;
};

type BomSummary = {
	locationName: string;
	currentTemp: string;
	currentFeelsLikeTemp: string;
	todaysMax: string;
	humidity: string;
	summary: string;
	iconCode: number;
	rain?: RainSummary;
	// Rain                 []RainData
};

export async function getBomSummaryJsonWithLocalCache(): Promise<{
	weather: WeatherResponse;
	forecastDaily: DailyForecastsResponse;
	forecastText: ForecastTextsResponse;
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
	weather: WeatherResponse;
	forecastDaily: DailyForecastsResponse;
	forecastText: ForecastTextsResponse;
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
		weather: weatherResponse as WeatherResponse,
		forecastDaily: forecastDailyResponse as DailyForecastsResponse,
		forecastText: forecastTextReponse as ForecastTextsResponse,
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

export async function parseJson(o: {
	weather: WeatherResponse;
	forecastDaily: DailyForecastsResponse;
	forecastText: ForecastTextsResponse;
}): Promise<BomSummary> {
	const { weather, forecastDaily, forecastText } = o;
	const locationName = 'Greenslopes'; // TODO: get from response

	const currentTemp = toSafeTempFloat(weather.obs.temp.dry_bulb_1min_cel);
	const currentFeelsLikeTemp = toSafeTempFloat(weather.obs.temp.apparent_1min_cel);
	const todaysMax = toSafeTempFloat(weather.obs.temp.dry_bulb_max_cel);

	const summary = forecastText.fcst.daily[0].atm.surf_air.weather.precis_text;
	const iconCode = forecastDaily.fcst.daily[0].atm.surf_air.weather.icon_code;
	const humidity = weather.obs.temp.rel_hum_percent.toFixed(1);

	const chanceRain25 = forecastDaily.fcst.daily[0].atm.surf_air.precip.exceeding_25percentchance_total_mm;
	const chanceRain75 = forecastDaily.fcst.daily[0].atm.surf_air.precip.exceeding_75percentchance_total_mm;

	let rainSummary: RainSummary | undefined = undefined;
	if (chanceRain25 != null && chanceRain75 != null) {
		rainSummary = {
			chance25Percent: Math.round(chanceRain25),
			chance75Percent: Math.round(chanceRain75),
		};
	}

	return {
		locationName: locationName,
		currentTemp: currentTemp,
		currentFeelsLikeTemp: currentFeelsLikeTemp,
		todaysMax: todaysMax,
		humidity: humidity,
		summary: summary,
		iconCode: iconCode,
		rain: rainSummary,
	};
}

function toSafeTempFloat(temp: number): string {
	if (!temp) {
		return 'n/a';
	}

	return `${temp.toFixed(1)}°`;
}
