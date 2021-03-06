import api from '@/student/api/content';

export const fetchSyllabus = ({ commit }, programId) => {
  return api.fetchSyllabus(programId).then(res => commit('setSyllabus', res));
};
