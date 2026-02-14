<!-- components/Textarea.svelte -->
<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';

	interface TextareaProps {
		value: string | undefined;
		placeholder: string;
		isError?: boolean;
		disabled?: boolean;
	}

	let {
		value = $bindable(),
		placeholder,
		isError = false,
		disabled = false
	}: TextareaProps = $props();
</script>

<div class="textarea-container">
	<textarea {placeholder} bind:value class={isError ? 'error' : ''} {disabled}></textarea>
	{#if isError}
		<p class="error-message"><span class="error-icon">!</span>{t('campaign.error_required')}</p>
	{/if}
</div>

<style lang="scss">
	textarea {
		@include textarea;
		box-sizing: border-box;
		width: 100%;

		&.error {
			border: 1px solid #ff080c;
		}
	}

	.error-message {
		@include error-message;

		.error-icon {
			@include error-icon;
		}
	}
</style>
