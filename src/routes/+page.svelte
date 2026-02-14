<script>
	import { _ } from 'svelte-i18n';
	import { globalState } from '$lib/stores/i18n-stores.svelte.ts';
	import Footer from '../components/Footer.svelte';
	import FAQ from '../components/landing/FAQ.svelte';
	import Hero from '../components/landing/Hero.svelte';
	import ProblemList from '../components/landing/ProblemList.svelte';
	import ProblemSolution from '../components/landing/ProblemSolution.svelte';
	import ServiceIntro from '../components/landing/ServiceIntro.svelte';
	import SolutionFirst from '../components/landing/SolutionFirst.svelte';
	import SolutionSecond from '../components/landing/SolutionSecond.svelte';
	import SolutionThird from '../components/landing/SolutionThird.svelte';
	import StatsBanner from '../components/landing/StatsBanner.svelte';
</script>

<div class="landing-page-container">
	<Hero />
	<ServiceIntro />
	<StatsBanner />
	{#if globalState.messages?.landing?.problem_list && globalState.messages?.landing?.problem_solution}
		{@const problemList = globalState.messages.landing.problem_list}
		{@const problemSolution = globalState.messages.landing.problem_solution}
		<ProblemList problem={problemList[0]} />
		<ProblemSolution problemSolution={problemSolution[0]}>
			<SolutionFirst problemSolution={problemSolution[0]} />
		</ProblemSolution>
		<ProblemList problem={problemList[1]} />
		<ProblemSolution problemSolution={problemSolution[1]}>
			<SolutionSecond problemSolution={problemSolution[1]} />
		</ProblemSolution>
		<ProblemList problem={problemList[2]} />
		<ProblemSolution problemSolution={problemSolution[2]}>
			<SolutionThird problemSolution={problemSolution[2]} />
		</ProblemSolution>
	{/if}
	<FAQ />
	<Footer />
</div>
