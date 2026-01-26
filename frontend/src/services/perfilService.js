import api from './api';

export const perfilService = {
  getPerfil: async () => await api.get('/perfil'),
  updatePerfil: async (data) => await api.put('/perfil', data),
  getEspecialistasAsignados: async (pacienteId) => await api.get(`/perfil/especialistas/${pacienteId}`)
};
