
// custom hooks and components

import TaskItem from '../components/TaskItem';
import useTasks from '../hooks/useTasks';
import useAuth from '../hooks/useAuth';




function Archives() {

    const { user } = useAuth(); // custom hook created for handling auth

    const {
        tasks,
        dropped,
        page,
        pageCache,
        deleteTask,
        toggleTask,
        handleForward,
        handleBackword
    } = useTasks(user, "archives"); // custom hook created to handle all task related logic


    return (

        <>
            <h1 className="text-lg text-gray-600 mt-0.5 font-bold" >Completed Tasks</h1>
            <div className='m-2'>


                {tasks.map((task) => (
                    <TaskItem

                        task={task}
                        toggleTask={toggleTask}
                        deleteTask={deleteTask}
                        dropped={dropped}
                        key={task.id}
                        collectionName={"archives"}
                    />
                ))}


            </div>
            {pageCache[0] && <div > page {page}</div >}
            <div className='flex gap-3 mt-2'>
                {pageCache[0] && <>

                    {!(pageCache[page - 1]?.firstPage) && <button onClick={handleBackword} className='bg-gray-300 font-bold hover:bg-gray-400 p-2 rounded-md leading-none'>{"<"}</button>}
                    {!(pageCache[page - 1]?.lastPage) && <button onClick={handleForward} className='bg-gray-300 font-bold hover:bg-gray-400 p-2 rounded-md leading-none'>{">"}</button>}

                </>}
            </div >
        </>
    );
}

export default Archives;