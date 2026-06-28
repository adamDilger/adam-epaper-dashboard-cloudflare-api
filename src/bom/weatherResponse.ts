// WeatherResponse represents the complete BOM weather API response
export type WeatherResponse = {
	stn: Station;
	obs: Observation;
};

// Station contains station information
export type Station = {
	identity: StationIdentity;
	location: StationLocation;
};

// StationIdentity contains station identification details
export type StationIdentity = {
	bom_stn_num: number;
	river_stn_id?: string;
	bom_stn_name: string;
	wmo_stn_id: number;
	wigos_stn_id?: string;
	ht_above_msl: number;
	ht_barometer: number;
};

// StationLocation contains geographical location information
export type StationLocation = {
	lat_dec_deg: number;
	long_dec_deg: number;
	timezone: string;
};

// Observation contains all weather observation data
export type Observation = {
	datetime_utc: string;
	temp: Temperature;
	pres: Pressure;
	wind: Wind;
	precip: Precipitation;
	visibility: Visibility;
	cloud: Cloud;
};

// Temperature contains temperature-related measurements
export type Temperature = {
	dry_bulb_1min_cel: number;
	apparent_1min_cel: number;
	dew_pnt_1min_cel: number;
	wet_bulb_1min_avg_cel: number;
	wet_bulb_globe_sun_cel?: number;
	wet_bulb_globe_shade_cel: number;
	wet_bulb_depression_cel: number;
	dry_bulb_max_cel: number;
	dry_bulb_max_time_utc: string;
	dry_bulb_min_cel: number;
	dry_bulb_min_time_utc: string;
	rel_hum_percent: number;
};

// Pressure contains atmospheric pressure measurements
export type Pressure = {
	stn_lvl_hpa?: number;
	msl_hpa: number;
	qnh_hpa?: number;
};

// Wind contains wind-related measurements
export type Wind = {
	speed_10m_mps: number;
	dirn_10m_ord: string;
	gust_speed_10m_mps: number;
	gust_dirn_10m_deg_t: number;
	gust_speed_10m_max_mps: number;
	gust_10m_max_utc: string;
	run_2m_total_m?: number;
};

// Precipitation contains rainfall measurements
export type Precipitation = {
	since_0900lct_total_mm: number;
	since_0000lct_total_mm: number;
	'24h_0900lct_total_mm': number;
	'10min_total_mm': number;
	'1h_total_mm': number;
	'24h_total_mm'?: number;
};

// Visibility contains visibility measurements
export type Visibility = {
	horiz_m?: number;
};

// Cloud contains cloud-related observations
export type Cloud = {
	base_ht_s1_m?: number;
	base_ht_s2_m?: number;
	base_ht_s3_m?: number;
	base_ht_s4_m?: number;
	base_ht_s5_m?: number;
	total_cover_amt_text?: string;
	low_layer_cover_amt_okta?: number;
	low_layer_height_m?: number;
	med_layer_cover_amt_okta?: number;
	med_layer_height_m?: number;
	high_layer_cover_amt_okta?: number;
	high_layer_height_m?: number;
};
