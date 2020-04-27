const storage = {}

storage.save = (key, val) => {
	localStorage.setItem(key, JSON.stringify(val))
}

storage.load = (key) => {
	return JSON.parse(localStorage.getItem(key))
}

export default storage