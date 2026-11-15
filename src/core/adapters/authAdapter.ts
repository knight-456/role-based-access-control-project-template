import { RBAC_CONSTANTS } from '../../constants';
import { AuthAdapter, StandardAuthMeData, StandardUser, LoginCredentials } from '../types';

export const defaultAuthAdapter: AuthAdapter = {
  transformLoginPayload: (credentials: LoginCredentials) => {
    return {
      [RBAC_CONSTANTS.auth.EMAIL]: credentials.email,
      password: credentials.password,
      ...(credentials.mobileNumber ? { [RBAC_CONSTANTS.auth.MOBILE_NUMBER]: credentials.mobileNumber } : {}),
    };
  },

  transformLoginResponse: (raw: any) => {
    const dataKey = RBAC_CONSTANTS.api.DATA;
    const successKey = RBAC_CONSTANTS.api.SUCCESS;
    const msgKey = RBAC_CONSTANTS.api.MESSAGE;
    const userContainerKey = RBAC_CONSTANTS.auth.USER_CONTAINER;

    const dataObj = raw?.[dataKey] || raw || {};
    const userObj = dataObj?.[userContainerKey] || dataObj;

    return {
      success: Boolean(raw?.[successKey] ?? true),
      message: raw?.[msgKey] || '',
      token: raw?.token || dataObj?.token || dataObj?.accessToken,
      user: userObj
        ? {
            id: userObj[RBAC_CONSTANTS.auth.USER_ID] || userObj[RBAC_CONSTANTS.auth.EMPLOYEE_USER_ID],
            email: userObj[RBAC_CONSTANTS.auth.EMAIL],
            mobileNumber: userObj[RBAC_CONSTANTS.auth.MOBILE_NUMBER],
          }
        : undefined,
    };
  },

  transformAuthMeResponse: (raw: any): StandardAuthMeData => {
    const dataKey = RBAC_CONSTANTS.api.DATA;
    const authKeys = RBAC_CONSTANTS.auth;

    const root = raw?.[dataKey] || raw || {};
    const rawUser = root[authKeys.USER_CONTAINER] || root;
    const rawRole = rawUser[authKeys.USER_ROLE] || {};

    const user: StandardUser = {
      id: rawUser[authKeys.USER_ID] || rawUser[authKeys.EMPLOYEE_USER_ID] || '',
      email: rawUser[authKeys.EMAIL] || '',
      firstName: rawUser[authKeys.FIRST_NAME] || '',
      lastName: rawUser[authKeys.LAST_NAME] || '',
      fullName:
        `${rawUser[authKeys.FIRST_NAME] || ''} ${rawUser[authKeys.LAST_NAME] || ''}`.trim() ||
        rawUser[authKeys.FULL_NAME] ||
        rawUser[authKeys.EMAIL] ||
        '',
      mobileNumber: rawUser[authKeys.MOBILE_NUMBER],
      entityId: rawUser[authKeys.ENTITY_ID],
      departmentId: rawUser[authKeys.DEPARTMENT_ID],
      role: {
        id: rawRole[authKeys.USER_ROLE_ID] || rawRole[RBAC_CONSTANTS.roles.ROLE_ID] || '',
        name: rawRole[authKeys.USER_ROLE_NAME] || '',
        key: rawRole[authKeys.USER_ROLE_KEY] || '',
      },
    };

    const rawPermissions = root[authKeys.PERMISSIONS_ARRAY] || [];
    const permissions = Array.isArray(rawPermissions)
      ? rawPermissions.map((p: any) => ({
          permissionKey: p[authKeys.PERMISSION_KEY] || p.key || '',
          routePath: p[authKeys.ROUTE_PATH] || p.route || '',
        }))
      : [];

    const rawNav = root[authKeys.NAVIGATION_ARRAY] || root[authKeys.MODULES_ARRAY] || [];
    const mapNav = (item: any): any => ({
      id: item[RBAC_CONSTANTS.permissions.PERMISSION_MASTER_ID] || item.id,
      name: item[RBAC_CONSTANTS.permissions.MODULE_NAME] || item.name,
      slug: item[RBAC_CONSTANTS.permissions.SLUG_NAME] || item.slug,
      routePath: item[RBAC_CONSTANTS.permissions.ROUTE_PATH],
      sortOrder: item[RBAC_CONSTANTS.permissions.SORT_ORDER] || 0,
      parentId: item[RBAC_CONSTANTS.permissions.PARENT_ID] || 0,
      children: Array.isArray(item[RBAC_CONSTANTS.permissions.CHILDREN_ARRAY])
        ? item[RBAC_CONSTANTS.permissions.CHILDREN_ARRAY].map(mapNav)
        : [],
    });

    const navigation = Array.isArray(rawNav) ? rawNav.map(mapNav) : [];

    return { user, permissions, navigation };
  },
};
