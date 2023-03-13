import Boom from '@hapi/boom';
import axios from 'axios';
import { z } from 'zod';

import { responseSchema } from './validation';

// An example axios request to an example api.
export const getExampleUserById = async (
	id: number,
): Promise<z.infer<typeof responseSchema>> => {
	const axiosInstance = axios.create();
	axiosInstance.defaults.baseURL = 'https://reqres.in';

	try {
		const {
			data: { data: unmappedUser },
		} = await axiosInstance.get<{
			data: {
				id: number;
				email: string;
				first_name: string;
				last_name: string;
				avatar: string;
			};
		}>(`/api/users/${id}`);
		return {
			id: unmappedUser.id,
			email: unmappedUser.email,
			firstName: unmappedUser.first_name,
			lastName: unmappedUser.last_name,
			avatarUrl: unmappedUser.avatar,
		};
	} catch (e) {
		if (e instanceof Error) {
			throw Boom.internal(e.message);
		} else throw Boom.internal('Unknown Error');
	}
};
