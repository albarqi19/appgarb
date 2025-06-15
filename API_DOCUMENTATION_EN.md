# Comprehensive API Documentation for Teachers, Students, and Circles

## Overview
This guide outlines all available endpoints in the API for the comprehensive system for managing teachers, students, and circles in English.

## Basic Structure
- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Language**: Arabic (original) / English (translation)

## Unified Response
All responses follow this pattern:
```json
{
    "success": true/false,
    "message": "Message text",
    "data": {},
    "pagination": {} // Only for paginated queries
}
```

---

## 1. Teacher APIs

### 1.1 Teachers List
**GET** `/api/teachers`

**Query Parameters:**
- `mosque_id` (optional): Mosque identifier
- `is_active` (optional): Activity status (true/false)
- `search` (optional): Search by name
- `per_page` (optional): Number of items per page (default: 15)
- `page` (optional): Page number

**Example Request:**
```bash
GET /api/teachers?mosque_id=1&is_active=true&search=Ahmed&per_page=10
```

**Example Response:**
```json
{
    "success": true,
    "message": "Teachers list fetched successfully",
    "data": [
        {
            "id": 1,
            "name": "Ahmed Mohammed Ali",
            "email": "ahmed@email.com",
            "phone": "0501234567",
            "national_id": "1234567890",
            "mosque": {
                "id": 1,
                "name": "Al-Noor Mosque",
                "district": "Al-Noor District"
            },
            "circles_count": 2,
            "students_count": 45,
            "is_active": true,
            "joined_date": "2025-01-15",
            "last_login": "2025-06-08T10:30:00Z"
        }
    ],
    "pagination": {
        "current_page": 1,
        "per_page": 10,
        "total": 25,
        "last_page": 3
    }
}
```

### 1.2 Teacher Details
**GET** `/api/teachers/{id}`

**Parameters:**
- `id`: Teacher identifier

**Example Response:**
```json
{
    "success": true,
    "message": "Teacher details fetched successfully",
    "data": {
        "basic_info": {
            "id": 1,
            "name": "Ahmed Mohammed Ali",
            "email": "ahmed@email.com",
            "phone": "0501234567",
            "national_id": "1234567890",
            "bio": "Experienced Quran teacher with 10 years of experience",
            "joined_date": "2025-01-15",
            "is_active": true
        },
        "mosque_info": {
            "id": 1,
            "name": "Al-Noor Mosque",
            "district": "Al-Noor District",
            "role": "Lead Teacher"
        },
        "statistics": {
            "circles_count": 2,
            "total_students": 45,
            "active_students": 42,
            "completion_rate": 85.5,
            "average_attendance": 92.3
        },
        "performance": {
            "monthly_score": 95.2,
            "student_satisfaction": 4.8,
            "punctuality_rate": 98.5
        }
    }
}
```

### 1.3 Teacher's Mosques
**GET** `/api/teachers/{id}/mosques`

**Description:** Fetch all mosques where the teacher works

**Example Response:**
```json
{
    "success": true,
    "message": "Teacher's mosques fetched successfully",
    "data": {
        "teacher_info": {
            "id": 1,
            "name": "Ahmed Mohammed"
        },
        "statistics": {
            "mosques_count": 2,
            "total_circles": 3,
            "total_students": 65
        },
        "mosques": [
            {
                "id": 1,
                "mosque_name": "Al-Noor Mosque",
                "district": "Al-Noor District",
                "circles": [
                    {
                        "id": 1,
                        "circle_name": "Fajr Circle",
                        "level": "Advanced",
                        "students_count": 25
                    }
                ],
                "schedule": [
                    {
                        "day": "Sunday",
                        "start_time": "05:30:00",
                        "end_time": "07:00:00",
                        "session_type": "Fajr"
                    }
                ]
            }
        ]
    }
}
```

### 1.4 Teacher's Circles
**GET** `/api/teachers/{id}/circles`

**Description:** Basic teacher circles information

### 1.5 Teacher's Detailed Circles
**GET** `/api/teachers/{id}/circles-detailed`

