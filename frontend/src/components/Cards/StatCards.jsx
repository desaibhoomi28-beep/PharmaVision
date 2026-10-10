import "./StatCards.css";
import { FaCapsules, FaExclamationTriangle, FaTruck, FaRobot } from "react-icons/fa";

const cardData = [
  {
    title: "Total Medicines",
    value: "520",
    change: "+12%",
    icon: <FaCapsules />,
    color: "#4DA8DA"
  },
  {
    title: "Low Stock",
    value: "15",
    change: "-3%",
    icon: <FaExclamationTriangle />,
    color: "#F59E0B"
  },
  {
    title: "Suppliers",
    value: "22",
    change: "+5%",
    icon: <FaTruck />,
    color: "#22C55E"
  },
  {
    title: "AI Accuracy",
    value: "95%",
    change: "+2%",
    icon: <FaRobot />,
    color: "#8B5CF6"
  }
];

export default function StatCards() {
  return (
    <div className="cards">

      {cardData.map((card, index) => (

        <div className="card" key={index}>

          <div
            className="iconBox"
            style={{ background: card.color }}
          >
            {card.icon}
          </div>

          <div className="info">

            <h4>{card.title}</h4>

            <h2>{card.value}</h2>

            <p>{card.change} this month</p>

          </div>

        </div>

      ))}

    </div>
  );
}