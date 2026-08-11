import { ref } from 'vue'

const TOKEN_KEY = 'tku-auth-token'
const token = ref(localStorage.getItem(TOKEN_KEY) || '')
const isLoggedIn = ref(!!token.value)

export function useAuth() {
	async function login(password: string): Promise<boolean> {
		try {
			const res = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			})
			const data = await res.json()
			if (data.ok) {
				token.value = data.token
				isLoggedIn.value = true
				localStorage.setItem(TOKEN_KEY, data.token)
				return true
			}
			return false
		} catch {
			return false
		}
	}

	function logout() {
		token.value = ''
		isLoggedIn.value = false
		localStorage.removeItem(TOKEN_KEY)
	}

	return { token, isLoggedIn, login, logout }
}
