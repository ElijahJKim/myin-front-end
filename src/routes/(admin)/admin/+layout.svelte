<script lang="ts">
	import { onMount } from 'svelte';
	import { authState, initAuth, logout, loginWithGoogle } from '$lib/stores/auth.svelte';
	// Login 컴포넌트 import 삭제함

	let { children } = $props();

	onMount(() => {
		const unsubscribe = initAuth();
		return () => unsubscribe();
	});
</script>

{#if authState.isLoading}
	<div class="center-screen">
		<div class="spinner"></div>
	</div>
{:else if !authState.user || !authState.isAdmin}
	<div class="center-screen login-bg">
		<div class="login-box">
			<h1 class="login-title">MYIN Admin</h1>
			<p class="login-desc">관리자 계정으로 접속해주세요.</p>

			<button class="google-btn" onclick={loginWithGoogle}>
				<svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
					<g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
						<path
							fill="#4285F4"
							d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
						/>
						<path
							fill="#34A853"
							d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
						/>
						<path
							fill="#FBBC05"
							d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
						/>
						<path
							fill="#EA4335"
							d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
						/>
					</g>
				</svg>
				Google 계정으로 계속하기
			</button>
		</div>
	</div>
{:else}
	<div class="admin-layout">
		<aside class="sidebar">
			<div class="logo">MYIN Admin</div>
			<nav>
				<a href="/admin/campaigns">캠페인 관리</a>
				<a href="/admin/influencers">인플루언서 관리</a>

				<a href="/admin/matching">매칭 관리</a>
				<a href="/admin/collaborations">협업 관리</a>
			</nav>
			<button class="logout-btn" onclick={logout}>로그아웃</button>
		</aside>

		<main class="content">
			{@render children()}
		</main>
	</div>
{/if}

<style lang="scss">
	/* 공통 중앙 정렬 (로딩 & 로그인용) */
	.center-screen {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	/* 로딩 스피너 */
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #ddd;
		border-top-color: #333;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* 로그인 스타일 (직접 추가) */
	.login-bg {
		background-color: #f3f4f6; /* 연한 회색 배경 */
	}

	.login-box {
		width: 100%;
		max-width: 380px;
		padding: 40px 60px;
		border-radius: 16px;
		box-shadow: 0 10px 15px -3px rgb(0 0 0 / 10%);
		background: white;
		text-align: center;
	}

	.login-title {
		margin-bottom: 8px;
		color: #111;
		font-size: 24px;
		font-weight: bold;
	}

	.login-desc {
		margin-bottom: 32px;
		color: #666;
		font-size: 14px;
	}

	.google-btn {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 12px;
		border: 1px solid #dadce0;
		border-radius: 4px;
		background-color: #fff;
		color: #3c4043;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.google-btn:hover {
		box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
		background-color: #f7f8f8;
	}

	/* 어드민 레이아웃 스타일 (기존 유지) */
	.admin-layout {
		display: flex;
		overflow: hidden;
		height: 100vh;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		width: 200px;
		padding: 16px;
		background: #1e1e2d;
		color: white;
	}

	.logo {
		margin-bottom: 30px;
		font-size: 18px;
		font-weight: bold;
		text-align: center;
	}

	nav {
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: 6px;
	}

	nav a {
		padding: 10px 12px;
		border-radius: 6px;
		color: #a6a6c0;
		font-size: 14px;
		text-decoration: none;
		transition: all 0.2s;
	}

	nav a:hover {
		background: #2b2b40;
		color: white;
	}

	.logout-btn {
		padding: 10px;
		border: none;
		border-radius: 6px;
		background: #ff4757;
		color: white;
		font-size: 14px;
		cursor: pointer;
		transition: background 0.2s;

		&:hover {
			background: #ee3f4f;
		}
	}

	.content {
		flex: 1;
		overflow: hidden;
		height: 100vh;
		background: #f5f6fa;
	}
</style>
