# API Documentation - Multi-Mosque Teacher System

## Overview
This system enables teachers to teach in multiple mosques at different times, with the ability to track all their circles and students across different mosques.

## Available API Endpoints

### 1. List All Teachers
```
GET /api/teachers
```

**Description:** Fetch a list of all teachers with their basic information

**Optional Parameters:**
- `mosque_id` - Filter by mosque
- `is_active` - Filter by activity status
- `search` - Search by name
- `per_page` - Number of results per page (default: 15)

**Example Response:**
```json
{
  "success": true,
  "message": "Teachers list fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Ahmed Mohammed",
      "email": "ahmed@example.com",
      "phone_number": "0501234567",
      "mosque": "Al-Noor Mosque",
      "is_active": "Yes",
      "students_count": 25
    }
  ]
}
```

### 2. Specific Teacher Details
```
GET /api/teachers/{id}
```

**Description:** Fetch comprehensive details for a specific teacher

**Example Response:**
```json
{
  "success": true,
  "message": "Teacher details fetched successfully",
  "data": {
    "basic_info": {
      "id": 1,
      "name": "Ahmed Mohammed",
      "email": "ahmed@example.com",
      "phone_number": "0501234567",
      "mosque": {
        "id": 1,
        "name": "Al-Noor Mosque",
        "address": "Riyadh"
      }
    },
    "statistics": {
      "circle_name": "Fajr Circle",
      "total_students": 25,
      "current_month_attendance": 22
    }
  }
}
```

### 3. 🆕 Teacher's Mosques
```
GET /api/teachers/{id}/mosques
```

**Description:** Fetch all mosques where the teacher works with their schedules, circles, and students in each mosque

**Example Response:**
```json
{
  "success": true,
  "message": "Teacher's mosques fetched successfully",
  "data": {
    "teacher_info": {
      "id": 1,
      "name": "Ahmed Mohammed",
      "email": "ahmed@example.com",
      "phone_number": "0501234567"
    },
    "statistics": {
      "mosques_count": 3,
      "circles_count": 2,
      "total_students": 45
    },
    "mosques": [
      {
        "id": 1,
        "mosque_name": "Al-Noor Mosque",
        "address": "Al-Noor District - King Fahd Street",
        "type": "Main Mosque",
        "circles": [
          {
            "id": 1,
            "circle_name": "Fajr Circle",
            "level": "Advanced",
            "students_count": 25,
            "active_students": 23,
            "students": [
              {
                "id": 1,
                "name": "Mohammed Ahmed",
                "student_number": "ST001",
                "phone_number": "0501111111",
                "is_active": "Yes"
              }
            ]
          }
        ],
        "schedules": [
          {
            "id": 1,
            "day": "Sunday",
            "start_time": "05:30:00",
            "end_time": "07:00:00",
            "session_type": "Fajr",
            "notes": "Quran memorization for adults"
          }
        ]
      },
      {
        "id": 2,
        "mosque_name": "Al-Taqwa Mosque",
        "address": "Al-Malaz District - Al-Olaya Street",
        "type": "Secondary Mosque",
        "circles": [],
        "schedules": [
          {
            "id": 2,
            "day": "Tuesday",
            "start_time": "16:00:00",
            "end_time": "18:00:00",
            "session_type": "Asr",
            "notes": "Tafseer lessons"
          }
        ]
      }
    ]
  }
}
```

### 4. Teacher's Basic Circles
```
GET /api/teachers/{id}/circles
```

**Description:** Fetch teacher's circles with student details and progress

### 5. 🆕 Teacher's Detailed Circles
```
GET /api/teachers/{id}/circles-detailed
```

**Description:** Fetch all teacher's circles with comprehensive details about students, their progress, and attendance

**Example Response:**
```json
{
  "success": true,
  "message": "Teacher's circles with student details fetched successfully",
  "data": {
    "teacher_info": {
      "id": 1,
      "name": "Ahmed Mohammed"
    },
    "general_statistics": {
      "circles_count": 1,
      "total_students": 25
    },
    "circles": [
      {
        "id": 1,
        "circle_name": "Fajr Circle",
        "level": "Advanced",
        "mosque": {
          "id": 1,
          "name": "Al-Noor Mosque"
        },
        "statistics": {
          "students_count": 25,
          "active_students": 23,
          "average_attendance": 18.5
        },
        "students": [
          {
            "id": 1,
            "name": "Mohammed Ahmed",
            "student_number": "ST001",
            "phone_number": "0501111111",
            "is_active": "Yes",
            "current_curriculum": {
              "surah": "Al-Baqarah",
              "ayah": "255",
              "memorized_pages": 15,
              "target_pages": 30,
              "completion_percentage": 50.0
            },
            "monthly_attendance": {
              "attendance_days": 18,
              "attendance_rate": "85.7%"
            },
            "latest_progress": {
              "date": "2025-06-07",
              "memorized_pages": 2,
              "recitation_quality": "Excellent"
            }
          }
        ]
      }
    ]
  }
}
```

