import { useEffect, useState } from "react";
import * as utils from "../utils/taskUtils";
import * as firebaseService from "../services/firebaseService";

export default function useLazyLoad(user, tasks, setTasks) {

    const [page, setPage] = useState(1);
    const [pageCache, setPageCache] = useState([]);
    const [fetching, setFetching] = useState(false);


    useEffect(() => {

        if (!pageCache[page - 1]) return;

        updateCachedPage();

    }, [tasks]);


    async function lazyLoadPage() {

        if (pageCache[page - 1]) {
            setTasks(pageCache[page - 1].tasks);
            return;
        }

        setFetching(true);

        try {

            const querySnapshot = await firebaseService.fetchUserCollection(
                user.uid,
                "archives",
                {
                    limit: utils.LAZY_TASKS + 1,
                    startAfter: page === 1
                        ? null
                        : pageCache[page - 2].tasks[pageCache[page - 2].tasks.length - 1].index
                }
            );

            const fetchedTasks = querySnapshot.docs.map(docSnap => docSnap.data());

            const hasNextPage = fetchedTasks.length === utils.LAZY_TASKS + 1;

            const activeTasks = fetchedTasks.slice(0, utils.LAZY_TASKS);

            const newPageCache = {
                tasks: activeTasks,
                // lastIndex: activeTasks[activeTasks.length - 1],
                isLastPage: !hasNextPage
            };

            setPageCache(prev => {
                const updated = [...prev];
                updated[page - 1] = newPageCache;
                return updated;
            });

            setTasks(activeTasks);

        } catch (error) {

            console.log("LAZY LOAD ERROR:", error);

        } finally {

            setFetching(false);

        }
    }

    function updateCachedPage() {
        setPageCache(prev =>
            prev.map((cachedPage, index) => {
                if (index !== page - 1) return cachedPage;

                const taskRemoved = cachedPage.tasks.some(
                    cachedTask => !tasks.some(task => task.id === cachedTask.id)
                );

                if (!taskRemoved) return cachedPage;

                return {
                    ...cachedPage,
                    tasks
                };
            })
        );
    }


    return {
        page,
        pageCache,
        fetching,
        setPage,
        lazyLoadPage
    };
}