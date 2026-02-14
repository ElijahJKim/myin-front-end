<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';
	import { setLanguage } from '$lib/stores/i18n-stores.svelte.ts';
	import Icons from './Icons.svelte';

	let isLanguageContainerOpen = $state(false);
	let currentLanguage = $state<string | null>(t('widget.header_button2'));

	let languageList = $state([
		{
			label: '한국어',
			value: 'ko'
		},
		{
			label: 'English',
			value: 'en'
		},
		{
			label: '中文',
			value: 'zh'
		},
		{
			label: 'ภาษาไทย',
			value: 'th'
		},
		{
			label: 'Tiếng Việt',
			value: 'vi'
		}
	]);
</script>

{#snippet languageButton(label: string, value: string)}
	<button
		onclick={() => {
			setLanguage(value);
			currentLanguage = label;
			isLanguageContainerOpen = false;
		}}>{label}</button
	>
{/snippet}

<svelte:head
	><title>Header</title>
	<meta name="description" content="This is where the description goes for SEO" />
</svelte:head>

<header class="header">
	<div class=" col-m-1 col-t-4 col-d-6"><a href="/"><img src="/logo.png" alt="" /></a></div>
	<div class="header-button-container col-m-3 col-t-4 col-d-6">
		<a href="/" class="header-button-item header-button-item-inquiry">
			<button>{t('widget.header_button1')}</button>
		</a>
		<div class="header-language-button-container">
			<button
				class="header-language-button {isLanguageContainerOpen ? 'active' : ''}"
				onclick={() => (isLanguageContainerOpen = !isLanguageContainerOpen)}
				>{currentLanguage}<Icons
					name="arrow_down"
					width="17"
					height="17 "
					color="currentColor"
				/></button
			>
			{#if isLanguageContainerOpen}
				<ul class="header-language-container">
					{#each languageList as language}
						<li>{@render languageButton(language.label, language.value)}</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</header>

<style lang="scss">
	.header {
		display: flex;
		align-items: center;
		padding: 14px 20px;
	}

	.header-button-container {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
	}

	.header-button-item button {
		padding: 8px;
		border: 1px solid $gray-300;
		border-radius: 10px;
		outline: none;
		background-color: inherit;
		font-weight: $fw-medium;
		cursor: pointer;
	}

	.header-button-item-inquiry button {
		display: none;

		@include desktop-up {
			display: block;
		}
	}

	.header-language-wrapper {
		position: relative;
	}

	.header-language-container {
		position: absolute;
		top: 40px;
		right: 5px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 10px;
		width: 120px;

		padding: 20px 0;
		border-radius: 10px;
		background-color: $gray-0;

		li {
			width: 100%;

			button {
				display: block;
				width: 100%;

				border: none;
				outline: none;
				background-color: inherit;
				cursor: pointer;

				@include text-body-0-semibold;
			}
		}
	}

	.header-language-button {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 8px;
		border: 1px solid $gray-300;
		border-radius: 10px;
		outline: none;
		background-color: inherit;
		font-weight: $fw-medium;
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			background-color: $gray-100;
		}
	}

	.header-language-button.active {
		background-color: $gray-100;
	}
</style>
