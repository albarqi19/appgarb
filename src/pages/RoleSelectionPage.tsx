import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../data/users';
import RoleSelection from '../components/RoleSelection';

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setCurrentRole } = useAppContext();

  // إذا لم يكن هناك مستخدم أو لديه دور واحد فقط، إعادة توجيه
  if (!user || user.roles.length <= 1) {
    navigate('/login');
    return null;
  }

  const handleRoleSelect = (selectedRole: UserRole) => {
    setCurrentRole(selectedRole);
    
    // توجيه المستخدم بناءً على الدور المختار
    let redirectPath = '/';
    
    if (selectedRole === 'teacher') {
      if (user.mosques.length === 1) {
        redirectPath = `/students/${user.mosques[0]}`;
      } else {
        redirectPath = '/mosque-selection';
      }
    } else if (selectedRole === 'parent') {
      redirectPath = '/parent-dashboard';
    } else if (selectedRole === 'student') {
      redirectPath = '/student-dashboard';
    } else if (selectedRole === 'supervisor') {
      redirectPath = '/supervisor-dashboard';
    }

    navigate(redirectPath);
  };

  return (
    <RoleSelection 
      availableRoles={user.roles}
      onRoleSelect={handleRoleSelect}
    />
  );
};

export default RoleSelectionPage;
