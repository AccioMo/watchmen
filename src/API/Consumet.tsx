import axios from "axios";

const consumetAPI = axios.create({
	baseURL: "https://api.consumet.org/",
	headers: {
		accept: "application/json",
	},
});

export { consumetAPI };