# Plan of Action - Saarthi Track v1 Learning Project

## 🗄️ MongoDB Setup (No Docker Required)

This project uses MongoDB without Docker. You have two options:

### Option 1: Local MongoDB Installation
1. Download MongoDB Community Server from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Install MongoDB on your system
3. Start MongoDB service (usually starts automatically on Windows)
4. Connection string: `mongodb://localhost:27017/bus-track-learning`

### Option 2: MongoDB Atlas (Cloud - Free Tier Available)
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 Sandbox)
3. Create database user and set password
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get connection string from "Connect" button
6. Format: `mongodb+srv://username:password@cluster.mongodb.net/bus-track-learning`

**Recommendation:** Use MongoDB Atlas for learning - it's free, no installation needed, and works from anywhere.

---

## 📋 Current Status (What's Completed)

### ✅ Completed Components

1. **Project Setup**
   - ✅ Express server with basic middleware (helmet, cors, compression, morgan)
   - ✅ Socket.io initialization (but not implemented yet)
   - ✅ MongoDB connection setup (`config/db.js`)
   - ✅ Basic error handling middleware
   - ✅ Package.json with dependencies

2. **User Authentication**
   - ✅ User model (`models/User.js`) with:
     - Role-based fields (admin, officer, driver, conductor)
     - Password hashing with bcrypt
     - Email/phone validation
     - Employee ID auto-generation
   - ✅ Auth controller (`controllers/auth.controller.js`) with:
     - Register endpoint (has bugs to fix)
     - Login endpoint
     - Me endpoint (get current user)
   - ✅ Auth routes (`routes/auth.routes.js`)
   - ✅ Auth middleware (`middleware/auth.middleware.js`) - has bugs
   - ✅ Role middleware (`middleware/role.middleware.js`) - has bugs

3. **Utilities**
   - ✅ JWT utilities (`utils/jwt.js`) - complete
   - ✅ Helper functions (`utils/helpers.js`) - complete
   - ⚠️ Logger (`utils/logger.js`) - empty file

4. **Configuration**
   - ✅ Database connection (`config/db.js`)
   - ⚠️ Socket.io config (`config/socket.js`) - empty file

---

## 🐛 Bugs to Fix First

### Priority 1: Critical Bugs

1. **`auth.controller.js` - Register function**
   - ❌ Line 62: `refreshToken.create()` should be `RefreshToken.create()` (model not imported)
   - ❌ Line 83: `error` variable used but should be `err`
   - ❌ Missing `stationIds` handling in register
   - ❌ Missing validation for stationIds when role is "officer"

2. **`auth.middleware.js`**
   - ❌ Line 13: `startWith` should be `startsWith` (typo)
   - ❌ Line 46: `error.message` should be `err.message` (variable name mismatch)
   - ❌ Line 70: `req.user.id` should be `req.user.userId` (inconsistent property)

3. **`role.middleware.js`**
   - ❌ Line 8: Parameters reversed - should be `(req, res, next)` not `(res, req, next)`
   - ❌ Line 34: `modules.exports` should be `module.exports` (typo)

4. **`jwt.js` - verifyToken function**
   - ❌ Line 86: Missing `return` statement - should return decoded token

5. **`server.js`**
   - ⚠️ Socket.io initialized but `initializeSocket(io)` not called
   - ⚠️ Missing morgan logging setup

---

## 📝 Next Steps - Implementation Plan

### Phase 1: Fix Existing Bugs (Day 1)
**Goal:** Make existing code work correctly

1. Fix all bugs listed above
2. Test authentication endpoints (register, login, me)
3. Verify middleware works correctly

---

### Phase 2: Create Core Models (Day 3-4)
**Goal:** Set up database schemas

1. **Station Model** (`models/Station.js`)
   - Name, code, location (lat/long), type, facilities
   - Indexes for name, code, location

2. **Bus Model** (`models/Bus.js`)
   - Number, capacity, type, status, manufacturer, model, year
   - Registration number, isActive

3. **Route Model** (`models/Route.js`)
   - Name, origin, destination, stops array
   - Total distance, estimated duration
   - Validation for stops (sequential order, no duplicates)

4. **RefreshToken Model** (`models/RefreshToken.js`)
   - Token, user reference, expiresAt
   - Indexes for token and user

5. **Assignment Model** (`models/Assignment.js`)
   - Bus, route, driver, conductor references
   - Status (active, completed, cancelled)
   - Scheduled time, actual start/end times
   - Current station tracking

