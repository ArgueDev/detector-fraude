import api from '../lib/axios';
import { estadisticasSchema } from '../schemas/estadistica.schema';

export async function obtenerEstadisticas() {
    const {data} = await api('/estadisticas/');

    const resultado = estadisticasSchema.safeParse(data);

    if (!resultado.success) {
        console.error(resultado.error)
        throw new Error('Respuesta invalida del servidor')
    }

    return resultado.data;
    
}