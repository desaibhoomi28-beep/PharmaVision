import axios from "axios";

const API =
  "http://localhost:5000/api/medicines";


// ==================================================
// GET ALL MEDICINES
// ==================================================

export const getMedicines =
  () => axios.get(API);


// ==================================================
// GET SINGLE MEDICINE
// ==================================================

export const getMedicineById =
  (id) =>
    axios.get(
      `${API}/${id}`
    );


// ==================================================
// ADD MEDICINE
// ==================================================

export const addMedicine =
  (medicine) =>
    axios.post(
      API,
      medicine
    );


// ==================================================
// UPDATE MEDICINE
// ==================================================

export const updateMedicine =
  (id, medicine) =>
    axios.put(
      `${API}/${id}`,
      medicine
    );


// ==================================================
// DELETE MEDICINE
// ==================================================

export const deleteMedicine =
  (id) =>
    axios.delete(
      `${API}/${id}`
    );


// ==================================================
// MEDICINE STATISTICS
// ==================================================

export const getMedicineStats =
  () =>
    axios.get(
      `${API}/stats`
    );