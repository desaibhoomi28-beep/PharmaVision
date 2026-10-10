import Navbar from "../Navbar/Navbar";
import MedicineTable from "./MedicineTable";

function Medicines() {
  return (
    <>
      <Navbar />

      <div className="dashboard">
        <MedicineTable />
      </div>
    </>
  );
}

export default Medicines;