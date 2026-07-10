/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Resvg, type ResvgRenderOptions } from '@cf-wasm/resvg';
import { BomSummary, getBomSummaryJson, parseJson } from './bom';
import { iconData } from './bom/icons';

const textSizeBasedOnLength = (text: string, maxFontSize: number): number => {
	const length = text.length;
	if (length > 60) {
		return maxFontSize * 0.5;
	}

	if (length > 50) {
		return maxFontSize * 0.6;
	}

	if (length > 40) {
		return maxFontSize * 0.7;
	}

	if (length > 30) {
		return maxFontSize * 0.8;
	}

	return maxFontSize;
};

async function rewriteHtml(data: BomSummary, svg: ArrayBuffer, icon: Response): Promise<ArrayBuffer> {
	// 1. Define the transformation logic
	const rewriter = new HTMLRewriter()
		.on('#forecast_summary', {
			element: (element) => {
				const text = data.summary;
				element.setAttribute('font-size', textSizeBasedOnLength(text, 40).toString());
				element.setInnerContent(text);
			},
		})
		.on('#icon_container', {
			element(element) {
				element.setInnerContent(icon, { html: true });
				//element.append(`<text x="50" y="50" font-size="12" fill="black">Hello, World!</text>`, { html: true });
			},
		})
		.on('#forecast_humidity', {
			element(element) {
				element.setInnerContent(data.humidity);
			},
		})
		.on('#temp_max', {
			element(element) {
				element.setInnerContent(data.todaysMax);
			},
		})
		.on('#forecast_rain', {
			element(element) {
				element.setInnerContent(buildRainSummary(data));
			},
		})
		.on('#temp_feels_like', {
			element(element) {
				element.setInnerContent(data.currentFeelsLikeTemp);
			},
		})
		.on('#temp_main', {
			element(element) {
				element.setInnerContent(data.currentTemp);
			},
		});

	// Transform the input
	const response = new Response(svg, { headers: { 'content-type': 'text/html' } });

	const transformedResponse = rewriter.transform(response);
	return await transformedResponse.arrayBuffer();
}

/*

	{
		dc.SetFontFace(fonts.helvetica.small)
		dc.DrawStringAnchored(a.CurrentFeelsLikeTemp, 750, float64(HEIGHT)/2+80, 1, 1)

		w, h := dc.MeasureString(a.CurrentFeelsLikeTemp)
		dc.SetFontFace(fonts.helvetica.extrasmall)
		dc.DrawStringAnchored("Feels like ", 745-w, float64(HEIGHT)/2+80+h, 1, 0)
	}

	if len(a.Summary) > 13 {
		dc.SetFontFace(fonts.helvetica.medium)
		dc.DrawStringAnchored(a.Summary, 750, 430, 1, 0)
	} else {
		dc.SetFontFace(fonts.helvetica.large)
		dc.DrawStringAnchored(a.Summary, 750, 430, 1, 0)
	}

	dc.SetFontFace(fonts.helvetica.medium)
	_, h := dc.MeasureString(a.TodaysMax)
	dc.DrawStringAnchored(a.TodaysMax, 750, 70, 1, 0)

	dc.SetFontFace(fonts.helvetica.extraextrasmall)
	dc.DrawStringAnchored("Max", 750, 70+(h/2), 1, 0)

	dc.SetFontFace(fonts.helvetica.medium)
	_, h = dc.MeasureString(a.Humidity)
	dc.DrawStringAnchored(a.Humidity, 585, 70, 1, 0)

	dc.SetFontFace(fonts.helvetica.extraextrasmall)
	dc.DrawStringAnchored("%", 600, 70, 1, 0)
	dc.DrawStringAnchored("Humidity", 600, 70+(h/2), 1, 0)

	if a.Rain != nil {
		dc.SetFontFace(fonts.helvetica.medium)
		rain := fmt.Sprintf("%d-%d", a.Rain.Chance75Percent, a.Rain.Chance25Percent)
		_, h = dc.MeasureString(rain)
		dc.DrawStringAnchored(rain, 450, 70, 1, 0)

		dc.SetFontFace(fonts.helvetica.extraextrasmall)
		dc.DrawStringAnchored("mm", 475, 70, 1, 0)

		dc.DrawStringAnchored("Rain", 475, 70+(h/2), 1, 0)
	}

	iconCode := a.IconCode
	if iconDefinition, ok := IconDefinitionMap[iconCode]; ok {
		iconImageFile, err := svgicons.Open(fmt.Sprintf("svgimages/%s.svg.png", iconDefinition.DayIconName))
		if err != nil {
			fmt.Println("Failed to open icon image:", err)
		} else {
			iconImage, _, err := image.Decode(iconImageFile)
			if err != nil {
				fmt.Println("Failed to decode icon image:", err)
			} else {
				dc.DrawImage(iconImage, 10, 10)
			}
		}
	}
*/

