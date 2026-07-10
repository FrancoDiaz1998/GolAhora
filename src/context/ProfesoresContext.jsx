import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { normalizarCertificaciones } from '../utils/profesoresCertificacion';
import { apiRequest } from '../services/apiClient';

const ProfesoresContext = createContext();

function normalizarProfesor(profesor) {
    const certificaciones = normalizarCertificaciones(profesor.certificaciones);
    return {
        ...profesor,
        username: profesor.username || profesor.userName,
        userName: profesor.userName || profesor.username,
        certificaciones,
        verificacionCertificacion: Boolean(profesor.verificacionCertificacion) || certificaciones.some(c => c.verificada),
    };
}

export function ProfesoresProvider({ children }) {
    const [profesores, setProfesores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfesores = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiRequest('/profesores');
            setProfesores(data.map(normalizarProfesor));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProfesores(); }, [fetchProfesores]);

    const crearProfesor = async (nuevoProfesor) => {
        const creado = await apiRequest('/profesores', { method: 'POST', body: JSON.stringify(nuevoProfesor) });
        await fetchProfesores();
        return creado;
    };

    const modificarProfesor = async (profesorModificado) => {
        const id = profesorModificado.idUsuario ?? profesorModificado.id;
        const actualizado = await apiRequest(`/profesores/${id}`, { method: 'PUT', body: JSON.stringify(profesorModificado) });
        await fetchProfesores();
        return actualizado;
    };

    const darDeBaja = async (idUsuario) => {
        const actualizado = await apiRequest(`/profesores/${idUsuario}/estado`, { method: 'PATCH' });
        await fetchProfesores();
        return actualizado;
    };

    return (
        <ProfesoresContext.Provider value={{ profesores, loading, error, fetchProfesores, crearProfesor, modificarProfesor, darDeBaja }}>
            {children}
        </ProfesoresContext.Provider>
    );
}

export function useProfesores() {
    return useContext(ProfesoresContext);
}
