import axios from "axios";

const API = "http://localhost:5000/api/suppliers";

export const getSuppliers = () => {
  return axios.get(API);
};

export const getSupplier = (id) => {
  return axios.get(`${API}/${id}`);
};

export const addSupplier = (supplier) => {
  return axios.post(API, supplier);
};

export const updateSupplier = (id, supplier) => {
  return axios.put(`${API}/${id}`, supplier);
};

export const deleteSupplier = (id) => {
  return axios.delete(`${API}/${id}`);
};