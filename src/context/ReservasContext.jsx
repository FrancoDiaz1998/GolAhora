import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const ReservasContext = createContext();

export function ReservasProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setItems(await apiRequest('/reservas'));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const crearItem = useCallback(async (nuevaReserva) => {
        const creada = await apiRequest('/reservas', { method: 'POST', body: JSON.stringify(nuevaReserva) });
        await fetchItems();
        return creada;
    }, [fetchItems]);

    const modificarItem = useCallback(async (id, reservaActualizada) => {
        const actualizada = await apiRequest(`/reservas/${id}`, { method: 'PUT', body: JSON.stringify(reservaActualizada) });
        await fetchItems();
        return actualizada;
    }, [fetchItems]);

    const eliminarItem = useCallback(async (id) => {
        await apiRequest(`/reservas/${id}`, { method: 'DELETE' });
        await fetchItems();
    }, [fetchItems]);

    const confirmarReserva = useCallback(async (reservaOrId, datosPago = {}) => {
        const id = typeof reservaOrId === 'object' ? reservaOrId.idReserva : reservaOrId;
        const actualizada = await apiRequest(`/reservas/${id}/confirmar`, { method: 'PUT', body: JSON.stringify(datosPago) });
        await fetchItems();
        return actualizada;
    }, [fetchItems]);

    const cancelarReserva = useCallback(async (reservaOrId) => {
        const id = typeof reservaOrId === 'object' ? reservaOrId.idReserva : reservaOrId;
        const actualizada = await apiRequest(`/reservas/${id}/cancelar`, { method: 'PUT' });
        await fetchItems();
        return actualizada;
    }, [fetchItems]);

    return (
        <ReservasContext.Provider value={{
            items,
            reservas: items,
            loading,
            error,
            fetchItems,
            fetchReservas: fetchItems,
            crearItem,
            crearReserva: crearItem,
            modificarItem,
            modificarReserva: modificarItem,
            eliminarItem,
            eliminarReserva: eliminarItem,
            confirmarReserva,
            cancelarReserva,
            resetearDatos: fetchItems
        }}>
            {children}
        </ReservasContext.Provider>
    );
}

export function useReservas() {
    const context = useContext(ReservasContext);
    if (!context) throw new Error('useReservas debe ser utilizado dentro de ReservasProvider');
    return context;
}
