# Project Notes

## useTasks.js Hook
1. **State Management**:
   - `tasks`: State variable for storing task list.
   - `dropped`: Used to fix animation glitches during drag-and-drop operations.
   - `syncing`: Simulates syncing state when tasks are being added or updated.

2. **useEffect**:
   - Calls `loadTasks()` on component mount and only once due to an empty dependency array.

3. **Loading Tasks**:
   - Uses Firestore query with orderBy to get tasks in the correct order since Firestore doesn't store elements in order.
   - Accesses task data from querySnapshot using `.data()` method.

4. **Adding Tasks**:
   - Creates a unique ID for new tasks.
   - Uses `setDoc` instead of `addDoc` to allow custom IDs for Firebase documents.

5. **Deleting Tasks**:
   - React prefers creating new arrays instead of modifying existing ones for state changes.

6. **Toggling Task Status**:
   - Updates the status of a task, used for checkboxes.

7. **Drag and Drop**:
   - Reorders array based on drag-and-drop positions.
   - Uses `arrayMove` from DND Kit to handle reordering.

## Firebase Configuration
- Contains Firebase configuration settings including API key, auth domain, project ID, etc.
- TODO: Add SDKs for additional Firebase products as needed.

## App Component
1. **State Management**:
   - Input state is set to "" at first render and uses the state value on subsequent renders.

2. **Form Handling**:
   - Converts a div into a form and moves add task logic to `onsubmit` so pressing enter also creates tasks.
   - Uses `preventDefault()` to prevent browser refresh on form submit.

3. **Styling**:
   - Uses Tailwind CSS with `*:` selector to apply styles to all direct children.

4. **Conditional Rendering**:
   - Displays "syncing..." text when syncing state is true.

## TaskItem Component
1. **Drag and Drop**:
   - Makes a div the drag control point using DND Kit's listeners and attributes.
   - Uses arrow functions in event handlers to avoid immediate execution.