### 6. Teacher's Students via Circles
```
GET /api/teachers/{id}/students
```

**Description:** Fetch all students for a teacher across all their circles

### 7. Teacher's Search
```
GET /api/teachers/search
```

**Description:** Search for teachers with advanced filters

**Optional Parameters:**
- `name` - Teacher name
- `mosque_id` - Mosque ID
- `circle_level` - Circle level
- `is_active` - Activity status

### 8. Teacher's Attendance Record
```
GET /api/teachers/{id}/attendance
```

**Description:** Fetch teacher's attendance record

**Optional Parameters:**
- `start_date` - Start date
- `end_date` - End date
- `month` - Month
- `year` - Year

### 9. Teacher's Financial Data
```
GET /api/teachers/{id}/financials
```

**Description:** Fetch teacher's salaries and bonuses

## Usage Examples

### 1. Fetch a specific teacher's mosques
```bash
curl -X GET "http://your-domain.com/api/teachers/1/mosques"
```

### 2. Fetch teacher's circles with details
```bash
curl -X GET "http://your-domain.com/api/teachers/1/circles-detailed"
```

### 3. Search for teachers
```bash
curl -X GET "http://your-domain.com/api/teachers?search=Ahmed&mosque_id=1&is_active=1"
```

### 4. Fetch teacher's students
```bash
curl -X GET "http://your-domain.com/api/teachers/1/students"
```

### 5. Teacher attendance record
```bash
curl -X GET "http://your-domain.com/api/teachers/1/attendance?month=6&year=2025"
```

## New System Features

### ✅ Multiple Mosques
- Teachers can work in multiple mosques
- Each mosque has different schedules
- Independent circle management per mosque
- Consolidated student tracking across mosques

### ✅ Circle Management
- Multiple circles per teacher
- Different levels and age groups
- Flexible scheduling system
- Real-time student progress tracking

### ✅ Student Tracking
- Comprehensive student profiles
- Memorization progress tracking
- Attendance monitoring
- Performance analytics

### ✅ Smart Schedules
- Flexible time management
- Multiple sessions per day
- Conflict detection
- Automated scheduling optimization

## Status Codes

- `200` - Request successful
- `404` - Teacher not found
- `500` - Server error

## Important Notes

1. All dates are in `Y-m-d` format
2. All times are in `H:i:s` format
3. Percentages are displayed with two decimal places
4. Data is returned in Arabic in the original API

## Current Status

The system is currently under development and testing. Some endpoints may return sample data while the backend implementation is being completed.

### English Field Mapping

| Arabic Field | English Field |
|--------------|---------------|
| نجح | success |
| رسالة | message |
| البيانات | data |
| الاسم | name |
| البريد_الإلكتروني | email |
| رقم_الهاتف | phone_number |
| المسجد | mosque |
| نشط | is_active |
| عدد_الطلاب | students_count |
| اسم_المسجد | mosque_name |
| العنوان | address |
| اسم_الحلقة | circle_name |
| المستوى | level |
| الطلاب_النشطون | active_students |
| متوسط_الحضور | average_attendance |
| رقم_الطالب | student_number |
| السورة | surah |
| الآية | ayah |
| الصفحات_المحفوظة | memorized_pages |
| الصفحات_المستهدفة | target_pages |
| نسبة_الإنجاز | completion_percentage |
| أيام_الحضور | attendance_days |
| نسبة_الحضور | attendance_rate |
| جودة_التسميع | recitation_quality |

## API Integration Guide

### Authentication
Most endpoints require authentication. Include the bearer token in your requests:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://your-domain.com/api/teachers/1
```

### Error Handling
The API returns consistent error messages:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

### Pagination
For endpoints that return lists, use pagination parameters:
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 15)
- `total` - Total number of items
- `last_page` - Last page number

### Response Format
All responses follow this structure:
```json
{
  "success": boolean,
  "message": "string",
  "data": object|array,
  "meta": {
    "current_page": number,
    "per_page": number,
    "total": number,
    "last_page": number
  }
}
```
