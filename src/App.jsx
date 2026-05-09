import { useState } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  return (
    <>
      <input type="text" 
      value={input} 
      onChange={(e) => {
        setInput(e.target.value); 
      }}/>
      <button
        onClick={()=>{
          setTasks([...tasks,{title:input,status:false}])
        }}
      >Add Task</button>

        {
          tasks.map((task) =>{
            console.log(tasks);
            return <p>{task.title}</p>
          }
          )
        }
      
    </>
  )
}

export default App
