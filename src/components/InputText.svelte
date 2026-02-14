<script lang="ts">
	import { t } from '$lib/i18n-helper.ts';

	interface InputTextProps {
		value: string | undefined;
		placeholder?: string;
		isError?: boolean;
		errorMessage?: string;
		disabled?: boolean;
		onInput?: (event: Event) => void;
		onBlur?: (event: FocusEvent) => void;
	}

	let {
		value = $bindable(),
		placeholder,
		isError = true,
		errorMessage,
		onInput,
		onBlur,
		disabled = false
	}: InputTextProps = $props();

	const displayErrorMessage = $derived(errorMessage || t('campaign.error_required'));
</script>

<div class="input-text-container">
	<input
		type="text"
		{placeholder}
		bind:value
		on:input={onInput}
		on:blur={onBlur}
		class={isError ? 'error' : ''}
		{disabled}
	/>
	{#if isError}
		<p class="error-message"><span class="error-icon">!</span>{displayErrorMessage}</p>
	{/if}
</div>

<style lang="scss">
	input[type='text'] {
		@include input-filed;
		box-sizing: border-box;
		width: 100%;
		margin-bottom: 5px;
		padding: 0 20px;

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