**Description:** Comprehensive teacher circles with student details

### 1.6 Teacher's Students
**GET** `/api/teachers/{id}/students`

**Description:** All students across teacher's circles

---

## 2. Student APIs

### 2.1 Students List
**GET** `/api/students`

**Query Parameters:**
- `mosque_id` (optional): Filter by mosque
- `circle_id` (optional): Filter by circle
- `teacher_id` (optional): Filter by teacher
- `is_active` (optional): Activity status
- `level` (optional): Student level
- `search` (optional): Search by name or student number

**Example Response:**
```json
{
    "success": true,
    "message": "Students list fetched successfully",
    "data": [
        {
            "id": 1,
            "name": "Mohammed Ahmed",
            "student_number": "ST001",
            "phone": "0501111111",
            "parent_phone": "0502222222",
            "age": 12,
            "level": "Intermediate",
            "circle": {
                "id": 1,
                "name": "Fajr Circle",
                "teacher": "Ahmed Mohammed"
            },
            "mosque": {
                "id": 1,
                "name": "Al-Noor Mosque"
            },
            "memorization_progress": {
                "current_surah": "Al-Baqarah",
                "current_ayah": 255,
                "memorized_pages": 15,
                "target_pages": 30,
                "completion_percentage": 50.0
            },
            "attendance": {
                "monthly_rate": "85.7%",
                "total_sessions": 20,
                "attended_sessions": 17
            },
            "is_active": true,
            "enrollment_date": "2025-02-01"
        }
    ]
}
```

### 2.2 Student Details
**GET** `/api/students/{id}`

### 2.3 Student's Memorization Progress
**GET** `/api/students/{id}/memorization`

### 2.4 Student's Attendance Record
**GET** `/api/students/{id}/attendance`

---

## 3. Circle APIs

### 3.1 Circles List
**GET** `/api/circles`

**Query Parameters:**
- `mosque_id` (optional): Filter by mosque
- `teacher_id` (optional): Filter by teacher
- `level` (optional): Filter by level
- `is_active` (optional): Activity status

### 3.2 Circle Details
**GET** `/api/circles/{id}`

### 3.3 Circle Students
**GET** `/api/circles/{id}/students`

### 3.4 Circle Statistics
**GET** `/api/circles/{id}/statistics`

---

## 4. Mosque APIs

### 4.1 Mosques List
**GET** `/api/mosques`

### 4.2 Mosque Details
**GET** `/api/mosques/{id}`

### 4.3 Mosque Teachers
**GET** `/api/mosques/{id}/teachers`

### 4.4 Mosque Students
**GET** `/api/mosques/{id}/students`

### 4.5 Mosque Circles
**GET** `/api/mosques/{id}/circles`

---

## 5. Attendance APIs

### 5.1 Record Attendance
**POST** `/api/attendance`

**Request Body:**
```json
{
    "student_id": 1,
    "circle_id": 1,
    "date": "2025-06-08",
    "status": "present", // present, absent, late, excused
    "notes": "Optional notes"
}
```

### 5.2 Bulk Attendance Recording
**POST** `/api/attendance/bulk`

**Request Body:**
```json
{
    "circle_id": 1,
    "date": "2025-06-08",
    "attendance_records": [
        {
            "student_id": 1,
            "status": "present"
        },
        {
            "student_id": 2,
            "status": "absent",
            "notes": "Sick"
        }
    ]
}
```

### 5.3 Get Today's Attendance
**GET** `/api/attendance/today`

**Query Parameters:**
- `circle_id` (optional): Specific circle
- `mosque_id` (optional): Specific mosque

### 5.4 Attendance Reports
**GET** `/api/attendance/reports`

**Query Parameters:**
- `start_date`: Start date (Y-m-d)
- `end_date`: End date (Y-m-d)
- `circle_id` (optional): Specific circle
- `student_id` (optional): Specific student

---

## 6. Authentication APIs

### 6.1 Teacher Login
**POST** `/api/auth/teacher/login`

**Request Body:**
```json
{
    "identity_number": "1234567890",
    "password": "password123"
}
```

