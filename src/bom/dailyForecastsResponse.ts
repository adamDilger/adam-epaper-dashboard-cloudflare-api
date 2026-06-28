// DailyForecastsResponse represents the complete BOM daily forecasts API response
export type DailyForecastsResponse = {
	meta: DailyForecastMetadata;
	fcst: DailyForecastsData;
};

// DailyForecastMetadata contains forecast issue time and timezone information
export type DailyForecastMetadata = {
	issue_time_utc: string;
	issue_time_next_utc: string;
	local_timezone: string;
};

// DailyForecastsData contains the array of daily forecasts
export type DailyForecastsData = {
	daily: DailyForecastEntry[];
};

// DailyForecastEntry represents a single day's forecast data
export type DailyForecastEntry = {
	date_utc: string;
	atm: DailyAtmosphericForecast;
	terr: DailyTerrestrialForecast;
	ocn: DailyOceanForecast;
	astro: DailyAstronomicalForecast;
};

// DailyAtmosphericForecast contains atmospheric forecast data
export type DailyAtmosphericForecast = {
	surf_air: DailySurfaceAirForecast;
};

// DailySurfaceAirForecast contains surface air conditions for the day
export type DailySurfaceAirForecast = {
	temp_max_cel?: number;
	temp_min_cel?: number;
	precip: DailyPrecipitationForecast;
	weather: DailyWeatherForecast;
	radiation: DailyRadiationForecast;
};

// DailyPrecipitationForecast contains detailed precipitation probability data
export type DailyPrecipitationForecast = {
	exceeding_10percentchance_total_mm?: number;
	exceeding_25percentchance_total_mm?: number;
	exceeding_50percentchance_total_mm?: number;
	exceeding_75percentchance_total_mm?: number;
	any_probability_percent?: number;
	any_restofday_probability_percent?: number;
	'10mm_probability_percent'?: number;
	'25mm_probability_percent'?: number;
};

// DailyWeatherForecast contains weather icon information
export type DailyWeatherForecast = {
	icon_code: number;
};

// DailyRadiationForecast contains UV radiation forecast data
export type DailyRadiationForecast = {
	uv_clear_sky_max_code?: number;
	uv_period_start?: string;
	uv_period_end?: string;
};

// DailyTerrestrialForecast contains land-based forecast data
export type DailyTerrestrialForecast = {
	surf_land: DailySurfaceLandForecast;
};

// DailySurfaceLandForecast contains surface land conditions
export type DailySurfaceLandForecast = {
	snow: DailySnowForecast;
};

// DailySnowForecast contains snow-related forecast data (currently empty structure)
export type DailySnowForecast = {
	// Empty struct - no snow data fields in the provided JSON
};

// DailyOceanForecast contains ocean forecast data
export type DailyOceanForecast = {
	surf_water: DailySurfaceWaterForecast;
};

// DailySurfaceWaterForecast contains surface water conditions
export type DailySurfaceWaterForecast = {
	sea: DailySeaForecast;
};

// DailySeaForecast contains sea-related forecast data (currently empty structure)
export type DailySeaForecast = {
	// Empty struct - no sea data fields in the provided JSON
};

// DailyAstronomicalForecast contains astronomical information
export type DailyAstronomicalForecast = {
	sunrise_utc?: string;
	sunset_utc?: string;
};