async function main(o: { svg: ArrayBuffer; fonts: ArrayBuffer[]; getIcon: (iconName: number) => Promise<Response> }) {
	const j = await getBomSummaryJson();
	const p = await parseJson(j);

	const opts: ResvgRenderOptions = {
		background: 'white',
		textRendering: 0, // optimizeSpeed
		shapeRendering: 0, // optimizeSpeed
		imageRendering: 0, // optimizeSpeed

		font: {
			fontBuffers: o.fonts.map((font) => new Uint8Array(font)),
			loadSystemFonts: false,
		},
	};

	const icon = await o.getIcon(p.iconCode);
	const svg = await rewriteHtml(p, o.svg, icon);
	const resvg = new Resvg(new Uint8Array(svg), opts);

	const pngData = resvg.render();
	const pngBuffer = pngData.asPng();

	console.info('Original SVG Size:', `${resvg.width} x ${resvg.height}`);
	console.info('Output PNG Size  :', `${pngData.width} x ${pngData.height}`);
	console.log('file size in MB', pngBuffer.byteLength / 1024 / 1024);

	return pngBuffer;
}

function getIconNameFromCode(iconCode: number): string {
	const iconDefinition = iconData.find((i) => i.code == iconCode);
	if (!iconDefinition) throw new Error(`Icon definition not found for code: ${iconCode}`);

	const hourString = new Intl.DateTimeFormat('en-US', {
		timeZone: 'Australia/Brisbane',
		hour: 'numeric',
		hour12: false,
	}).format(new Date());

	console.log('Brisbane Hour:', hourString);
	console.log('Icon Definition:', iconDefinition.dayIconName);

	const brisbaneHour = parseInt(hourString, 10);
	return brisbaneHour >= 18 ? iconDefinition.nightIconName : iconDefinition.dayIconName;
}

function buildRainSummary(data: BomSummary): string {
	if (!data.rain) {
		return '0';
	}

	const { chance25Percent, chance75Percent } = data.rain;

	if ((chance25Percent || 0) + (chance75Percent || 0) === 0) {
		return '0';
	}

	const summary = `${chance75Percent}-${chance25Percent}`;
	return summary;
}

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		const fontRequest = new Request(new URL('/GoogleSansFlex_120pt-Medium.ttf', request.url), request);
		const svgRequest = new Request(new URL('/optimised_template.svg', request.url), request);

		const fontResponse = await env.ASSETS.fetch(fontRequest);
		const svgResponse = await env.ASSETS.fetch(svgRequest);

		const svg = await svgResponse.arrayBuffer();
		const buf = await fontResponse.arrayBuffer();

		const image = await main({
			svg,
			fonts: [buf],
			getIcon: async (iconCode: number) => {
				const iconName = getIconNameFromCode(iconCode);
				const iconRequest = new Request(new URL(`/icons/${iconName}.svg`, request.url), request);
				const iconResponse = await env.ASSETS.fetch(iconRequest);
				return iconResponse;
			},
		});

		return new Response(image, {
			headers: {
				'Content-Type': 'image/png',
			},
		});
	},
} satisfies ExportedHandler<Env>;