### 6.2 Student Login
**POST** `/api/auth/student/login`

### 6.3 Parent Login
**POST** `/api/auth/parent/login`

### 6.4 Logout
**POST** `/api/auth/logout`

### 6.5 Refresh Token
**POST** `/api/auth/refresh`

---

## 7. Statistics & Reports APIs

### 7.1 General Statistics
**GET** `/api/statistics/general`

### 7.2 Teacher Performance
**GET** `/api/statistics/teachers`

### 7.3 Student Progress
**GET** `/api/statistics/students`

### 7.4 Mosque Performance
**GET** `/api/statistics/mosques`

---

## 8. Search APIs

### 8.1 Global Search
**GET** `/api/search`

**Query Parameters:**
- `query`: Search term
- `type`: Search type (teachers, students, circles, mosques)
- `limit`: Number of results (default: 10)

### 8.2 Advanced Search
**POST** `/api/search/advanced`

**Request Body:**
```json
{
    "teachers": {
        "name": "Ahmed",
        "mosque_id": 1,
        "is_active": true
    },
    "students": {
        "level": "Advanced",
        "min_attendance": 80
    },
    "circles": {
        "level": "Intermediate"
    }
}
```

---

## Error Handling

### Standard Error Response
```json
{
    "success": false,
    "message": "Error description",
    "errors": {
        "field_name": ["Validation error message"]
    },
    "error_code": "ERROR_CODE"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## Authentication

### Bearer Token
Include the token in the Authorization header:
```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Token Refresh
Tokens expire after 24 hours. Use the refresh endpoint to get a new token.

---

## Rate Limiting

- **General APIs**: 100 requests per minute
- **Authentication**: 10 requests per minute
- **Bulk Operations**: 20 requests per minute

---

## Field Mapping Reference

| Arabic Field | English Field | Description |
|--------------|---------------|-------------|
| نجح | success | Request success status |
| رسالة | message | Response message |
| البيانات | data | Response data |
| الاسم | name | Name |
| البريد_الإلكتروني | email | Email address |
| رقم_الهاتف | phone | Phone number |
| رقم_الهوية | national_id | National ID |
| المسجد | mosque | Mosque |
| الحلقة | circle | Circle |
| الطالب | student | Student |
| المعلم | teacher | Teacher |
| الحضور | attendance | Attendance |
| الغياب | absence | Absence |
| متأخر | late | Late |
| مستأذن | excused | Excused |
| حاضر | present | Present |
| غائب | absent | Absent |
| المستوى | level | Level |
| التقدم | progress | Progress |
| الحفظ | memorization | Memorization |
| السورة | surah | Surah |
| الآية | ayah | Ayah |
| الصفحة | page | Page |
| النسبة_المئوية | percentage | Percentage |
| التاريخ | date | Date |
| الوقت | time | Time |
| نشط | active | Active |
| غير_نشط | inactive | Inactive |

---

## Best Practices

### 1. Pagination
Always use pagination for large datasets:
```bash
GET /api/students?page=1&per_page=20
```

### 2. Filtering
Use specific filters to reduce response size:
```bash
GET /api/teachers?mosque_id=1&is_active=true
```

### 3. Error Handling
Always check the `success` field in responses:
```javascript
if (response.success) {
    // Handle success
    console.log(response.data);
} else {
    // Handle error
    console.error(response.message);
}
```

### 4. Caching
Cache frequently accessed data to improve performance.

### 5. Rate Limiting
Implement proper retry logic for rate-limited requests.

---

## SDKs and Libraries

### JavaScript/TypeScript
```javascript
// Example using fetch
const response = await fetch('/api/teachers', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
const data = await response.json();
```

### PHP
```php
// Example using cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/teachers');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
```

---

## Support and Contact

For API support and questions:
- **Documentation**: This file
- **Issues**: Create an issue in the repository
- **Contact**: Contact the development team

---

## Changelog

### Version 1.0.0 (2025-06-08)
- Initial API documentation
- Complete endpoint coverage
- Authentication system
- Error handling standards
