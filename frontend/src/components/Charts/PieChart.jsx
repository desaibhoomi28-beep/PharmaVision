import {
Chart as ChartJS,
ArcElement,
Tooltip,
Legend
} from "chart.js";

import { Pie } from "react-chartjs-2";

import "./Charts.css";

ChartJS.register(
ArcElement,
Tooltip,
Legend
);

const data={

labels:[

"Tablet",

"Syrup",

"Injection",

"Capsule"

],

datasets:[

{

data:[45,20,18,17],

backgroundColor:[

"#4DA8DA",

"#7CC6EB",

"#A8D8FF",

"#CDEEFF"

]

}

]

};

export default function PieChart(){

return(

<div className="chartCard">

<h3>

🥧 Inventory Categories

</h3>

<Pie data={data}/>

</div>

);

}