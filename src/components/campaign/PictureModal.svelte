<script lang="ts">
	import Icons from '../Icons.svelte';
	import { register } from 'swiper/element/bundle';

	let { selectedInfluencer, isModalOpen = $bindable() } = $props();

	register();
</script>

<div class="modal-container">
	<div class="modal-content">
		<div class="modal-content-header">
			<h1>{selectedInfluencer?.name}</h1>
			<button onclick={() => (isModalOpen = false)}
				><Icons name="close" width="24" height="24" color="currentColor" /></button
			>
		</div>

		<swiper-container class="swiper" slides-per-view="1" speed="500" pagination="true">
			{#if selectedInfluencer?.influencer_profile?.photo_url && selectedInfluencer.influencer_profile.photo_url.length > 0}
				{#each selectedInfluencer.influencer_profile.photo_url as photo}
					<swiper-slide class="swiper-slide-item">
						<img src={photo} alt={`${selectedInfluencer.influencer_profile.name} profile`} />
					</swiper-slide>
				{/each}
			{:else}
				<swiper-slide class="swiper-slide-item">
					<img src="/sample-img.jpg" alt="default profile" />
				</swiper-slide>
			{/if}
		</swiper-container>
	</div>
</div>

<style lang="scss">
	.modal-container {
		position: fixed;
		z-index: 999;
		top: 0;
		left: 0;
		display: flex;
		justify-content: center;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		padding: 20px;
		background: rgb(30 30 31 / 30%);
	}

	.modal-content {
		display: flex;
		flex-direction: column;
		gap: 10px;
		height: fit-content;
		margin-top: 50px;
		padding: 10px;
		border-radius: 12px;
		background-color: $gray-0;

		.modal-content-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			box-sizing: border-box;
			width: 100%;
			padding: 10px 15px;

			h1 {
				@include text-headline-0-semibold;
				color: $gray-800;
			}

			button {
				border: none;
				outline: none;
				background-color: inherit;
				font-weight: 100;
				cursor: pointer;
			}
		}

		.swiper {
			width: 300px;
			height: 380px;

			cursor: pointer;

			--swiper-pagination-bullet-size: 12px;
			--swiper-pagination-bullet-inactive-color: #e9e8eb;
			--swiper-theme-color: #593fd9;
			--swiper-pagination-bottom: 0px;

			.swiper-slide-item {
				height: 400px;
				background-position: center;
				background-size: cover;

				img {
					display: block;
					width: 100%;
					height: 350px;
					object-fit: cover;
					border-radius: 18px;
				}
			}
		}
	}

	@include tablet-up {
		.modal-content {
			.swiper {
				width: 370px;
				height: 430px;

				.swiper-slide-item {
					height: 430px;

					img {
						width: 370px;
						height: 400px;
					}
				}
			}
		}
	}

	@include desktop-up {
		.modal-content {
			.swiper {
				width: 800px;
				height: 500px;

				.swiper-slide-item {
					display: flex;

					justify-content: center;
					align-items: center;
					height: 450px;

					img {
						height: 450px;
					}
				}
			}
		}
	}
</style>
