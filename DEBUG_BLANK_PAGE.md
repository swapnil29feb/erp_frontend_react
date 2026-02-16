# Debugging Guide - Blank Page When Clicking Project

## Added Debug Logging

I've added comprehensive console logging to help identify the exact point where the issue occurs.

### How to Debug:

1. **Open Browser DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows)
   - Go to the "Console" tab

2. **Click on a Project**

3. **Check Console Logs** - You should see logs in this order:

```
🔍 Project clicked: <ProjectName> <ProjectID>
📦 Project details response: {...}
✅ Project data received: {...}
🔍 Fetching areas for project: <ProjectID>
📦 Areas response: {...}
✅ Areas merged: <number> areas
🚀 Calling onSelectProject with: {...}
🎨 ProjectManagement rendering: {...}
```

### What Each Log Means:

| Log | What It Checks | If Missing/Error |
|-----|---------------|------------------|
| 🔍 Project clicked | Function is called | onClick handler not working |
| 📦 Project details response | API call completed | Check network tab for failed request |
| ✅ Project data received | API returned success | Backend returned error |
| 🔍 Fetching areas | About to fetch areas | Previous step failed |
| 📦 Areas response | Areas API call completed | Check network tab |
| ✅ Areas merged | Areas successfully added | Check if response.data is valid |
| 🚀 Calling onSelectProject | About to update state | Check projectData structure |
| 🎨 ProjectManagement rendering | Component re-rendered | State not updating |

### Common Issues & Solutions:

#### 1. **API Response Structure Mismatch**
**Symptoms:** Logs show response but no data
**Check:**
- Look at `📦 Project details response` - check the structure
- Backend might return: `{ data: {...} }` or just `{...}`

**Solution:** Update api_manual.ts if needed

#### 2. **Areas API Endpoint Not Found (404)**
**Symptoms:** Error at `📦 Areas response`
**Check:**
- Network tab for the request to `/api/projects/areas/?project=<id>`
- Status code (404, 500, etc.)

**Solution:** Verify backend endpoint exists

#### 3. **CORS or Network Error**
**Symptoms:** Red error in console, request blocked
**Solution:** Check CORS headers on backend

#### 4. **Data Structure Different Than Expected**
**Symptoms:** Console shows errors about undefined properties
**Check:**
- The `projectData` object structure
- Whether `areas` is an array

**Solution:** May need to adjust data mapping

### Quick Tests in Console:

After clicking a project, try these in browser console:

```javascript
// Check if selectedProject exists in component state
// (You might need React DevTools for this)

// Check API directly
fetch('/api/projects/projects/1/')
  .then(r => r.json())
  .then(console.log)

fetch('/api/projects/areas/?project=1')
  .then(r => r.json())
  .then(console.log)
```

### Network Tab Checklist:

1. **Click project**
2. **Open Network tab** in DevTools
3. **Look for these requests:**
   - `GET /api/projects/projects/<id>/` - Should return 200
   - `GET /api/projects/areas/?project=<id>` - Should return 200 or []

4. **Click on each request** to see:
   - Response data structure
   - Status code
   - Any error messages

### If You See "Blank Page" Still:

**Check for:**
1. ❌ JavaScript errors (red text in Console)
2. ❌ Network errors (red in Network tab)
3. ❌ Component not rendering (check React DevTools)

**Specific Places to Look:**

| Problem | Location | What to Check |
|---------|----------|---------------|
| Blank after click | Console tab | Any red errors? |
| Nothing happens | Network tab | Are API calls made? Status codes? |
| Error in console | Console message | Read the error - often points to exact issue |
| Component not showing | React DevTools | Is AreaManagement in the tree? |

### Next Steps Based on Console Output:

**If logs stop at `🔍 Project clicked:`**
→ Issue in handleProjectClick function

**If logs stop at `📦 Project details response:`**
→ API call failed - check Network tab

**If logs show `⚠️ Failed to fetch...`**
→ API responded with error - check response data

**If logs complete but still blank:**
→ Rendering issue - check if selectedProject has correct structure

---

## Temporary Workaround (If All Else Fails):

If the API isn't returning areas, you can temporarily test with mock data:

1. Comment out the areas API call
2. Use mock data: `projectData.areas = []`
3. This will at least show the "No Areas Added" message

Let me know what you see in the console and we can solve it from there!
