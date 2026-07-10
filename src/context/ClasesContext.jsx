import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

export const PROFESORES_DISPONIBLES = [];
export const ALUMNOS_DISPONIBLES = [];

const ClasesContext = createContext(null);

export function ClasesProvider({ children }) {
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClases = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setClases(await apiRequest('/clases'));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchClases(); }, [fetchClases]);

    const crearClase = useCallback(async (datos) => {
        const nueva = await apiRequest('/clases', { method: 'POST', body: JSON.stringify(datos) });
        await fetchClases();
        return nueva;
    }, [fetchClases]);

    const modificarClase = useCallback(async (datos) => {
        const actualizada = await apiRequest(`/clases/${datos.idClase}`, { method: 'PUT', body: JSON.stringify(datos) });
        await fetchClases();
        return actualizada;
    }, [fetchClases]);

    const cancelarClase = useCallback(async (idClase) => {
        const actualizada = await apiRequest(`/clases/${idClase}/cancelar`, { method: 'PUT' });
        await fetchClases();
        return actualizada;
    }, [fetchClases]);

    const eliminarClase = cancelarClase;

    const registrarAsistencia = useCallback(async (idClase, recordAsistencias) => {
        const clase = clases.find(c => c.idClase === idClase);
        const asistencias = Array.isArray(recordAsistencias)
            ? recordAsistencias
            : (clase?.alumnos || []).map(al => ({ id: al.id, presente: Boolean(recordAsistencias[al.id]) }));
        const result = await apiRequest(`/clases/${idClase}/asistencia`, { method: 'POST', body: JSON.stringify(asistencias) });
        await fetchClases();
        return result;
    }, [clases, fetchClases]);

    const inscribirAlumno = useCallback(async (idClase, user) => {
        const userId = user?.idClient || user?.idCliente || user?.idUsuario || user?.id;
        if (!userId) return null;
        const result = await apiRequest(`/clases/${idClase}/agregar-alumno/${userId}`, { method: 'POST' });
        await fetchClases();
        return result;
    }, [fetchClases]);

    const value = {
        clases, loading, error, fetchClases, crearClase, modificarClase,
        cancelarClase, eliminarClase, registrarAsistencia, inscribirAlumno
    };

    return <ClasesContext.Provider value={value}>{children}</ClasesContext.Provider>;
}

export function useClases() {
    const ctx = useContext(ClasesContext);
    if (!ctx) throw new Error('useClases debe usarse dentro de ClasesProvider');
    return ctx;
}
