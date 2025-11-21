# Xano Property Endpoints Setup

## Required Endpoints

Based on the code analysis, you need the following endpoints in your Xano workspace:

### 1. GET /properties
**Purpose**: Get all properties
**Method**: GET
**Table**: `properties`

**XanoScript**:
```yaml
name: properties
method: GET
table: properties
action: get_all
```

### 2. GET /properties/{id} or GET /property-view?id={id}
**Purpose**: Get a single property by ID
**Method**: GET
**Table**: `properties`

**Option A - Path Parameter**:
```yaml
name: properties
method: GET
table: properties
action: get_by_id
path_parameter: id
```

**Option B - Query Parameter** (like lead-view):
```yaml
name: property-view
method: GET
table: properties
action: get_by_id
query_parameter: id
```

### 3. POST /properties-new (Already exists based on code)
**Purpose**: Create a new property
**Method**: POST
**Table**: `properties`

### 4. PATCH /property-patch (Already exists based on code)
**Purpose**: Update a property
**Method**: PATCH
**Table**: `properties`

## Current Status

✅ **Working Endpoints**:
- POST /properties-new (creates properties)
- PATCH /property-patch (updates properties)

❌ **Missing Endpoints**:
- GET /properties (get all properties)
- GET /properties/{id} or GET /property-view?id={id} (get property by ID)

## Setup Instructions

1. **In Xano Dashboard**:
   - Go to your API group (workspace #5, API group: NeOYcc44)
   - Create the missing GET endpoints as shown above

2. **For GET /properties**:
   - Create a new endpoint named `properties`
   - Method: GET
   - Add a function block: "Get all records" from the `properties` table
   - Return the results

3. **For GET /properties/{id}**:
   - Create a new endpoint named `properties` with path parameter `{id}`
   - Method: GET
   - Add a function block: "Get record by ID" from the `properties` table
   - Use the path parameter as the ID
   - Return the result

   OR

   - Create a new endpoint named `property-view`
   - Method: GET
   - Add a query parameter `id`
   - Add a function block: "Get record by ID" from the `properties` table
   - Use the query parameter as the ID
   - Return the result

## Alternative: Include Property in Leads Response

Instead of creating separate property endpoints, you can configure the `/leads` endpoint to include property relations:

1. In your `/leads` GET endpoint
2. Add a function to get leads
3. Add a "Get related records" function to fetch properties for each lead
4. Return leads with property objects included

This would eliminate the need for separate property GET endpoints.


