import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const ClientesContext = createContext();

const normalizarUsuario = (usuario) => ({
    ...usuario,
    username: usuario.username || usuario.userName,
    userName: usuario.userName || usuario.username,
});

export function ClientesProvider({ children }) {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClientes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiRequest('/clientes');
            setClientes(data.map(normalizarUsuario));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchClientes(); }, [fetchClientes]);

    const crearCliente = async (nuevo) => {
        const creado = await apiRequest('/clientes', { method: 'POST', body: JSON.stringify(nuevo) });
        await fetchClientes();
        return creado;
    };

    const modificarCliente = async (clienteModificado) => {
        const id = clienteModificado.idUsuario ?? clienteModificado.id;
        const actualizado = await apiRequest(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(clienteModificado) });
        await fetchClientes();
        return actualizado;
    };

    const darDeBaja = async (idUsuario) => {
        const actualizado = await apiRequest(`/clientes/${idUsuario}/estado`, { method: 'PATCH' });
        await fetchClientes();
        return actualizado;
    };

    return (
        <ClientesContext.Provider value={{ clientes, loading, error, fetchClientes, crearCliente, modificarCliente, darDeBaja }}>
            {children}
        </ClientesContext.Provider>
    );
}

export function useClientes() {
    const ctx = useContext(ClientesContext);
    if (!ctx) throw new Error('useClientes debe usarse dentro de ClientesProvider');
    return ctx;
}
