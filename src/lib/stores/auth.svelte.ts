import { auth } from '$lib/firebase/config.ts';
import {
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithPopup,
	signOut,
	type User
} from 'firebase/auth';

const ADMIN_EMAILS = ['myin@myin-biz.com'];

export const authState = $state({
	user: null as User | null,
	isLoading: true,
	isAdmin: false
});

export function initAuth() {
	const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
		if (currentUser) {
			// ✅ 2. 로그인한 사람의 이메일이 명단에 있는지 확인
			if (currentUser.email && ADMIN_EMAILS.includes(currentUser.email)) {
				// 합격! 관리자로 인정
				authState.user = currentUser;
				authState.isAdmin = true;
			} else {
				// 불합격! 로그인 성공했지만 바로 로그아웃 시켜버림
				await signOut(auth);
				alert('접근 권한이 없는 계정입니다.\n관리자에게 문의하세요.');

				authState.user = null;
				authState.isAdmin = false;
			}
		} else {
			authState.user = null;
			authState.isAdmin = false;
		}
		authState.isLoading = false;
	});

	return unsubscribe;
}

export async function loginWithGoogle() {
	const provider = new GoogleAuthProvider();
	try {
		await signInWithPopup(auth, provider);
	} catch (error) {
		console.error('Login failed:', error);
		alert('로그인 실패: ' + (error as Error).message);
	}
}

export async function logout() {
	await signOut(auth);
}
