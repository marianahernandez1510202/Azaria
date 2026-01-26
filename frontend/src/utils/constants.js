export const ROLES = {
  ADMIN: 'administrador',
  ESPECIALISTA: 'especialista',
  PACIENTE: 'paciente'
};

export const FASES = {
  PREOPERATORIA: 1,
  POSTOPERATORIA: 2,
  PREPROTESICA: 3,
  PROTESICA: 4
};

export const ESPECIALIDADES = {
  NUTRICION: 'nutricion',
  MEDICINA: 'medicina',
  FISIOTERAPIA: 'fisioterapia',
  NEUROPSICOLOGIA: 'neuropsicologia',
  ORTESIS: 'ortesis'
};

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
