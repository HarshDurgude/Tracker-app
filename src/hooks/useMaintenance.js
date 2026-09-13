import React, { useState } from 'react'
import * as utils from "../utils/taskUtils"
import * as firebaseService from "../services/firebaseService";


export default function useMaintainance(user, setTasks) {

    const [fetching, setFetching] = useState(false);

    async function cleanupFirebase(expiredTasks) {

        try {
            const nextIndex = await firebaseService.getNextIndex(user.uid, "archives");
            await firebaseService.archiveExpiredTasksBatch(user.uid, expiredTasks, nextIndex);
        } catch (e) {
            console.log(e);
        }

    }


    async function loadTasks() {
        try {
            setFetching(true);

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

            const expiredTasks = loadedTasks.filter(
                task => task.status && task.completedDate !== todayDate
            );

            const activeTasks = loadedTasks.filter(
                task => !expiredTasks.includes(task)
            );

            setTasks(activeTasks);

            if (expiredTasks.length > 0) {
                cleanupFirebase(expiredTasks);
            }

        } catch (e) {
            console.log("LOAD ERROR:", e);
        } finally {
            setFetching(false);
        }
    }


    return { loadTasks, fetching };
}
