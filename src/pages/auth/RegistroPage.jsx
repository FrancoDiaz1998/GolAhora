import { useState } from 'react'
import { useClientes } from '../../context/ClientesContext';
import { Link, useNavigate } from 'react-router-dom' // <-- Importamos useNavigate
import '../../styles/pages/registro.css'

function RegistroPage() {
    const { crearCliente } = useClientes();
    const navigate = useNavigate(); // <-- Instanciamos el router
    
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false) // <-- Manejo de UI para los 4.3s de espera
    const [generalError, setGeneralError] = useState('');

    const [formData, setFormData] = useState({
        nombre: '', apellido: '', dni: '', username: '', email: '',
        telefono: '', password: '', rol: 'cliente'
    })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({...formData, [name]: value})
    }

    const validateForm = () => {
        const newErrors = {}
        if (formData.nombre.trim().length < 2) { newErrors.nombre = 'Nombre muy corto' }
        if (formData.apellido.trim().length < 2) { newErrors.apellido = 'Apellido muy corto' }
        if (formData.dni.length < 7 || formData.dni.length > 8 || isNaN(formData.dni)) { newErrors.dni = 'DNI inválido' }
        if (formData.telefono.length < 8 || formData.telefono.length > 15) { newErrors.telefono = 'Teléfono inválido' }
        if (formData.username.trim().length < 4 || formData.username.trim().length > 20) {
            newErrors.username = 'El usuario debe tener entre 4 y 20 caracteres'
        }
        if (!formData.email.includes('@') || !formData.email.includes('.')) { newErrors.email = 'Email inválido' }
        if (formData.password.length < 6) { newErrors.password = 'Mínimo 6 caracteres' }
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setLoading(true);
            try {
                const nuevoCliente = {
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    dni: formData.dni,
                    telefono: formData.telefono,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    rol: 'cliente',
                    //fechaRegistro: new Date().toISOString().split('T')[0]
                };

                // 1. Envia los datos al servidor
                const clienteCreado = await crearCliente(nuevoCliente);
                console.log('Cliente creado con éxito:', clienteCreado);

                // El cliente inicia sesión después de completar el registro.
                navigate('/login');

            } catch (error) {
                console.error('Error al registrar cliente:', error);
                setGeneralError('Hubo un error al procesar el registro. Intente nuevamente.');
            } finally {
                setLoading(false);
                }
        }
    };

    return (
        <div className='backgroundLogin'>
            <header>
                <div className="contenedor-header">
                    <Link to="/" className="button-volver">Volver al inicio</Link>
                </div>
            </header>
            <main>
                <section className="contenedor-formulario">
                    <form className="formulario" onSubmit={handleSubmit} noValidate>
                        <h1>Crear cuenta</h1>
                        {generalError && <small className="error-message general-error">{generalError}</small>}

                        {/* NOMBRES Y APELLIDO */}
                        <div className="grupos-elem nom-ape">
                            <label htmlFor="nombre">Nombres:</label>
                            <input type="text" id="nombre" name="nombre" className={errors.nombre ? 'input-error' : ''}
                                value={formData.nombre} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.nombre}</small>

                            <label htmlFor="apellido">Apellido:</label>
                            <input type="text" id="apellido" name="apellido" className={errors.apellido ? 'input-error' : ''}
                                value={formData.apellido} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.apellido}</small>
                        </div>

                        {/* DNI */}
                        <div className="grupos-elem">
                            <label htmlFor="dni">Dni:</label>
                            <input type="text" id="dni" name="dni" className={errors.dni ? 'input-error' : ''}
                                placeholder="Ej: 40255711" value={formData.dni} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.dni}</small>
                        </div>

                        {/* TELEFONO */}
                        <div className="grupos-elem">
                            <label htmlFor="telefono">Teléfono:</label>
                            <input type="text" id="telefono" name="telefono" className={errors.telefono ? 'input-error' : ''}
                                placeholder="+54 11..." value={formData.telefono} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.telefono}</small>
                        </div>

                        {/* USER */}
                        <div className="grupos-elem">
                            <label htmlFor="username">Nombre de Usuario:</label>
                            <input type="text" id="username" name="username" className={errors.username ? 'input-error' : ''}
                                value={formData.username} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.username}</small>
                        </div>

                        {/* EMAIL */}
                        <div className="grupos-elem">
                            <label htmlFor="email">Correo:</label>
                            <input type="email" id="email" name="email" className={errors.email ? 'input-error' : ''}
                                value={formData.email} onChange={handleChange} required disabled={loading}/>
                            <small className="error-message">{errors.email}</small>
                        </div>

                        {/* PASSWORD */}
                        <div className="grupos-elem password-group">
                            <label htmlFor="password">Contraseña</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                                    className={errors.password ? 'input-error' : ''} value={formData.password}
                                    onChange={handleChange} required disabled={loading}/>
                                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <small className="error-message">{errors.password}</small>
                        </div>

                        <div className="grupos-elem enlaces">
                            <Link to="/login" className="link-principal">¿Ya tenés una cuenta?</Link>
                        </div>

                        <div className="grupos-elem button-sub">
                            <button type="submit" className="button-submit" disabled={loading}>
                                {loading ? 'Procesando registro...' : 'Crear cuenta'}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    )
}

export default RegistroPage
