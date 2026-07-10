import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const AsistenciasContext = createContext();

export function AsistenciasProvider({ children }) {
    const [asistenciasPorClase, setAsistenciasPorClase] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAsistencias = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setAsistenciasPorClase(await apiRequest('/asistencias'));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAsistencias(); }, [fetchAsistencias]);

    const registrarAsistencia = useCallback(async (idClase, arrayAsistencias) => {
        const result = await apiRequest(`/asistencias/${idClase}`, { method: 'PUT', body: JSON.stringify(arrayAsistencias) });
        await fetchAsistencias();
        return result;
    }, [fetchAsistencias]);

    return (
        <AsistenciasContext.Provider value={{ clases: [], asistenciasPorClase, loading, error, fetchAsistencias, registrarAsistencia, modificarAsistencia: registrarAsistencia }}>
            {children}
        </AsistenciasContext.Provider>
    );
}

export function useAsistencias() { return useContext(AsistenciasContext); }
