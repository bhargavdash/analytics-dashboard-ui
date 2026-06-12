import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/dashboard/widgets/StatCard"
import { PieChart } from "./components/dashboard/widgets/PieChart"

function App() {

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button>Click Me</Button>
      <PieChart 
        title="Revenue By Region" 
        payload={{
          slices:[
            { name:"NA", value:48, color:"#8884d8" },
            { name:"EU", value:28, color:"#82ca9d" },
            { name:"APAC", value:16, color:"#201b75" },
            { name:"LATAM", value:8,  color:"#2b8b53"  },
          ]
        }}
      />
      <StatCard title="YTD Revenue" payload={{ value:"$3.42M", delta:"+18.4%", up:true,  vs:"vs 2025"  }} />
    </div>
  )
}

export default App