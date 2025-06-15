# Mosque API Documentation

## Overview
A comprehensive set of APIs (Application Programming Interfaces) has been developed for managing mosques and their relationships with teachers, circles, and students in the GARB system.

## Available Endpoints

### 1. Basic Mosque Management

#### List Mosques
```
GET /api/mosques
```
- **Description**: Fetch a list of all mosques with filtering and search capabilities
- **Optional Parameters**:
  - `search`: Search in mosque names
  - `district`: Filter by district
  - `per_page`: Number of results per page (default: 15)
  - `page`: Page number
- **Response**: Paginated list of mosques with basic information

**Example Response:**
```json
{
  "success": true,
  "message": "Mosques list fetched successfully",
  "data": [
    {
      "id": 1,
      "mosque_name": "Al-Noor Mosque",
      "district": "Al-Noor District",
      "street": "King Fahd Street",
      "phone": "0112345678",
      "coordinates": {
        "latitude": "24.7136",
        "longitude": "46.6753",
        "map_link": "https://maps.google.com/..."
      },
      "teachers_count": 5,
      "circles_count": 8,
      "students_count": 120,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-06-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 25,
    "last_page": 2
  }
}
```

#### Show Specific Mosque
```
GET /api/mosques/{id}
```
- **Description**: Fetch details of a specific mosque
- **Parameters**: `id` - Mosque identifier
- **Response**: Complete mosque details

**Example Response:**
```json
{
  "success": true,
  "message": "Mosque details fetched successfully",
  "data": {
    "id": 1,
    "mosque_name": "Al-Noor Mosque",
    "district": "Al-Noor District",
    "street": "King Fahd Street",
    "phone": "0112345678",
    "coordinates": {
      "latitude": "24.7136",
      "longitude": "46.6753",
      "map_link": "https://maps.google.com/..."
    },
    "statistics": {
      "teachers_count": 5,
      "circles_count": 8,
      "students_count": 120,
      "active_circles": 7,
      "average_attendance_rate": 85.5
    },
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-06-01T00:00:00Z"
  }
}
```

#### Create New Mosque
```
POST /api/mosques
```
- **Description**: Create a new mosque
- **Required Data**:
  ```json
  {
    "mosque_name": "Mosque Name",
    "district": "District Name",
    "street": "Street Name (optional)",
    "phone": "Phone Number (optional)",
    "coordinates": {
      "latitude": "Latitude (optional)",
      "longitude": "Longitude (optional)",
      "map_link": "Map Link (optional)"
    }
  }
  ```

**Example Request:**
```json
{
  "mosque_name": "Al-Taqwa Mosque",
  "district": "Al-Malaz District",
  "street": "Al-Olaya Street",
  "phone": "0112345679",
  "coordinates": {
    "latitude": "24.7236",
    "longitude": "46.6853",
    "map_link": "https://maps.google.com/..."
  }
}
```

#### Update Mosque
```
PUT /api/mosques/{id}
```
- **Description**: Update existing mosque data
- **Parameters**: `id` - Mosque identifier
- **Data**: Same as creation data

#### Delete Mosque
```
DELETE /api/mosques/{id}
```
- **Description**: Delete a mosque (with verification that no active circles exist)
- **Parameters**: `id` - Mosque identifier

### 2. Relationships & Related Data

#### Mosque Circles
```
GET /api/mosques/{id}/circles
```
- **Description**: Fetch all circles belonging to a specific mosque
- **Optional Parameters**:
  - `active_only`: Show only active circles (true/false)

**Example Response:**
```json
{
  "success": true,
  "message": "Mosque circles fetched successfully",
  "data": [
    {
      "id": 1,
      "circle_name": "Fajr Circle",
      "level": "Advanced",
      "teacher": {
        "id": 1,
        "name": "Ahmed Mohammed",
        "phone": "0501234567"
      },
      "students_count": 25,
      "active_students": 23,
      "schedule": {
        "day": "Sunday",
        "start_time": "05:30:00",
        "end_time": "07:00:00"
      },
      "is_active": true
    }
  ]
}
```

#### Mosque Teachers
```
GET /api/mosques/{id}/teachers
```
- **Description**: Fetch all teachers working in the mosque
- **Optional Parameters**:
  - `active_only`: Show only active teachers (true/false)

**Example Response:**
```json
{
  "success": true,
  "message": "Mosque teachers fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Ahmed Mohammed",
      "email": "ahmed@example.com",
      "phone": "0501234567",
      "circles": [
        {
          "id": 1,
          "circle_name": "Fajr Circle",
          "students_count": 25
        }
      ],
      "total_students": 25,
      "is_active": true
    }
  ]
}
```

#### Mosque Students
```
GET /api/mosques/{id}/students
```
- **Description**: Fetch all students enrolled in the mosque
- **Optional Parameters**:
  - `active_only`: Show only active students (true/false)

**Example Response:**
```json
{
  "success": true,
  "message": "Mosque students fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Mohammed Ahmed",
      "student_number": "ST001",
      "phone": "0501111111",
      "circle": {
        "id": 1,
        "circle_name": "Fajr Circle",
        "teacher": "Ahmed Mohammed"
      },
      "memorization_progress": {
        "current_surah": "Al-Baqarah",
        "current_ayah": "255",
        "memorized_pages": 15,
        "completion_percentage": 50.0
      },
      "attendance_rate": "85.7%",
      "is_active": true
    }
  ]
}
```

### 3. Statistics & Reports

