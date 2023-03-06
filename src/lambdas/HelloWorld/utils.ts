import Boom from '@hapi/boom';
import axios from 'axios';

export const getExampleUserById = async (id: number) => {
	const axiosInstance = axios.create();
	axiosInstance.defaults.baseURL = 'https://reqres.in';
	const user = await axiosInstance
		.get<{
			data: {
				id: number;
				email: string;
				first_name: string;
				last_name: string;
				avatar: string;
			};
		}>(`/api/users/${id}`)
		.then((res) => {
			console.log(res);
			return res.data.data;
		})
		.catch((e) => {
			throw new Boom.Boom(e);
		});
	return user;
};
