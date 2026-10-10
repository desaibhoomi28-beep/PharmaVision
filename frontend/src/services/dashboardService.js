const API_URL =
  "http://localhost:5000/api/dashboard";


export const getDashboardData =
  async () => {

    const response =
      await fetch(
        API_URL
      );


    const data =
      await response.json();


    if (!response.ok) {
      throw new Error(
        data.message ||
        "Unable to load dashboard"
      );
    }


    return data;
  };