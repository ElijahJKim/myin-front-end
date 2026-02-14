<script lang="ts">
	import '../styles/global.scss';
	import '$lib/i18n.js';
	import { isLoading } from '../stores/loading.js';
	import Header from '../components/Header.svelte';
	import Loading from '../components/Loading.svelte';
	import { initLanguage } from '$lib/stores/i18n-stores.svelte.ts';
	import { onMount } from 'svelte';
	import { page, navigating } from '$app/stores';

	let { children } = $props();
	let hydrated = $state(false);

	onMount(() => {
		initLanguage();
		hydrated = true;
	});

	// admin 페이지인지 확인
	let isAdminPage = $derived($page.url.pathname.startsWith('/admin'));

	$effect(() => {
        if ($navigating) {
            isLoading.set(true);
        } else {
            isLoading.set(false);
        }
    });
</script>

{#if !hydrated || $isLoading}
    <Loading />
{/if}

{#if hydrated && !$isLoading} 
    {#if isAdminPage}
        {@render children()}
    {:else}
        <div class="layout-wrapper">
            <Header />
            {@render children()}
        </div>
    {/if}
{/if}

<style>
	.loading-screen {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		font-size: 18px;
		color: #666;
	}

	.layout-wrapper {
		box-sizing: border-box;
		max-width: 1400px;
		margin: 0 auto;
	}
</style>
