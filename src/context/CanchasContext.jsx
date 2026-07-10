import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const CanchasContext = createContext();

const normalizarCancha = (c) => ({
    ...c,
    id: c.id ?? c.idCancha,
    idCancha: c.idCancha ?? c.id,
    idTipo: c.idTipo ?? c.tipoCanchaId,
    tipoCanchaId: c.tipoCanchaId ?? c.idTipo,
    estado: c.estado || (c.activa === false ? 'inactiva' : 'activa'),
    activa: c.activa !== false && c.estado !== 'inactiva',
});

const normalizarDisp = (d) => ({
    ...d,
    id: d.id ?? d.idDisponibility,
    idCancha: Number(d.idCancha ?? d.canchaId ?? d.courtId),
    canchaId: Number(d.canchaId ?? d.idCancha ?? d.courtId),
    horaInicio: Number(d.horaInicio),
    horaFin: Number(d.horaFin),
    disponible: d.disponible !== false,
});

export function CanchasProvider({ children }) {
    const [canchas, setCanchas] = useState([]);
    const [tiposCanchas, setTiposCanchas] = useState([]);
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [canchasData, tiposData, dispsData] = await Promise.all([
                apiRequest('/canchas'),
                apiRequest('/tipos-canchas'),
                apiRequest('/disponibilidades'),
            ]);
            setCanchas(canchasData.map(normalizarCancha));
            setTiposCanchas(tiposData);
            setDisponibilidades(dispsData.map(normalizarDisp));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const crearCancha = async (cancha) => {
        const creada = await apiRequest('/canchas', { method: 'POST', body: JSON.stringify(cancha) });
        await fetchAll();
        return creada;
    };

    const modificarCancha = async (id, cancha) => {
        if (typeof id === 'object') {
            cancha = id;
            id = cancha.id ?? cancha.idCancha;
        }
        const actualizada = await apiRequest(`/canchas/${id}`, { method: 'PUT', body: JSON.stringify(cancha) });
        await fetchAll();
        return actualizada;
    };

    const toggleEstadoCancha = async (id) => {
        if (typeof id === 'object') id = id.id ?? id.idCancha;
        const actualizada = await apiRequest(`/canchas/${id}`, { method: 'DELETE' });
        await fetchAll();
        return actualizada;
    };

    const crearTipo = async (tipo) => {
        const creado = await apiRequest('/tipos-canchas', { method: 'POST', body: JSON.stringify(tipo) });
        await fetchAll();
        return creado;
    };

    const modificarTipo = async (id, tipo) => {
        if (typeof id === 'object') {
            tipo = id;
            id = tipo.id;
        }
        const actualizado = await apiRequest(`/tipos-canchas/${id}`, { method: 'PUT', body: JSON.stringify(tipo) });
        await fetchAll();
        return actualizado;
    };

    const eliminarTipo = async (id) => {
        await apiRequest(`/tipos-canchas/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    const crearDisp = async (disp) => {
        const creada = await apiRequest('/disponibilidades', { method: 'POST', body: JSON.stringify(disp) });
        await fetchAll();
        return creada;
    };

    const modificarDisp = async (id, disp) => {
        if (typeof id === 'object') {
            disp = id;
            id = disp.id;
        }
        const actualizada = await apiRequest(`/disponibilidades/${id}`, { method: 'PUT', body: JSON.stringify(disp) });
        await fetchAll();
        return actualizada;
    };

    const toggleDisp = async (id) => {
        const disp = disponibilidades.find(d => d.id === id);
        if (!disp) return null;
        return modificarDisp(id, { ...disp, disponible: !disp.disponible });
    };

    const eliminarDisp = async (id) => {
        await apiRequest(`/disponibilidades/${id}`, { method: 'DELETE' });
        await fetchAll();
    };

    return (
        <CanchasContext.Provider value={{
            canchas, tiposCanchas, disponibilidades, loading, error, fetchAll,
            crearCancha, modificarCancha, toggleEstadoCancha,
            crearTipo, modificarTipo, eliminarTipo,
            crearDisp, modificarDisp, toggleDisp, eliminarDisp
        }}>
            {children}
        </CanchasContext.Provider>
    );
}

export function useCanchas() { return useContext(CanchasContext); }
