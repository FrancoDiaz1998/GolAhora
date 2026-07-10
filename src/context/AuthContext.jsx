import { createContext, useContext, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('gol_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    function persistUser(updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('gol_user', JSON.stringify(updatedUser));
    }

    async function login({ email, password }) {
        try {
            const data = await apiRequest('/Auth/login', {
                method: 'POST',
                body: JSON.stringify({ userName: email, password }),
            });

            const apiUser = data.user;
            const roles = apiUser.roles || [];
            let role = 'Client';
            let rol = 'cliente';

            if (roles.includes('Admin')) {
                role = 'Admin';
                rol = 'admin';
            } else if (roles.includes('Employee')) {
                role = 'Employee';
                rol = 'empleado';
            } else if (roles.includes('Professor')) {
                role = 'Professor';
                rol = 'profesor';
            }

            persistUser({
                id: apiUser.idUser,
                idUsuario: apiUser.idUser,
                nombre: apiUser.name,
                apellido: apiUser.lastName,
                dni: apiUser.dni || apiUser.DNI,
                email: apiUser.email,
                telefono: apiUser.phoneNumber,
                username: apiUser.userName,
                userName: apiUser.userName,
                token: data.token,
                roles,
                role,
                rol,
                estado: apiUser.isActive === false ? 'inactivo' : 'activo',
                activo: apiUser.isActive !== false,
            });

            return { ok: true };
        } catch (err) {
            return { ok: false, error: err.message || 'Credenciales incorrectas.' };
        }
    }

    function logout() {
        setUser(null);
        localStorage.removeItem('gol_user');
    }

    async function updateProfile(data) {
        if (!user?.idUsuario) return { ok: false, error: 'No hay usuario activo.' };
        try {
            const updatedUser = await apiRequest(`/User/${user.idUsuario}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: data.nombre ?? data.name ?? user.nombre,
                    lastName: data.apellido ?? data.lastName ?? user.apellido,
                    DNI: data.dni ?? data.DNI ?? user.dni ?? '',
                    userName: data.username ?? data.userName ?? user.userName,
                    email: data.email ?? user.email,
                    phoneNumber: data.telefono ?? data.phoneNumber ?? user.telefono ?? '',
                }),
            });
            persistUser({ ...user, ...data, ...updatedUser });
            return { ok: true, message: 'Perfil actualizado correctamente.' };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    }

    async function changePassword(data) {
        if (!user?.idUsuario) return { ok: false, error: 'No hay usuario activo.' };
        try {
            const result = await apiRequest(`/usuarios/${user.idUsuario}/password`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            return { ok: true, message: result.message || 'Contrasena actualizada correctamente.' };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    }

    async function deactivateAccount() {
        if (!user?.idUsuario) return { ok: false, error: 'No hay usuario activo.' };
        try {
            await apiRequest(`/User/${user.idUsuario}`, { method: 'DELETE' });
            const updatedUser = { ...user, activo: false, estado: 'inactivo' };
            persistUser(updatedUser);
            return { ok: true, message: 'Cuenta dada de baja.' };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    }

    async function sendSupportMessage(message) {
        try {
            const result = await apiRequest('/soporte', {
                method: 'POST',
                body: JSON.stringify({ mensaje: message, userId: user?.idUsuario, email: user?.email }),
            });
            return { ok: true, message: result.message || 'Mensaje recibido.' };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateProfile, changePassword, deactivateAccount, sendSupportMessage }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}
