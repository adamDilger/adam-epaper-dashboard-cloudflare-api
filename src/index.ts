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
import { getBomSummaryJson, parseJson } from './bom';

const textSizeBasedOnLength = (text: string, maxFontSize: number): number => {
	const length = text.length;
	console.log('text length', length);
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

async function rewriteHtml(svg: ArrayBuffer, icon: Response): Promise<ArrayBuffer> {
	// 1. Define the transformation logic
	const rewriter = new HTMLRewriter()
		.on('#temp_main', { element: (element) => void element.setInnerContent('88.8°') })
		.on('#forecast_summary', {
			element: (element) => {
				const text = 'Partly cloudy.';
				element.setAttribute('font-size', textSizeBasedOnLength(text, 40).toString());
				element.setInnerContent(text);
			},
		})
		.on('#icon_container', {
			element(element) {
				element.setInnerContent(icon, { html: true });
				//element.append(`<text x="50" y="50" font-size="12" fill="black">Hello, World!</text>`, { html: true });
			},
		});
	// Transform the input
	const response = new Response(svg, { headers: { 'content-type': 'text/html' } });

	const transformedResponse = rewriter.transform(response);
	return await transformedResponse.arrayBuffer();
}

async function main(o: { svg: ArrayBuffer; fonts: ArrayBuffer[]; icon: Response }) {
	const j = await getBomSummaryJson();
	const p = await parseJson(j);

	console.log(p);

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

	const svg = new Uint8Array(await rewriteHtml(o.svg, o.icon));

	const resvg = new Resvg(svg, opts);

	const pngData = resvg.render();
	const pngBuffer = pngData.asPng();

	console.info('Original SVG Size:', `${resvg.width} x ${resvg.height}`);
	console.info('Output PNG Size  :', `${pngData.width} x ${pngData.height}`);
	console.log('file size in MB', pngBuffer.byteLength / 1024 / 1024);

	return pngBuffer;
}

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		const fontRequest = new Request(new URL('/GoogleSansFlex_120pt-Medium.ttf', request.url), request);
		const svgRequest = new Request(new URL('/optimised_template.svg', request.url), request);

		const fontResponse = await env.ASSETS.fetch(fontRequest);
		const svgResponse = await env.ASSETS.fetch(svgRequest);

		const icon = new Request(new URL('/icons/fog.svg', request.url), request);
		const iconResponse = await env.ASSETS.fetch(icon);

		const svg = await svgResponse.arrayBuffer();
		const buf = await fontResponse.arrayBuffer();

		const image = await main({
			svg,
			fonts: [buf],
			icon: iconResponse,
		});

		return new Response(image, {
			headers: {
				'Content-Type': 'image/png',
			},
		});
	},
} satisfies ExportedHandler<Env>;
