import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const EmpleadosContext = createContext();

const normalizarUsuario = (usuario) => ({
    ...usuario,
    username: usuario.username || usuario.userName,
    userName: usuario.userName || usuario.username,
});

export function EmpleadosProvider({ children }) {
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEmpleados = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiRequest('/empleados');
            setEmpleados(data.map(normalizarUsuario));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEmpleados(); }, [fetchEmpleados]);

    const crearEmpleado = async (nuevoEmpleado) => {
        const creado = await apiRequest('/empleados', { method: 'POST', body: JSON.stringify(nuevoEmpleado) });
        await fetchEmpleados();
        return creado;
    };

    const modificarEmpleado = async (empleadoModificado) => {
        const id = empleadoModificado.idUsuario ?? empleadoModificado.id;
        const actualizado = await apiRequest(`/empleados/${id}`, { method: 'PUT', body: JSON.stringify(empleadoModificado) });
        await fetchEmpleados();
        return actualizado;
    };

    const darDeBaja = async (idUsuario) => {
        const actualizado = await apiRequest(`/empleados/${idUsuario}/estado`, { method: 'PATCH' });
        await fetchEmpleados();
        return actualizado;
    };

    return (
        <EmpleadosContext.Provider value={{ empleados, loading, error, fetchEmpleados, crearEmpleado, modificarEmpleado, darDeBaja }}>
            {children}
        </EmpleadosContext.Provider>
    );
}

export function useEmpleados() {
    return useContext(EmpleadosContext);
}
