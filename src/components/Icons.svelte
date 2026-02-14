<script lang="ts">
	import { icons } from '$lib/icons.ts';

	interface IconProps {
		name: keyof typeof icons;
		width?: number | string;
		height?: number | string;
		color?: string;
		[key: string]: any;
	}

	let { name, width, height, color = 'currentColor' }: IconProps = $props();

	let iconData = $derived(icons[name]);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	{width}
	{height}
	viewBox={iconData.viewBox || '0 0 24 24'}
	fill="none"
	stroke-linecap="round"
	stroke-linejoin="round"
	stroke-width="1"
	vector-effect="non-scaling-stroke"
>
	<path d={iconData.path} fill={color} />
</svg>
