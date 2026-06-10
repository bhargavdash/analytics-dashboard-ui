import { Button } from "@/components/ui/button"
import axios from "axios"

function App() {

  async function handleClick() {
    const result = await axios.get("http://localhost:8000/health");
    console.log(result);
  }
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button onClick={handleClick}>Click me</Button>
    </div>
  )
}

export default App