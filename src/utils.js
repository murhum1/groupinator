const storage = {}

storage.save = (key, val) => {
	localStorage.setItem(key, JSON.stringify(val))
}

storage.load = (key) => {
	return JSON.parse(localStorage.getItem(key))
}

storage.delete = (key) => {
	return localStorage.removeItem(key);
}

export default storage