import { useState } from 'react'
import './App.css'


function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  function addTask() {
    if(input.trim() !== ""){
      setTasks([...tasks, { title: input, status: false }]);
      // ... --> it is called spread oprator, works just as it looks
      setInput("");
    }
  }
  function deleteTask(index) {
    setTasks(tasks.filter((task,i) => (i!==index)));
    // react prefers creating new arrays instead of modifiying old ones for state change
    // filter creates new array
  }
  return (
    <>
      <div className='m-4 flex flex-col items-center'>
        {/* made the div into form and moved add task logic to onsubmit, so that pressing enter also creates the task in todo list */}
        <form onSubmit={(e) => {
              e.preventDefault();
              addTask();
            }} className=' *:m-2 *:border-2 *:rounded-md *:p-2'>
          <input
            className=''
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }} />
          <button
            className=''
            type='submit' //so the onSubmit code runs when this button pressed
          >Add Task</button>
        </form>

        <div>
          {
            tasks.map((task, index) => {
              return (
                <div className='flex  gap-2 items-center' key={index}>
                  <button 
                    className='border-2 px-0.5 m-1 rounded-sm hover:bg-red-200' 
                    onClick={() => deleteTask(index)}
                    // in react event handlers we need to pass a arrow func and call our func itside it because calling 
                    // our func directly will execute it immediately when component renders
                  >Delete</button>
                  <p className='w-48'>{task.title}</p>
                  {/* added fixed width to move all checkboxes to the end */}
                  <label
                    className='p-1.5 hover:bg-gray-100 rounded-sm'
                    // using label so that clicking on the lable also triggers click for the checkbox, because thats what lables are for
                  >
                    <input
                      className='m-1'
                      type="checkbox"
                      checked={task.status}
                      // instead of onclick onChange is recommended for checkboxes
                      onChange={() => {
                        const updateTasks = [...tasks];
                        updateTasks[index].status = !updateTasks[index].status;
                        setTasks(updateTasks);
                    }}
                    />
                  </label>
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
