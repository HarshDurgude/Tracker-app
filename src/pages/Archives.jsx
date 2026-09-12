
// custom hooks and components

import { useEffect, useState } from 'react';

import TaskItem from '../components/TaskItem';
import useTasks from '../hooks/useTasks';
import useAuth from '../hooks/useAuth';
import useLoading from '../hooks/useLoading';




function Archives() {

    const { user } = useAuth(); // custom hook created for handling auth


    const [page, setPage] = useState(1);
    const [pageCache, setPageCache] = useState([]);

    const {
        tasks,
        setTasks,
        deleteTask,
        toggleTask,
    } = useTasks(user, "archives"); // custom hook created to handle all task related logic

    const { lazyLoadArchives } = useLoading(user);


    useEffect(() => {
        lazyLoadArchives(pageCache, page, setTasks, setPageCache);
    }, [user, page]);

    useEffect(() => {
        setPageCache(prev => {
            console.log("updating cache");

            return prev.map((p, i) => {
                if (i === page - 1) {
                    return { ...p, tasks: tasks }
                } else { return p }
            })
        })
    }, [tasks]);


    return (

        <>
            <h1 className="text-lg text-gray-600 mt-0.5 font-bold" >Completed Tasks</h1>
            <div className='m-2'>


                {tasks.map((task) => (
                    <TaskItem

                        task={task}
                        toggleTask={toggleTask}
                        deleteTask={deleteTask}
                        // dropped={dropped}
                        key={task.id}
                        collectionName={"archives"}
                    />
                ))}


            </div>
            {(!(page - 1 === 0) || !(pageCache[page - 1]?.isLastPage)) && <div > page {page}</div >}
            <div className='flex gap-3 mt-2'>
                {/* {pageCache[0] && <> */}

                {!(page - 1 === 0) && <button onClick={() => setPage((prev) => prev - 1)} className='bg-gray-300 font-bold hover:bg-gray-400 p-2 rounded-md leading-none'>{"<"}</button>}
                {!(pageCache[page - 1]?.isLastPage) && <button onClick={() => setPage((prev) => prev + 1)} className='bg-gray-300 font-bold hover:bg-gray-400 p-2 rounded-md leading-none'>{">"}</button>}

                {/* </>} */}
            </div >
        </>
    );
}

export default Archives;