#### Detailed Mosque Statistics
```
GET /api/mosques/{id}/statistics
```
- **Description**: Comprehensive statistics for a specific mosque including:
  - Number of circles (total and active)
  - Number of teachers and students
  - Attendance statistics
  - Performance averages

**Example Response:**
```json
{
  "success": true,
  "message": "Mosque statistics fetched successfully",
  "data": {
    "mosque_info": {
      "id": 1,
      "mosque_name": "Al-Noor Mosque",
      "district": "Al-Noor District"
    },
    "totals": {
      "teachers_count": 5,
      "circles_count": 8,
      "active_circles": 7,
      "students_count": 120,
      "active_students": 115
    },
    "attendance": {
      "daily_average": 95,
      "monthly_average": 85.5,
      "attendance_rate": "89.2%"
    },
    "performance": {
      "average_memorization_progress": 65.8,
      "students_completed_goals": 45,
      "top_performing_circles": [
        {
          "circle_name": "Fajr Circle",
          "performance_score": 92.5
        }
      ]
    },
    "financial": {
      "monthly_expenses": 15000,
      "teacher_salaries": 12000,
      "operational_costs": 3000
    }
  }
}
```

#### Monthly Reports
```
GET /api/mosques/{id}/reports/monthly
```
- **Description**: Monthly report for mosque activities
- **Optional Parameters**:
  - `month`: Specific month (1-12)
  - `year`: Specific year

#### Attendance Reports
```
GET /api/mosques/{id}/reports/attendance
```
- **Description**: Detailed attendance reports
- **Optional Parameters**:
  - `start_date`: Start date (Y-m-d)
  - `end_date`: End date (Y-m-d)
  - `circle_id`: Specific circle

### 4. Advanced Features

#### Search Mosques with Filters
```
GET /api/mosques/search
```
- **Description**: Advanced search with multiple filters
- **Parameters**:
  - `name`: Mosque name
  - `district`: District name
  - `has_teachers`: Has active teachers (true/false)
  - `min_students`: Minimum number of students
  - `max_students`: Maximum number of students

#### Nearby Mosques
```
GET /api/mosques/nearby
```
- **Description**: Find mosques near a specific location
- **Parameters**:
  - `latitude`: Latitude coordinate
  - `longitude`: Longitude coordinate
  - `radius`: Search radius in kilometers (default: 5)

### 5. Bulk Operations

#### Bulk Create Mosques
```
POST /api/mosques/bulk
```
- **Description**: Create multiple mosques at once
- **Data**: Array of mosque objects

#### Export Mosque Data
```
GET /api/mosques/export
```
- **Description**: Export mosque data in various formats
- **Parameters**:
  - `format`: Export format (csv, excel, pdf)
  - `include`: Data to include (teachers, students, statistics)

## Data Models

### Mosque Model
```json
{
  "id": "integer",
  "mosque_name": "string",
  "district": "string",
  "street": "string|null",
  "phone": "string|null",
  "coordinates": {
    "latitude": "string|null",
    "longitude": "string|null",
    "map_link": "string|null"
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Statistics Model
```json
{
  "teachers_count": "integer",
  "circles_count": "integer",
  "active_circles": "integer",
  "students_count": "integer",
  "active_students": "integer",
  "attendance_rate": "float",
  "performance_score": "float"
}
```

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

### Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad request
- `404` - Mosque not found
- `422` - Validation error
- `500` - Server error

## Authentication

Most endpoints require authentication. Include the bearer token in your requests:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://your-domain.com/api/mosques
```

## Usage Examples

### 1. Get all mosques in a district
```bash
curl -X GET "http://your-domain.com/api/mosques?district=Al-Noor&per_page=20"
```

### 2. Create a new mosque
```bash
curl -X POST "http://your-domain.com/api/mosques" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mosque_name": "Al-Taqwa Mosque",
    "district": "Al-Malaz District",
    "street": "Al-Olaya Street",
    "phone": "0112345679"
  }'
```

### 3. Get mosque statistics
```bash
curl -X GET "http://your-domain.com/api/mosques/1/statistics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Search for mosques
```bash
curl -X GET "http://your-domain.com/api/mosques/search?name=Al-Noor&min_students=50"
```

### 5. Get nearby mosques
```bash
curl -X GET "http://your-domain.com/api/mosques/nearby?latitude=24.7136&longitude=46.6753&radius=10"
```

## Best Practices

1. **Pagination**: Always use pagination for large datasets
2. **Filtering**: Use appropriate filters to reduce response size
3. **Caching**: Cache frequently accessed data on the client side
4. **Error Handling**: Always handle errors gracefully
5. **Authentication**: Secure all sensitive endpoints with proper authentication

## Field Mapping (Arabic to English)

| Arabic Field | English Field |
|--------------|---------------|
| نجح | success |
| رسالة | message |
| البيانات | data |
| اسم_المسجد | mosque_name |
| الحي | district |
| الشارع | street |
| رقم_الهاتف | phone |
| الإحداثيات | coordinates |
| خط_العرض | latitude |
| خط_الطول | longitude |
| رابط_الخريطة | map_link |
| عدد_المعلمين | teachers_count |
| عدد_الحلقات | circles_count |
| عدد_الطلاب | students_count |
| الحلقات_النشطة | active_circles |
| الطلاب_النشطون | active_students |
| نسبة_الحضور | attendance_rate |
| درجة_الأداء | performance_score |

## Integration Notes

- All dates follow ISO 8601 format
- Times are in 24-hour format (HH:mm:ss)
- Coordinates use decimal degrees format
- Phone numbers should include country code
- All text fields support UTF-8 encoding for Arabic content
