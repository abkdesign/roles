const rules = {
  visitor: {
    static: ["posts:list", "home-page:visit"]
  },
  writer: {
    static: [
      "posts:list",
      "posts:create",
      "users:getSelf",
      "home-page:visit",
      "dashboard-page:visit"
    ],
    dynamic: {
      "posts:edit": ({userId, postOwnerId}) => {
        if (!userId || !postOwnerId) return false;
        return userId === postOwnerId;
      }
    }
  },
  admin: {
    static: [
      "posts:list",
      "posts:create",
      "posts:edit",
      "posts:delete",
      "users:get",
      "users:getSelf",
      "home-page:visit",
      "dashboard-page:visit"
    ]
  }
};

import rules from "lib/config/rbac-rules";
// Returns if a value is an object
export function isString (value) {
  return value && typeof value === 'string' && value.constructor === String ? true : undefined ;
}
export function isArray (value) {
  return value && typeof value === 'object' && value.constructor === Array ? true : undefined ;
}

const check = ({rules, role, actions, data, permAll}) => {
  const permissions = rules[role];
  if (!permissions) {
    // role is not present in the rules
    return false;
  }

  const staticPermissions = permissions['static'];
  if (!isArray(actions) || staticPermissions === undefined) {
    // static rule not provided for action
    
    return false;
  }

  // check if actions exists in permission array
  function anyStaticPermissionsTrue(actions, persmissions, permAll = false){

    const reducedPermissions = persmissions.reduce((initial, currentPermission) => {
      if(currentPermission){
          R.contains(currentPermission, actions)
          ? initial.push(true) : initial.push(false)
      }
      return initial
    }, [])
    const ifContainsTrue = (array) => R.contains(true, array);
    const ifEveryTrue = (array) => array.every(ifTrue);

    if(permAll){

      return ifEveryTrue(reducedPermissions);
    }else{
      
      return ifContainsTrue(reducedPermissions);
    }
  }
  anyStaticPermissionsTrue(actions, staticPermissions, permAll)

  const dynamicPermissions = permissions.dynamic;
  if (dynamicPermissions) {
    const permissionCondition = dynamicPermissions[action[0]];
    if (!permissionCondition) {
      // dynamic rule not provided for action
      return false;
    }

    return permissionCondition(data);
  }
  return false;
};

const Can = props =>
  check(rules, props.role, props.perform, props.data)
    ? props.yes()
    : props.no();

Can.defaultProps = {
  yes: () => null,
  no: () => null
};

export default Can;
