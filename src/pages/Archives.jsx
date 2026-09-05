
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
        pageBoundaries,
        deleteTask,
        toggleTask,
        setPageBoundaries,
        setPage
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
            {(page !== 1 || page !== pageBoundaries.lastPage) && <div>page {page}</div>}
            <div className='flex gap-3 mt-2'>

                {page !== 1 && <button onClick={() => {
                    setPage(prev => prev - 1);
                    setPageBoundaries(prev => ({ ...prev, last: null }))
                }} className='bg-gray-300 font-bold hover:bg-gray-400 p-2 rounded-md leading-none'>{"<"}</button>}
                {page !== pageBoundaries.lastPage && <button onClick={() => {
                    setPageBoundaries(prev => ({ ...prev, first: null }))
                    setPage(prev => prev + 1);
                }} className='bg-gray-300 font-bold hover:bg-gray-400 p-2 rounded-md leading-none'>{">"}</button>}
            </div >
        </>
    );
}

export default Archives;