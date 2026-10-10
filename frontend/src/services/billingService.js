import api from "../api/axios";

export async function getBillingMedicines() {
  const response =
    await api.get("/billing/medicines");

  return response.data || [];
}

export async function getMedicineStock(
  medicineId
) {
  const response =
    await api.get(
      `/billing/stock/${medicineId}`
    );

  return response.data;
}

export async function createSale(
  saleData
) {
  const response =
    await api.post(
      "/billing/sale",
      saleData
    );

  return response.data;
}

export async function getSales() {
  const response =
    await api.get(
      "/billing/sales"
    );

  return response.data || [];
}

export async function getSale(id) {
  const response =
    await api.get(
      `/billing/sales/${id}`
    );

  return response.data;
}