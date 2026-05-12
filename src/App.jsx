import { useState } from 'react'
import './App.css'


function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  return (
    <>
      <div className='m-4 flex flex-col items-center'>

        <div className=' *:m-2 *:border-2 *:rounded-md *:p-2'>
          <input
            className=''
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }} />
          <button
            className=''
            onClick={() => {
              if (input != "") {
                setTasks([...tasks, { title: input, status: false }]);
                setInput("");
              }
            }}
          >Add Task</button>
        </div>

        <div>
          {
            tasks.map((task, index) => {
              console.log(tasks);
              return (
                <div className='flex  gap-2 items-center'>
                  <button className='border-2 px-0.5 m-1 rounded-sm'>Delete</button>
                  <p className='w-48'>{task.title}</p>
                  <div
                    className='p-1.5 hover:bg-gray-100'
                    onClick={() => {
                      const updateTasks = [...tasks];
                      updateTasks[index].status = !updateTasks[index].status;
                      setTasks(updateTasks);
                    }}
                  >
                    <input
                      className='m-1'
                      type="checkbox"
                      checked={task.status}
                    />
                  </div>
                </div>
              )
            }
            )
          }
        </div>
      </div>
    </>
  )
}

export default App
