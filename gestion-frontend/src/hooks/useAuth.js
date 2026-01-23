import { useContext } from 'react';
import { AuthContext } from '../config/permissions';

export const useAuth = () => useContext(AuthContext);