import React from 'react'
import * as utils from "../utils/taskUtils";
import * as firebaseService from "../services/firebaseService";


export default function useLoading(user) {


    async function cleanupFirebase(expiredTasks) {

        try {
            const nextIndex = await firebaseService.getNextIndex(user.uid, "archives");
            await firebaseService.archiveExpiredTasksBatch(user.uid, expiredTasks, nextIndex);
        } catch (e) {
            console.log(e);
        }


    }

    async function loadTasks(setTasks) {
        try {
            const querySnapshot = await firebaseService.fetchUserCollection(user.uid, "tasks");
            /*  querySnapshot.docs contains
                the array which has our all task list data, in order
                to access that data each element in querySnapshot.docs has a
                function .data(), querySnapshot.docs[0].data() --> (returns one task object containing all data fields,
                eg -> {id: '17790293017838f9bea49f94148', index: 0, title: 'wake up', status: false} )
             */

            // const todayDate = utils.getTodayDate(); // today's date -> ${year}-${month}-${day}
            const todayDate = "2026-09-15";

            const loadedTasks = querySnapshot.docs.map(docSnap => docSnap.data());
            const expiredTasks = loadedTasks.filter(task => task.status && task.completedDate !== todayDate);
            const activeTasks = loadedTasks.filter(task => !expiredTasks.includes(task));


            if (expiredTasks.length > 0) {
                cleanupFirebase(expiredTasks);
            }

            setTasks(activeTasks);

        } catch (e) {
            console.log("ERR : ", e);

        }
    }

    async function lazyLoadArchives(pageCache, page, setTasks, setPageCache) {
        if (pageCache[page - 1]) {
            setTasks(pageCache[page - 1].tasks);
        } else {

            const querySnapshot = await firebaseService.fetchUserCollection(user.uid, "archives", {
                limit: utils.LAZY_TASKS + 1,
                startAfter: (((page - 1) === 0) ? null : pageCache[page - 2].tasks[utils.LAZY_TASKS - 1].index)
            });

            const fetchedTasks = querySnapshot.docs.map(docSnap => docSnap.data());
            const hasNextPage = fetchedTasks.length === utils.LAZY_TASKS + 1;

            let activeTasks;
            let newPageCache;

            activeTasks = fetchedTasks.slice(0, utils.LAZY_TASKS);
            if ((page - 1) === 0) {
                if (hasNextPage) {
                    newPageCache = {
                        tasks: activeTasks,
                        isLastPage: false
                    }
                } else {
                    newPageCache = {
                        tasks: activeTasks,
                        isLastPage: true
                    }

                }
            } else {
                newPageCache = {
                    tasks: activeTasks,
                    isLastPage: !hasNextPage
                }
            }

            let cache = pageCache;

            cache[page - 1] = newPageCache;


            setTasks(activeTasks);
            setPageCache(cache);
        }


    }

    return { loadTasks, lazyLoadArchives };
}
