
// custom hooks and components

import { useEffect } from 'react';

import TaskItem from '../components/TaskItem';
import useTasks from '../hooks/useTasks';
import useAuth from '../hooks/useAuth';
import useLazyLoad from '../hooks/useLazyLoad';

// dnd imports
import {
    SortableContext
} from "@dnd-kit/sortable";
import {
    DndContext, MeasuringStrategy
} from "@dnd-kit/core";



function Archives() {

    const { user } = useAuth(); // custom hook created for handling auth

    const { tasks, setTasks, deleteTask, toggleTask, } = useTasks(user, "archives"); // custom hook created to handle all task related logic

    const { fetching, pageCache, page, setPage, lazyLoadPage } = useLazyLoad(user, tasks, setTasks);

    const measuringConfig = {
        droppable: {
            strategy: MeasuringStrategy.Always,
        },
    };

    useEffect(() => {
        if (!user) return;

        lazyLoadPage();
    }, [user, page]);


    return (
        <>

            <h1 className="text-lg text-gray-600 mt-0.5 font-bold" >Completed Tasks</h1>

            {fetching ?
                (
                    <div className="min-h-screen flex flex-col items-center mt-10">
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    </div>
                ) :
                (<>
                    <div className='m-2'>

                        {/* dndkit used for delete and toggle animations */}

                        <DndContext // defines the context of drag an drop area
                            measuring={measuringConfig} // for bringing back good animations by a workaround
                        >

                            <SortableContext // defines the items which will be used for drag and drop
                                items={tasks.map(task => task.id)}
                                className='flex'
                            >

                                {tasks.map((task) => (
                                    <TaskItem
                                        task={task}
                                        toggleTask={toggleTask}
                                        deleteTask={deleteTask}
                                        key={task.id}
                                        collectionName={"archives"}

                                    />
                                ))}

                            </SortableContext>

                        </DndContext>


                    </div>
                    {(!(page - 1 === 0) || !(pageCache[page - 1]?.isLastPage)) && <div > page {page}</div >}
                    <div className='flex gap-3 mt-2'>
                        {/* {pageCache[0] && <> */}

                        {!(page - 1 === 0) && <button onClick={() => setPage((prev) => prev - 1)} className='bg-gray-300 font-bold hover:bg-gray-400 p-2 rounded-md leading-none'>{"<"}</button>}
                        {!(pageCache[page - 1]?.isLastPage) && <button onClick={() => setPage((prev) => prev + 1)} className='bg-gray-300 font-bold hover:bg-gray-400 p-2 rounded-md leading-none'>{">"}</button>}

                        {/* </>} */}
                    </div >
                </>)}
        </>
    );
}

export default Archives;