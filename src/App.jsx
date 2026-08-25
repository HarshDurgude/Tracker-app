import { useState } from 'react'
import React from 'react'
import { useRef } from "react";
import './App.css'



// dnd imports
import {
  SortableContext,
  arrayMove
} from "@dnd-kit/sortable";
import {
  DndContext,
} from "@dnd-kit/core";

// custom hooks and components
import Login from "./components/Login";
import TaskItem from './components/TaskItem';
import useTasks from './hooks/useTasks';
import useAuth from './hooks/useAuth';
import { log } from 'firebase/firestore/pipelines';

function App() {




  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [input, setInput] = useState(""); // this runs at every render of App but only sets value to "" at the first render other times it uses the state
  // and also hooks should run in same order every render, so conditional hooks create problems

  const inputRef = useRef(null);
  // here, useRef lets you directly access a DOM element from your JavaScript code using inputRef.current


  const { user, loading, logout } = useAuth(); // custom hook created for handling auth

  const {
    tasks,
    dropped,
    syncing,
    addTask,
    deleteTask,
    toggleTask,
    handleDragEnd,
    handleDragStart
  } = useTasks(user); // custom hook created to handle all task related logic

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }


  return (
    <>
      <div className='m-4 flex flex-col  items-center'>

        <div className='flex justify-between w-80 ' >
          <div className='text-xl font-bold leading-none py-2'
          >Today's Tasks</div>
          <div>
            <button className='bg-blue-300 border-2 hover:bg-blue-400 rounded-sm px-1 py-0.5 m-1 text-sm'
            >Archives</button>
            <button onClick={logout} className='bg-gray-300 border-2 hover:bg-red-300 rounded-sm px-1 py-0.5 m-1 text-sm'
            >Logout</button>
          </div>
        </div>

        {/* made the div into form and moved add task logic to onsubmit, so that pressing enter also creates the task in todo list */}
        <form // made the callback function async because needed to use await here
          onSubmit={async (e) => {
            e.preventDefault(); // to prevent browser from refreshing and prevent other random behavior on form submit
            let taskAdded = await addTask(input);
            if (!taskAdded.success && taskAdded.message === "Duplicate task") {// if add task failed due to duplicate
              setShowDuplicateModal(true);
              inputRef.current?.blur();
            } else {
              setInput(""); // clearing input field after adding new input
            }
          }}

          className='flex gap-1  *:border-2 *:rounded-md *:py-2 *:px-4' // *: -> used to apply tailwind property to all direct childs
        >
          <input
            ref={inputRef} // pointing the created useRef variable to this dom element
            className='w-64' // approx width based on what looks good
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }} />
          <button
            className='px-'
            type='submit' //so the onSubmit code runs when this button pressed
          >Add </button>
        </form>

        <span className='text-xs' // syncing... text
        >{syncing ? "syncing..." : ""}</span>

        <div className='m-2'>
          <DndContext // defines the context of drag an drop area

            onDragStart={() => { handleDragStart() }}
            onDragEnd={(event) => { handleDragEnd(event) }}
          >

            <SortableContext // defines the items which will be used for drag and drop
              items={tasks.map(task => task.id)}
            >

              {tasks.map((task) => (
                <TaskItem
                  task={task}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  dropped={dropped}
                  key={task.id}
                />
              ))}

            </SortableContext>



          </DndContext>
        </div>

      </div>



      {/* this is a pop up code it will show pop up based on the state */}
      {/* this expression is evaluated based on how truthy and falsy value expression work in js*/}
      {showDuplicateModal && ( // fixed inset-0 -> creates the dark bg for the popup 
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">

          <div className='flex flex-col gap-2 w-72  bg-white rounded-xl p-6 relative'>
            <h2 className='leading-none text-xl font-bold'>Duplicate Task</h2>
            <p>This task is already added and duplicate tasks are not allowed!</p>
            <button onClick={() => { setShowDuplicateModal(false); inputRef.current?.focus(); }} className='leading-none p-1 bg-gray-200 hover:bg-gray-300 rounded-md absolute  top-3 right-3'>X</button>
            <button onClick={() => { setShowDuplicateModal(false); inputRef.current?.focus(); }} className='p-1.5 rounded-md bg-blue-400 hover:bg-blue-500'>Okay</button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
