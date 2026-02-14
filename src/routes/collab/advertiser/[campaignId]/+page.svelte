<script>
	import { _ } from 'svelte-i18n';
	import { t } from '$lib/i18n-helper.ts';
	import Icons from '../../../../components/Icons.svelte';

	let placeholder = $state('캠페인 이름');
	let isEditName = $state(false);

	const handleEditName = (event) => {
		event.stopPropagation();
		isEditName = true;
	};

	const handleSaveName = (event) => {
		event.stopPropagation();
		isEditName = false;
	};

	const handleInput = (e) => {
		placeholder = e.target.value;
	};
</script>

<main class="collab-main-container"></main>

<style lang="scss">
	.collab-main-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh; // 전체 화면 높이 확보
	}

	.collab-top-container {
		display: flex;
		flex-direction: column;
		justify-content: center;

		width: 100%;
		padding-left: 100px;

		background-image: url('/collab-hero-bg.png');
		background-size: cover;
		background-color: $primary-500;

		h2 {
			@include text-body-0-semibold;

			color: $primary-100;
			text-align: left;
		}

		.collab-title-name-container {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			width: fit-content; // 전체 컨테이너가 콘텐츠에 맞게 늘어남
			color: $primary-0;
			cursor: pointer;

			.input-wrapper {
				display: inline-grid; // 그리드를 사용하여 겹치게 배치
				grid-template-columns: min-content;
				align-items: center;
				max-width: 250px;

				.ghost-text {
					@include text-title-2-bold;
					overflow: hidden;
					min-width: 10px;
					padding: 0;
					grid-area: 1 / 1;
					visibility: hidden;
					white-space: nowrap;
				}

				input {
					@include text-title-2-bold;
					overflow: hidden;
					width: 100%;
					max-width: 250px;
					padding: 0;
					border: none;
					outline: none;
					background-color: transparent;
					color: inherit;
					text-overflow: hidden;
					grid-area: 1 / 1; // 가짜 텍스트와 겹침
				}
			}

			.save-name-button {
				@include text-body-0-semibold;
				padding: 8px 12px;
				border: 1px solid $gray-400;
				border-radius: 10px;
				outline: none;
				color: $primary-800;
				cursor: pointer;
			}

			.edit-icon {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 30px;
				height: 30px;
				border-radius: 50%;
				background-color: $primary-300;
				cursor: pointer;
			}
		}

		.collab-title-brand-container {
			display: flex;
			gap: 10px;
			margin-top: 10px;

			.collab-title-brand-name {
				@include text-body-0-semibold;
				width: 100px;
				padding: 8px 12px;
				border-radius: 90px;
				background-color: $primary-0;
				color: $primary-600;
				text-align: center;
			}
		}
	}

	.collab-process-container {
		display: flex;
		flex-direction: column;
		flex: 1;

		.collab-process-step-container {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding: 30px;

			h1 {
				@include text-headline-1-semibold;
				margin-bottom: 20px;
				color: $primary-500;
			}

			ul {
				display: grid;
				grid-template-columns: repeat(2, 130px);
				gap: 10px;

				li {
					padding: 8px 18px;
					border-radius: 90px;
					background-color: $gray-800;
					color: $primary-0;
					text-align: center;
				}
			}
		}

		.collab-process-item-container {
			display: flex;
			flex-direction: column;
			flex: 1;
			width: 100%;
			padding-top: 20px;
			padding-bottom: 20px;
			background-color: $gray-200;

			ul {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				gap: 10px;
				margin-top: 40px;

				li {
					display: flex;
					justify-content: center;
					align-items: center;

					@include text-headline-1-semibold;
					width: 100%;
					max-width: 400px;
					height: 100px;
					border-radius: 15px;
					background-color: $gray-0;
					color: $gray-900;
				}
			}
		}
	}

	@include tablet-up {
		.collab-top-container {
			h2 {
				@include text-heading-1-bold;
			}

			.collab-title-name-container {
				.input-wrapper {
					.ghost-text {
						@include text-display-1-extrabold;
					}

					input {
						@include text-display-1-extrabold;
					}
				}

				.edit-icon {
					width: 40px;
					height: 40px;
				}
			}

			.collab-title-brand-container {
				.collab-title-brand-name {
					@include text-headline-0-semibold;
				}
			}
		}

		.collab-process-container {
			.collab-process-step-container {
				h1 {
					@include text-title-2-bold;
				}

				ul {
					display: flex;
					flex-direction: row;
				}
			}

			.collab-process-item-container {
				ul {
					gap: 30px;

					li {
						max-width: 500px;
						height: 170px;
					}
				}
			}
		}
	}
</style>
