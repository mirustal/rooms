import { useState, useEffect } from 'react';
import { getVkUserId } from '../../../../bridge/bridgeLib';

const useAdminStatus = (roomInfo) => {
  const [userIsAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const isAdminInRoom = async () => {
      let user_id = await getVkUserId(); 
      if (roomInfo) {
        let findMember = roomInfo.members.find(member => member.id === user_id);
        return findMember && findMember.role === "admin";
      }
      return false;
    };

    isAdminInRoom().then(setIsAdmin);
  }, [roomInfo]);

  return userIsAdmin;
};

export default useAdminStatus;