6. **Request Model** (`models/Request.js`)
   - Assignment reference
   - Type (departure, arrival)
   - Station reference
   - Status (pending, approved, rejected)
   - Officer who approved/rejected
   - Timestamps

---

### Phase 3: Complete Socket.io Implementation (Day 2)
**Goal:** Set up real-time communication

1. **Implement `config/socket.js`**
   - Socket.io connection handling
   - Authentication for socket connections
   - Room management (assignments, stations)
   - Event handlers for:
     - `request:created`
     - `request:approved`
     - `request:rejected`
     - `assignment:updated`
     - `bus:approaching`

2. **Update `server.js`**
   - Call `initializeSocket(io)` after socket initialization
   
---

### Phase 4: Create Controllers (Day 5-7)
**Goal:** Implement business logic

1. **Station Controller** (`controllers/station.controller.js`)
   - `getAllStations` - Get all active stations
   - `getStationById` - Get station by ID
   - `createStation` - Create new station (admin only)
   - `updateStation` - Update station (admin only)
   - `deleteStation` - Soft delete station (admin only)

2. **Bus Controller** (`controllers/bus.controller.js`)
   - `getAllBuses` - Get all buses (with filters)
   - `getBusById` - Get bus by ID
   - `createBus` - Create new bus (admin/officer)
   - `updateBus` - Update bus (admin/officer)
   - `deleteBus` - Soft delete bus (admin only)

3. **Route Controller** (`controllers/route.controller.js`)
   - `getAllRoutes` - Get all routes
   - `getRouteById` - Get route with populated stops
   - `createRoute` - Create route (admin/officer)
   - `updateRoute` - Update route (admin/officer)
   - `deleteRoute` - Soft delete route (admin only)

4. **Assignment Controller** (`controllers/assignment.controller.js`)
   - `getAllAssignments` - Get assignments (filtered by role)
   - `getActiveAssignments` - Get active assignments only
   - `getAssignmentById` - Get assignment details
   - `createAssignment` - Create new assignment (admin/officer)
   - `updateAssignment` - Update assignment status
   - `deleteAssignment` - Cancel assignment (admin/officer)

5. **Request Controller** (`controllers/request.controller.js`)
   - `createRequest` - Create departure/arrival request (driver/conductor)
   - `getPendingRequests` - Get pending requests (officer/admin)
   - `approveRequest` - Approve request (officer/admin)
   - `rejectRequest` - Reject request (officer/admin)
   - `getMyRequests` - Get requests for current assignment (driver/conductor)

6. **User Controller** (`controllers/user.controller.js`)
   - `getAllUsers` - Get all users (admin only)
   - `getUserById` - Get user by ID
   - `updateUser` - Update user (admin only)
   - `deactivateUser` - Deactivate user (admin only)

7. **Update Auth Controller**
   - Fix register function
   - Add refresh token endpoint
   - Add logout endpoint (invalidate refresh token)

---

### Phase 5: Create Routes (Day 8)
**Goal:** Set up API endpoints

1. **Station Routes** (`routes/station.routes.js`)
   - GET `/stations` - Get all stations
   - GET `/stations/:id` - Get station by ID
   - POST `/stations` - Create station (admin)
   - PUT `/stations/:id` - Update station (admin)
   - DELETE `/stations/:id` - Delete station (admin)

2. **Bus Routes** (`routes/bus.routes.js`)
   - GET `/buses` - Get all buses
   - GET `/buses/:id` - Get bus by ID
   - POST `/buses` - Create bus (admin/officer)
   - PUT `/buses/:id` - Update bus (admin/officer)
   - DELETE `/buses/:id` - Delete bus (admin)

3. **Route Routes** (`routes/route.routes.js`)
   - GET `/routes` - Get all routes
   - GET `/routes/:id` - Get route by ID
   - POST `/routes` - Create route (admin/officer)
   - PUT `/routes/:id` - Update route (admin/officer)
   - DELETE `/routes/:id` - Delete route (admin)

4. **Assignment Routes** (`routes/assignment.routes.js`)
   - GET `/assignments` - Get all assignments
   - GET `/assignments/active` - Get active assignments
   - GET `/assignments/:id` - Get assignment by ID
   - POST `/assignments` - Create assignment (admin/officer)
   - PUT `/assignments/:id` - Update assignment
   - DELETE `/assignments/:id` - Cancel assignment

5. **Request Routes** (`routes/request.routes.js`)
   - POST `/requests` - Create request (driver/conductor)
   - GET `/requests/pending` - Get pending requests (officer/admin)
   - POST `/requests/:id/approve` - Approve request (officer/admin)
   - POST `/requests/:id/reject` - Reject request (officer/admin)
   - GET `/requests/my` - Get my requests (driver/conductor)

