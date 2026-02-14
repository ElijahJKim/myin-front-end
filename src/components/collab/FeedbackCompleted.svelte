<script>
	import Icons from '../Icons.svelte';
	import { t } from '$lib/i18n-helper.ts';
	import { goto } from '$app/navigation';

	let { campaignId } = $props();


    const handleGoDashboard = async () => {
		await goto(`/collab/advertiser/${campaignId}/dashboard`, { invalidateAll: true });
	};
</script>   

<main class="manage-container completed-container">
	<div class="check-mark-container">
		<div class="check-mark-wrapper">
			<Icons name="check_mark" color="#F7F5FF" />
		</div>
	</div>
	<h1 class="completed-title">{t('collab.feedback_complete_title')}</h1>
    <p class="completed-subtitle"><span class="completed-subtitle-icon">!</span>{t('collab.feedback_complete_subtitle')}</p>
	<p class="completed-description">
		{@html t('collab.feedback_complete_description')}
	</p>
	<div class="completed-button-container">
		<button onclick={handleGoDashboard} class="completed-button ">
				{t('collab.feedback_complete_button')}
			</button
		>
	</div>
</main>

<style lang="scss">
	.manage-container {
		@include flex-column-center;
		gap: 20px;
		padding-top: 50px;
	}

	.completed-container {
		.check-mark-container {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 48px;
			height: 48px;
			border-radius: 50%;
			background-color: $primary-200;

			.check-mark-wrapper {
				width: 24px;
				height: 24px;

				:global(svg) {
					width: 100%;
					height: 100%;
				}
			}
		}

		.completed-title {
			@include text-title-1-bold;
			color: $gray-900;
			text-align: center;
		}

        .completed-subtitle{
           @include error-message;
           

           .completed-subtitle-icon{
            @include error-icon;
           }

        }

		.completed-description {
			@include text-body-0-semibold;
			color: $gray-700;
			text-align: center;
            width: 250px;
		}

		.completed-button-container {
			display: flex;
			flex-direction: column;
			gap: 10px;

				.completed-button {
					
						@include main-button('primary');
					
					
				}
			
		}
	}

	@include tablet-up {
		.manage-container {
			padding-top: 100px;
		}

		.completed-container {
			.check-mark-container {
				width: 100px;
				height: 100px;

				.check-mark-wrapper {
					width: 50px;
					height: 50px;
				}
			}

			.completed-title {
				@include text-display-1-extrabold;
				color: $gray-900;
			}

            .completed-subtitle{
                @include text-headline-0-semibold;
            }

			.completed-description {
				@include text-headline-0-semibold;
				color: $gray-700;
				text-align: center;
			}
		}
	}
</style>
