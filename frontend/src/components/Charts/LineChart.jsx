import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

import "./Charts.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const data = {
  labels: ["Jan","Feb","Mar","Apr","May","Jun"],

  datasets:[
    {
      label:"Medicine Demand",

      data:[120,150,180,160,220,260],

      borderColor:"#4DA8DA",

      backgroundColor:"rgba(77,168,218,.2)",

      tension:.4,

      fill:true
    }
  ]
};

const options={

responsive:true,

plugins:{

legend:{

display:false

}

}

};

export default function LineChart(){

return(

<div className="chartCard">

<h3>

📈 AI Demand Forecast

</h3>

<Line

data={data}

options={options}

/>

</div>

);

}