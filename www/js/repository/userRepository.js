class UserRepository 
{
	constructor() {
		console.log("12312312312")
		
	}

	async register(user) {
		console.log("register")
		let status = await httpRequest(requestType.post, "api/Account/Register", user);
		console.log(status);
		//this.signIn(user);

	}

	async signIn(user) {
		let userLogin = {
			grant_type: 'password',
			username: user.email,
			password: user.password
		}
		console.log(userLogin)
		let loginData = await httpRequest(requestType.post, "Token", userLogin, false);
		localStorage.setItem(tokenKey, loginData.access_token);
        localStorage.setItem(tokenKeyExpirationDate, loginData[".expires"]);
		
	}
}