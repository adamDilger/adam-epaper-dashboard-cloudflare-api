// ForecastTextsResponse represents the complete BOM forecast API response
export type ForecastTextsResponse = {
	meta: Metadata;
	fcst: Forecast;
};

// Metadata contains forecast issue time and timezone information
export type Metadata = {
	issue_time_utc: string;
	issue_time_next_utc: string;
	local_timezone: string;
};

// Forecast contains summary and daily forecast data
export type Forecast = {
	summary: ForecastSummary;
	daily: DailyForecast[];
};

// ForecastSummary contains regional forecast summaries
export type ForecastSummary = {
	region_text: string;
	region_coastal_text?: string;
	sub_region_coastal_text?: string;
	sub_region_text?: string;
	public_district_text?: string;
	seas_text?: string;
	coast_text?: string;
	locality_text?: string;
};

// DailyForecast contains forecast data for a specific day
export type DailyForecast = {
	date_utc: string;
	atm: AtmosphericForecast;
	ocn: OceanForecast;
	terr: TerrestrialForecast;
};

// AtmosphericForecast contains atmospheric conditions forecast
export type AtmosphericForecast = {
	surf_air: SurfaceAirForecast;
};

// SurfaceAirForecast contains surface air conditions
export type SurfaceAirForecast = {
	radiation: RadiationForecast;
	wind: WindForecast;
	weather: WeatherForecast;
	heatwave: HeatwaveForecast;
	tropical_system_situation: TropicalSystemStateForecast;
};

// RadiationForecast contains UV and sun protection advice
export type RadiationForecast = {
	advice_summary: RadiationAdviceSummary;
};

// RadiationAdviceSummary contains sun protection advice for different areas
export type RadiationAdviceSummary = {
	metropolitan_text?: string;
	public_district_text?: string;
	locality_text?: string;
};

// WindForecast contains wind conditions and warnings
export type WindForecast = {
	coastal: WindCoastalForecast;
	warning_summary: WindWarningSummary;
};

// WindCoastalForecast contains coastal wind conditions
export type WindCoastalForecast = {
	coast_text: string;
};

// WindWarningSummary contains wind warnings
export type WindWarningSummary = {
	coast_text?: string;
};

// WeatherForecast contains general weather conditions
export type WeatherForecast = {
	precis_text: string;
	locality_text: string;
	region_text?: string;
	public_district_text?: string;
	metropolitan_text?: string;
	seas_text?: string;
	coast_text?: string;
};

// HeatwaveForecast contains heatwave conditions and warnings
export type HeatwaveForecast = {
	country_text?: string;
	link_map_image?: string;
};

// TropicalSystemStateForecast contains tropical system information
export type TropicalSystemStateForecast = {
	coast_text?: string;
};

// OceanForecast contains ocean and surf conditions
export type OceanForecast = {
	surf_water: SurfaceWaterForecast;
};

// SurfaceWaterForecast contains detailed ocean conditions
export type SurfaceWaterForecast = {
	caution: SurfCautionForecast;
	sea_height_summary: SeaHeightSummary;
	swell_1st_summary: SwellSummary;
	swell_2nd_summary: SwellSummary;
	wave_summary: WaveSummary;
	surf_danger: SurfDangerForecast;
};

// SurfCautionForecast contains surf safety cautions
export type SurfCautionForecast = {
	coast_text?: string;
};

// SeaHeightSummary contains sea height information
export type SeaHeightSummary = {
	coast_text?: string;
};

// SwellSummary contains swell information
export type SwellSummary = {
	coast_text?: string;
};

// WaveSummary contains wave information
export type WaveSummary = {
	coast_text?: string;
};

// SurfDangerForecast contains surf danger information
export type SurfDangerForecast = {
	metropolitan_text?: string;
	public_district_text?: string;
	locality_text?: string;
};

// TerrestrialForecast contains land-based conditions
export type TerrestrialForecast = {
	surf_land: SurfaceLandForecast;
};

// SurfaceLandForecast contains surface land conditions
export type SurfaceLandForecast = {
	fire_danger: FireDangerForecast;
};

// FireDangerForecast contains fire danger ratings and information
export type FireDangerForecast = {
	rating: FireDangerRating;
	metropolitan_text?: string;
	public_district_text?: string;
	locality_text?: string;
	region_text?: string;
};

// FireDangerRating contains fire danger rating codes
export type FireDangerRating = {
	fire_district_code?: string;
	public_district_code?: string;
};
