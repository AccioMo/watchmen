import axios from "axios";

const consumetAPI = axios.create({
	baseURL: "http://consumet:4000/",
	headers: {
		accept: "application/json",
	},
});

export { consumetAPI };