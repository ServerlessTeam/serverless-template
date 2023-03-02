import { House } from '@/dbData/Houses';
import { SharedHouse, SharedHousePermissionsKeys } from '@/dbData/SharedHouses';
import { CustomerHasNoPermissionError, DeviceIsNotAttachedError } from '@/utils/boom';
import { getCustomerHousePermissions, getDeviceInfo } from '@/utils/mobileApi';

export async function checkCanUserAccessDevice(
	customerId: SharedHouse['customerSharedWithId'],
	deviceId: string,
	permissionKey: SharedHousePermissionsKeys,
	deniedMessage: string,
): Promise<
	| {
			customerHouseRelation: 'owner';
			hasRoomAccess?: true | undefined;
			house: House;
	  }
	| {
			customerHouseRelation: 'shared';
			hasRoomAccess?: boolean | undefined;
			house: House;
			sharedHouse: SharedHouse;
	  }
> {
	const {
		device: { houseId, roomId },
	} = await getDeviceInfo(deviceId);

	if (!houseId) {
		throw new DeviceIsNotAttachedError(`Device ${deviceId} is not placed anywhere`, {
			data: { deviceId },
		});
	}

	const customerHousePermissions = await getCustomerHousePermissions({
		customerId,
		houseId,
		roomId,
	});

	const hasPermission =
		customerHousePermissions.customerHouseRelation === 'owner' ||
		(customerHousePermissions.customerHouseRelation === 'shared' &&
			customerHousePermissions.sharedHouse[permissionKey]);

	// TODO: add handling for room permissions

	if (!hasPermission) {
		throw new CustomerHasNoPermissionError(deniedMessage, {
			data: {
				customerId,
				houseId,
				permission: permissionKey,
			},
		});
	}

	return customerHousePermissions;
}
