import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const RecibosContext = createContext();

export function RecibosProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setItems(await apiRequest('/recibos'));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const crearItem = async (nuevo) => {
        const creado = await apiRequest('/recibos', { method: 'POST', body: JSON.stringify(nuevo) });
        await fetchItems();
        return creado;
    };

    const modificarItem = async (modificado) => {
        const actualizado = await apiRequest(`/recibos/${modificado.idRecibo}`, { method: 'PUT', body: JSON.stringify(modificado) });
        await fetchItems();
        return actualizado;
    };

    const eliminarItem = async (id) => {
        await apiRequest(`/recibos/${id}`, { method: 'DELETE' });
        await fetchItems();
    };

    return (
        <RecibosContext.Provider value={{ items, loading, error, fetchItems, crearItem, modificarItem, eliminarItem }}>
            {children}
        </RecibosContext.Provider>
    );
}

export function useRecibos() { return useContext(RecibosContext); }