6. **User Routes** (`routes/user.routes.js`)
   - GET `/users` - Get all users (admin)
   - GET `/users/:id` - Get user by ID (admin)
   - PUT `/users/:id` - Update user (admin)
   - DELETE `/users/:id` - Deactivate user (admin)

7. **Update Auth Routes**
   - POST `/auth/refresh` - Refresh access token
   - POST `/auth/logout` - Logout (invalidate refresh token)

8. **Update `server.js`**
   - Register all new routes

---

### Phase 6: Add Validation Middleware (Day 9)
**Goal:** Validate request data

1. Create validation files in `middleware/validators/`:
   - `auth.validator.js` - Login, register validation
   - `station.validator.js` - Station CRUD validation
   - `bus.validator.js` - Bus CRUD validation
   - `route.validator.js` - Route CRUD validation
   - `assignment.validator.js` - Assignment validation
   - `request.validator.js` - Request validation
   - `user.validator.js` - User validation

2. Use `express-validator` for all validations
3. Apply validations to all routes

---

### Phase 7: Error Handling & Logging (Day 10)
**Goal:** Improve error handling and logging

1. **Complete `utils/logger.js`**
   - Set up winston or similar logging library
   - Log levels: error, warn, info, debug
   - File logging for production

2. **Improve Error Handling**
   - Custom error classes
   - Better error messages
   - Error logging

---

### Phase 8: Testing & Documentation (Day 11-12)
**Goal:** Ensure everything works

1. **Manual Testing**
   - Test all endpoints with Postman/Thunder Client
   - Test authentication flow
   - Test role-based access
   - Test Socket.io events

2. **Fix Issues**
   - Fix any bugs found during testing
   - Improve error messages
   - Add missing validations

3. **Documentation**
   - Update README with API documentation
   - Add environment variable documentation
   - Add setup instructions

---

## 🎯 Learning Focus Areas

As you implement each phase, focus on understanding:

1. **MongoDB/Mongoose**
   - Schema design and relationships
   - Indexes and query optimization
   - Pre/post hooks and validation

2. **Express.js**
   - Middleware patterns
   - Route organization
   - Error handling

3. **JWT Authentication**
   - Token generation and verification
   - Refresh token pattern
   - Token storage strategies

4. **Socket.io**
   - Connection handling
   - Room management
   - Event emission and listening

5. **Validation**
   - Input validation patterns
   - Error message formatting
   - Custom validators

---

## 📚 Recommended Order for Learning

1. **Start with Phase 1** - Fix bugs to understand existing code
2. **Then Phase 3** - Models are foundation, understand them first
3. **Then Phase 4** - Controllers show business logic
4. **Then Phase 5** - Routes tie everything together
5. **Then Phase 2** - Socket.io adds real-time layer
6. **Then Phase 6-8** - Polish and testing

---

## 💡 Tips

- **One file at a time**: Don't try to implement everything at once
- **Test as you go**: After each controller/route, test it
- **Refer to main project**: Compare with `saarthi-track` to understand patterns
- **Read error messages**: They tell you exactly what's wrong
- **Use Postman/Thunder Client**: Test APIs as you build them
- **Console.log is your friend**: Debug by logging values

---

## 🚀 Quick Start Commands

### Prerequisites Setup

**1. Install MongoDB (Choose one option):**

**Option A: MongoDB Local Installation**
- Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service
- Default connection: `mongodb://localhost:27017/bus-track-learning`

**Option B: MongoDB Atlas (Cloud - Recommended for Learning)**
- Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/bus-track-learning`)

**2. Setup Project:**

```bash
# Navigate to backend folder
cd F:\Projects\saarthi-track-v1\backend

# Install dependencies
npm install

# Create .env file
# Copy from main project or create manually
cp F:\Projects\saarthi-track\backend\env.example .env

# Edit .env file and update MongoDB connection:
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/bus-track-learning
# 
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bus-track-learning

# Run development server
npm run dev
```

### Environment Variables (.env file)

Create a `.env` file in `backend/` folder with:

```env
NODE_ENV=development
PORT=5000
API_VERSION=v1

# MongoDB Connection (choose one)
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/bus-track-learning
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bus-track-learning

# JWT Secrets (generate random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS (for frontend connection)
CORS_ORIGIN=http://localhost:5173
SOCKET_IO_CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

**Note:** Replace `your-super-secret-jwt-key-change-this` with a strong random string. You can generate one using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

**Good luck with your learning journey! 🎓**

